output "service_url" {
  value = local.service_url
}

output "website_bucket_name" {
  value = local.website_bucket_name
}

output "website_url" {
  value = local.website_url
}

output "repository_bucket_name" {
  value = local.repository_bucket_name
}

output "repository_url" {
  value = local.repository_url
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.user_pool.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.client.id
}
