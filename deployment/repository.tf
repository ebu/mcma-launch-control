locals {
  repository_bucket_name = "${var.project_prefix}.repository"
  repository_url         = "https://s3${var.aws_region != "us-east-1" ? "-${var.aws_region}" : ""}.amazonaws.com/${local.repository_bucket_name}"
}

data "template_file" "s3_public_read_policy_repository" {
  template = file("policies/s3-public-read.json")

  vars = {
    bucket_name = local.repository_bucket_name
  }
}

resource "aws_s3_bucket" "repository" {
  bucket        = local.repository_bucket_name
  acl           = "public-read"
  policy        = data.template_file.s3_public_read_policy_repository.rendered
  force_destroy = true

  website {
    index_document = "index.html"
  }
}

resource "aws_s3_bucket_object" "module_aws_s3_bucket" {
  bucket       = aws_s3_bucket.repository.id
  key          = "aws_s3_bucket.zip"
  source       = "../modules/aws_s3_bucket/build/dist/module.zip"
  content_type = "application/zip"
  etag         = filemd5("../modules/aws_s3_bucket/build/dist/module.zip")
}

resource "aws_s3_bucket_object" "module_aws_service_registry" {
  bucket       = aws_s3_bucket.repository.id
  key          = "aws_service_registry.zip"
  source       = "../modules/aws_service_registry/build/dist/module.zip"
  content_type = "application/zip"
  etag         = filemd5("../modules/aws_service_registry/build/dist/module.zip")
}

resource "aws_s3_bucket_object" "module_aws_media_repository" {
  bucket       = aws_s3_bucket.repository.id
  key          = "aws_media_repository.zip"
  source       = "../modules/aws_media_repository/build/dist/module.zip"
  content_type = "application/zip"
  etag         = filemd5("../modules/aws_media_repository/build/dist/module.zip")
}

resource "aws_s3_bucket_object" "module_aws_job_repository" {
  bucket       = aws_s3_bucket.repository.id
  key          = "aws_job_repository.zip"
  source       = "../modules/aws_job_repository/build/dist/module.zip"
  content_type = "application/zip"
  etag         = filemd5("../modules/aws_job_repository/build/dist/module.zip")
}
