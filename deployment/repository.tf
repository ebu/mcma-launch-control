locals {
  repository_bucket_name = "${var.project_prefix}.repository"
  repository_url         = "https://s3${var.aws_region != "us-east-1" ? "-${var.aws_region}" : ""}.amazonaws.com/${local.repository_bucket_name}"
}

resource "aws_s3_bucket" "repository" {
  bucket        = local.repository_bucket_name
  acl           = "public-read"
  policy        = templatefile("policies/s3-public-read.json", {
    bucket_name = local.repository_bucket_name
  })
  force_destroy = true
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
