output "auth_type" {
  value = local.service_auth_type
}

output "job_assignments_url" {
  value = "${local.service_url}/job-assignments"
}
