variable "aws_region" {
  description = "AWS region for the MinuteCryptic environment."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "This deployment currently supports us-east-1."
  }
}

variable "environment_name" {
  description = "Stable lowercase environment identifier used in resource names and tags."
  type        = string
  default     = "minutecryptic-production"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,30}$", var.environment_name))
    error_message = "environment_name must be 3-31 lowercase letters, digits, or hyphens and start with a letter."
  }
}

variable "instance_type" {
  description = "EC2 instance type for the static MinuteCryptic site."
  type        = string
  default     = "t3.micro"
}

variable "allowed_http_cidrs" {
  description = "IPv4 CIDR ranges permitted to access the public HTTP site."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "release_retention_days" {
  description = "Days to retain deployment archives in the private transfer bucket."
  type        = number
  default     = 7

  validation {
    condition     = var.release_retention_days >= 1 && floor(var.release_retention_days) == var.release_retention_days
    error_message = "release_retention_days must be a positive whole number."
  }
}
