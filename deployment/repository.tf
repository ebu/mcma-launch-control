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

locals {
  repository_bucket_name = "${var.environment_name}.repository"
}