locals {
  repository_bucket_name = "${var.environment_name}.repository"
}

data "template_file" "s3_public_read_policy_website" {
  template = file("policies/s3-public-read.json")

  vars = {
    bucket_name = local.repository_bucket_name
  }
}

resource "aws_s3_bucket" "repository" {
  bucket = local.repository_bucket_name
  acl    = "public-read"
  policy = data.template_file.s3_public_read_policy_website.rendered
  force_destroy = true

  website {
    index_document = "index.html"
  }
}

resource "aws_s3_bucket_object" "module_aws_s3_bucket" {
  bucket       = local.repository_bucket_name
  key          = "aws_s3_bucket.zip"
  source       = "../modules/aws_s3_bucket/dist/module.zip"
  content_type = "text/plain"
  etag         = filemd5("../modules/aws_s3_bucket/dist/module.zip")
}
