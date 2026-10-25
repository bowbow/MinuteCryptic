[CmdletBinding()]
param(
  [string]$AwsProfile = "default",
  [string]$Region = "us-east-1",
  [switch]$PlanOnly
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$terraformDir = Join-Path $repoRoot "infra/aws"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found on PATH."
  }
}

Require-Command "aws"
Require-Command "terraform"

Write-Host "Verifying AWS profile '$AwsProfile'..."
$identity = aws sts get-caller-identity --profile $AwsProfile --output json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or -not $identity.Account) {
  throw "AWS profile '$AwsProfile' could not be authenticated."
}
Write-Host "Authenticated to AWS account $($identity.Account) as $($identity.Arn)."

$previousProfile = $env:AWS_PROFILE
$previousRegion = $env:AWS_REGION
try {
  $env:AWS_PROFILE = $AwsProfile
  $env:AWS_REGION = $Region

  & terraform "-chdir=$terraformDir" init -input=false
  if ($LASTEXITCODE -ne 0) { throw "terraform init failed." }

  & terraform "-chdir=$terraformDir" fmt -check
  if ($LASTEXITCODE -ne 0) { throw "terraform formatting check failed." }

  & terraform "-chdir=$terraformDir" validate
  if ($LASTEXITCODE -ne 0) { throw "terraform validation failed." }

  $planPath = Join-Path $terraformDir "minutecryptic.tfplan"
  & terraform "-chdir=$terraformDir" plan -input=false "-out=$planPath" "-var=aws_region=$Region"
  if ($LASTEXITCODE -ne 0) { throw "terraform plan failed." }

  if ($PlanOnly) {
    Write-Host "Plan created at $planPath. No AWS resources were changed."
    return
  }

  & terraform "-chdir=$terraformDir" apply -input=false $planPath
  if ($LASTEXITCODE -ne 0) { throw "terraform apply failed." }

  Write-Host "MinuteCryptic infrastructure outputs:"
  & terraform "-chdir=$terraformDir" output
  if ($LASTEXITCODE -ne 0) { throw "Could not read Terraform outputs." }
}
finally {
  $env:AWS_PROFILE = $previousProfile
  $env:AWS_REGION = $previousRegion
}
