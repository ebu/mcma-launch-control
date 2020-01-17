output "auth_type" {
  value = local.service_auth_type
}

output "bm_contents_url" {
  value = "${local.service_url}/bm-contents"
}

output "bm_essences_url" {
  value = "${local.service_url}/bm-essences"
}
