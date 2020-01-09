#########################
# Cognito Authenticated role
#########################

resource "aws_iam_role" "cognito_authenticated" {
  name = format("%.64s", "${var.project_prefix}-${var.aws_region}-cognito-authenticated")

  assume_role_policy = templatefile("policies/cognito-allow-assume-role.json", {
    identity_pool_id = aws_cognito_identity_pool.identity_pool.id
  })
}

resource "aws_iam_role_policy_attachment" "cognito_authenticated_policy_api_gateway" {
  role       = aws_iam_role.cognito_authenticated.name
  policy_arn = aws_iam_policy.api_gateway_policy.arn
}

resource "aws_iam_role_policy_attachment" "cognito_authenticated_policy_cognito" {
  role       = aws_iam_role.cognito_authenticated.name
  policy_arn = aws_iam_policy.cognito_policy.arn
}

#########################
# Cognito User Pool
#########################

resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.project_prefix}-user-pool"
}

resource "aws_cognito_user_pool_client" "client" {
  name            = "${var.project_prefix}-user-pool-client"
  user_pool_id    = aws_cognito_user_pool.user_pool.id
  generate_secret = false
}

#########################
# Cognito Identity Pool
#########################

resource "aws_cognito_identity_pool" "identity_pool" {
  identity_pool_name               = replace(replace(var.project_prefix, "/[^a-zA-Z0-9 ]/", " "), "/[ ]+/", " ")
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.client.id
    provider_name           = aws_cognito_user_pool.user_pool.endpoint
    server_side_token_check = false
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.identity_pool.id

  roles = {
    authenticated = aws_iam_role.cognito_authenticated.arn
  }
}
