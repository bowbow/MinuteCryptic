[CmdletBinding()]
param(
  [string]$AwsProfile = "default",
  [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$terraformDir = Join-Path $repoRoot "infra/aws"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found on PATH."
  }
}

function Terraform-Output([string]$Name) {
  $value = & terraform "-chdir=$terraformDir" output -raw $Name
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($value)) {
    throw "Terraform output '$Name' is unavailable. Provision infrastructure first."
  }
  return $value.Trim()
}

Require-Command "aws"
Require-Command "git"
Require-Command "npm"
Require-Command "tar.exe"
Require-Command "terraform"

$identity = aws sts get-caller-identity --profile $AwsProfile --output json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or -not $identity.Account) {
  throw "AWS profile '$AwsProfile' could not be authenticated."
}
Write-Host "Authenticated to AWS account $($identity.Account) as $($identity.Arn)."

$previousProfile = $env:AWS_PROFILE
$previousRegion = $env:AWS_REGION
$archivePath = $null
$commandJsonPath = $null
$uploadedUri = $null

try {
  $env:AWS_PROFILE = $AwsProfile
  $env:AWS_REGION = $Region

  Write-Host "Running application checks..."
  & npm run lint
  if ($LASTEXITCODE -ne 0) { throw "Lint failed; deployment stopped." }
  & npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw "Type checking failed; deployment stopped." }
  & npm run validate:clues
  if ($LASTEXITCODE -ne 0) { throw "Clue validation failed; deployment stopped." }
  & npm test
  if ($LASTEXITCODE -ne 0) { throw "Tests failed; deployment stopped." }
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "Production build failed; deployment stopped." }

  $instanceId = Terraform-Output "instance_id"
  $bucket = Terraform-Output "release_bucket"
  $siteUrl = Terraform-Output "site_url"
  $healthUrl = Terraform-Output "health_url"

  $revision = (& git -C $repoRoot rev-parse --short HEAD).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($revision)) {
    $revision = "workspace"
  }

  $releaseId = "$([DateTime]::UtcNow.ToString('yyyyMMddHHmmss'))-$revision"
  $archivePath = Join-Path ([System.IO.Path]::GetTempPath()) "minutecryptic-$releaseId.tar.gz"

  Write-Host "Packaging static release $releaseId..."
  & tar.exe -czf $archivePath -C $repoRoot dist scripts/remote-deploy.sh
  if ($LASTEXITCODE -ne 0) { throw "Release packaging failed." }

  $hash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
  $key = "releases/$releaseId.tar.gz"
  $uploadedUri = "s3://$bucket/$key"

  & aws s3 cp $archivePath $uploadedUri --profile $AwsProfile --region $Region --only-show-errors
  if ($LASTEXITCODE -ne 0) { throw "Uploading the release archive failed." }

  Write-Host "Waiting for the instance to be online in Systems Manager..."
  $managed = $false
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    $ping = aws ssm describe-instance-information --profile $AwsProfile --region $Region `
      --filters "Key=InstanceIds,Values=$instanceId" --query 'InstanceInformationList[0].PingStatus' --output text
    if ($LASTEXITCODE -eq 0 -and $ping.Trim() -eq "Online") {
      $managed = $true
      break
    }
    Start-Sleep -Seconds 5
  }
  if (-not $managed) { throw "Instance $instanceId did not become available in Systems Manager." }

  $remoteWork = "/tmp/minutecryptic-$releaseId"
  $commands = @(
    "set -euo pipefail",
    "rm -rf '$remoteWork' && install -d -m 0700 '$remoteWork'",
    "aws s3 cp '$uploadedUri' '$remoteWork/release.tar.gz' --region '$Region' --only-show-errors",
    "tar -xOf '$remoteWork/release.tar.gz' 'scripts/remote-deploy.sh' > '$remoteWork/remote-deploy.sh'",
    "chmod 0700 '$remoteWork/remote-deploy.sh'",
    "bash -n '$remoteWork/remote-deploy.sh'",
    "bash '$remoteWork/remote-deploy.sh' '$remoteWork/release.tar.gz' '$releaseId' '$hash'",
    "rm -rf '$remoteWork'"
  )

  $commandInput = @{
    DocumentName = "AWS-RunShellScript"
    InstanceIds = @($instanceId)
    Comment = "Deploy MinuteCryptic $releaseId"
    Parameters = @{ commands = $commands; executionTimeout = @("600") }
  }
  $commandJsonPath = Join-Path ([System.IO.Path]::GetTempPath()) "minutecryptic-command-$releaseId.json"
  $commandJson = $commandInput | ConvertTo-Json -Depth 6
  [System.IO.File]::WriteAllText($commandJsonPath, $commandJson, (New-Object System.Text.UTF8Encoding($false)))

  $commandId = aws ssm send-command --profile $AwsProfile --region $Region `
    --cli-input-json "file://$commandJsonPath" --query 'Command.CommandId' --output text
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commandId)) {
    throw "Could not start the remote deployment command."
  }
  Write-Host "Systems Manager command: $commandId"

  aws ssm wait command-executed --profile $AwsProfile --region $Region `
    --command-id $commandId --instance-id $instanceId

  $result = aws ssm get-command-invocation --profile $AwsProfile --region $Region `
    --command-id $commandId --instance-id $instanceId --output json | ConvertFrom-Json
  if ($result.StandardOutputContent) { Write-Host $result.StandardOutputContent }
  if ($result.StandardErrorContent) { Write-Warning $result.StandardErrorContent }
  if ($result.Status -ne "Success") {
    throw "Remote deployment ended with status $($result.Status)."
  }

  Write-Host "Checking public health at $healthUrl..."
  $healthResponse = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 10
  if ($healthResponse.StatusCode -ne 200 -or $healthResponse.Content.Trim() -ne "ok") {
    throw "Public health check failed after deployment."
  }

  $siteResponse = Invoke-WebRequest -Uri $siteUrl -TimeoutSec 10
  if ($siteResponse.StatusCode -ne 200 -or $siteResponse.Content -notmatch '<title>One Cryptic</title>') {
    throw "Public site check failed after deployment."
  }

  $assetMatch = [regex]::Match($siteResponse.Content, '<script[^>]+src="([^"]+)"')
  if (-not $assetMatch.Success) { throw "Deployed page does not reference its JavaScript bundle." }
  $assetResponse = Invoke-WebRequest -Uri "$siteUrl$($assetMatch.Groups[1].Value)" -TimeoutSec 10
  if ($assetResponse.StatusCode -ne 200 -or $assetResponse.Content.Length -eq 0) {
    throw "Public JavaScript bundle check failed after deployment."
  }

  Write-Host "Deployment succeeded: $siteUrl"
}
finally {
  if ($uploadedUri) {
    & aws s3 rm $uploadedUri --profile $AwsProfile --region $Region --only-show-errors 2>$null
  }
  if ($archivePath -and (Test-Path -LiteralPath $archivePath)) {
    Remove-Item -LiteralPath $archivePath -Force
  }
  if ($commandJsonPath -and (Test-Path -LiteralPath $commandJsonPath)) {
    Remove-Item -LiteralPath $commandJsonPath -Force
  }
  $env:AWS_PROFILE = $previousProfile
  $env:AWS_REGION = $previousRegion
}
