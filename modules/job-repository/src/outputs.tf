output "auth_type" {
  value = local.service_auth_type
}

output "jobs_url" {
  value = "${local.service_url}/jobs"
}
