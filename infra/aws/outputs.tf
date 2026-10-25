output "instance_id" {
  description = "EC2 instance targeted by Systems Manager deployment commands."
  value       = aws_instance.minutecryptic.id
}

output "elastic_ip" {
  description = "Stable public IPv4 address for MinuteCryptic."
  value       = aws_eip.minutecryptic.public_ip
}

output "site_url" {
  description = "Initial public MinuteCryptic URL."
  value       = "http://${aws_eip.minutecryptic.public_ip}"
}

output "health_url" {
  description = "Public infrastructure health endpoint."
  value       = "http://${aws_eip.minutecryptic.public_ip}/health"
}

output "release_bucket" {
  description = "Private S3 bucket used only to transfer deployment archives."
  value       = aws_s3_bucket.releases.id
}

output "aws_region" {
  description = "AWS region containing the MinuteCryptic environment."
  value       = var.aws_region
}
