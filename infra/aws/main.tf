data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

data "aws_ssm_parameter" "amazon_linux_2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

locals {
  name_prefix = var.environment_name
  bucket_name = "${var.environment_name}-releases-${data.aws_caller_identity.current.account_id}-${var.aws_region}"
}

resource "aws_security_group" "minutecryptic" {
  name_prefix = "${local.name_prefix}-"
  description = "Public HTTP access for MinuteCryptic; administration uses Systems Manager"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "MinuteCryptic HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_http_cidrs
  }

  egress {
    description = "Package repositories and AWS APIs"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = "${local.name_prefix}-web" }
}

resource "aws_s3_bucket" "releases" {
  bucket = local.bucket_name

  tags = { Name = local.bucket_name }
}

resource "aws_s3_bucket_public_access_block" "releases" {
  bucket = aws_s3_bucket.releases.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "releases" {
  bucket = aws_s3_bucket.releases.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "releases" {
  bucket = aws_s3_bucket.releases.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "releases" {
  bucket = aws_s3_bucket.releases.id

  rule {
    id     = "expire-old-releases"
    status = "Enabled"

    filter { prefix = "releases/" }

    expiration { days = var.release_retention_days }
  }
}

resource "aws_s3_bucket_policy" "releases_tls_only" {
  bucket = aws_s3_bucket.releases.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource = [
        aws_s3_bucket.releases.arn,
        "${aws_s3_bucket.releases.arn}/*"
      ]
      Condition = {
        Bool = { "aws:SecureTransport" = "false" }
      }
    }]
  })
}

resource "aws_iam_role" "minutecryptic" {
  name = "${local.name_prefix}-ec2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${local.name_prefix}-ec2" }
}

resource "aws_iam_role_policy_attachment" "systems_manager" {
  role       = aws_iam_role.minutecryptic.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "release_bucket_read" {
  name = "release-bucket-read"
  role = aws_iam_role.minutecryptic.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.releases.arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.releases.arn}/releases/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "minutecryptic" {
  name = "${local.name_prefix}-ec2"
  role = aws_iam_role.minutecryptic.name
}

resource "aws_instance" "minutecryptic" {
  ami                         = data.aws_ssm_parameter.amazon_linux_2023.value
  instance_type               = var.instance_type
  subnet_id                   = sort(data.aws_subnets.default.ids)[0]
  vpc_security_group_ids      = [aws_security_group.minutecryptic.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.minutecryptic.name
  user_data                   = file("${path.module}/user-data.sh")
  user_data_replace_on_change = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    encrypted   = true
    volume_size = 8
    volume_type = "gp3"
  }

  depends_on = [aws_iam_role_policy_attachment.systems_manager]

  tags = { Name = local.name_prefix }
}

resource "aws_eip" "minutecryptic" {
  domain = "vpc"

  tags = { Name = local.name_prefix }
}

resource "aws_eip_association" "minutecryptic" {
  instance_id   = aws_instance.minutecryptic.id
  allocation_id = aws_eip.minutecryptic.id
}
