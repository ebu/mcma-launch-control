locals {
  website_bucket_name = "${var.project_prefix}.website"
  website_url         = "https://s3${var.aws_region != "us-east-1" ? "-${var.aws_region}" : ""}.amazonaws.com/${local.website_bucket_name}/index.html"
}

resource "aws_s3_bucket" "website" {
  bucket        = local.website_bucket_name
  acl           = "public-read"
  policy        = templatefile("policies/s3-public-read.json", {
    bucket_name = local.website_bucket_name
  })
  force_destroy = true

  website {
    index_document = "index.html"
  }
}
