##################################
# aws_iam_role : iam_for_exec_lambda
##################################

resource "aws_iam_role" "iam_for_exec_lambda" {
  name               = format("%.64s", "${var.module_prefix}.lambda-exec-role")
  assume_role_policy = file("${path.module}/policies/lambda-allow-assume-role.json")
}

resource "aws_iam_policy" "log_policy" {
  name        = "${var.module_prefix}.policy-log"
  description = "Policy to write to log"
  policy      = file("${path.module}/policies/allow-full-logs.json")
}

resource "aws_iam_role_policy_attachment" "role_policy_log" {
  role       = aws_iam_role.iam_for_exec_lambda.name
  policy_arn = aws_iam_policy.log_policy.arn
}

resource "aws_iam_policy" "dynamodb_policy" {
  name        = "${var.module_prefix}.policy-dynamodb"
  description = "Policy to Access DynamoDB"
  policy      = file("${path.module}/policies/allow-full-dynamodb.json")
}

resource "aws_iam_role_policy_attachment" "role_policy_dynamodb" {
  role       = aws_iam_role.iam_for_exec_lambda.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

##################################
# aws_dynamodb_table : media_repository_table
##################################

resource "aws_dynamodb_table" "media_repository_table" {
  name           = var.module_prefix
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "resource_type"
  range_key      = "resource_id"

  attribute {
    name = "resource_type"
    type = "S"
  }

  attribute {
    name = "resource_id"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"
}

#################################
#  aws_lambda_function : service-registry-api-handler
#################################

resource "aws_lambda_function" "service-registry-api-handler" {
  filename         = "${path.module}/lambdas/api-handler.zip"
  function_name    = format("%.64s", replace("${var.module_prefix}-api-handler", "/[^a-zA-Z0-9_]+/", "-" ))
  role             = aws_iam_role.iam_for_exec_lambda.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/lambdas/api-handler.zip")
  runtime          = "nodejs10.x"
  timeout          = "30"
  memory_size      = "256"
}

##############################
#  aws_api_gateway_rest_api:  media_repository_api
##############################
resource "aws_api_gateway_rest_api" "media_repository_api" {
  name        = var.module_prefix
  description = "Media Repository Rest Api"
}

resource "aws_api_gateway_resource" "media_repository_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.media_repository_api.id
  parent_id   = aws_api_gateway_rest_api.media_repository_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "media_repository_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.media_repository_api.id
  resource_id   = aws_api_gateway_resource.media_repository_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "media_repository_options_200" {
  rest_api_id = aws_api_gateway_rest_api.media_repository_api.id
  resource_id = aws_api_gateway_resource.media_repository_api_resource.id
  http_method = aws_api_gateway_method.media_repository_options_method.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "media_repository_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.media_repository_api.id
  resource_id = aws_api_gateway_resource.media_repository_api_resource.id
  http_method = aws_api_gateway_method.media_repository_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_integration_response" "media_repository_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.media_repository_api.id
  resource_id = aws_api_gateway_resource.media_repository_api_resource.id
  http_method = aws_api_gateway_method.media_repository_options_method.http_method
  status_code = aws_api_gateway_method_response.media_repository_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,PATCH,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }
}

resource "aws_api_gateway_method" "media_repository_api_method" {
  rest_api_id   = aws_api_gateway_rest_api.media_repository_api.id
  resource_id   = aws_api_gateway_resource.media_repository_api_resource.id
  http_method   = "ANY"
  authorization = "AWS_IAM"
}

resource "aws_api_gateway_integration" "media_repository_api_method_integration" {
  rest_api_id             = aws_api_gateway_rest_api.media_repository_api.id
  resource_id             = aws_api_gateway_resource.media_repository_api_resource.id
  http_method             = aws_api_gateway_method.media_repository_api_method.http_method
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${aws_lambda_function.service-registry-api-handler.function_name}/invocations"
  integration_http_method = "POST"
}

resource "aws_lambda_permission" "api_gateway_exec_api_handler" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.service-registry-api-handler.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.media_repository_api.id}/*/${aws_api_gateway_method.media_repository_api_method.http_method}/*"
}

resource "aws_api_gateway_deployment" "media_repository_deployment" {
  depends_on = [
    "aws_api_gateway_integration.media_repository_options_integration",
    "aws_api_gateway_integration.media_repository_api_method_integration",
  ]

  rest_api_id = aws_api_gateway_rest_api.media_repository_api.id
  stage_name  = var.stage_name

  variables = {
    "TableName" = aws_dynamodb_table.media_repository_table.name
    "PublicUrl" = local.service_url
  }
}

locals {
  service_url       = "https://${aws_api_gateway_rest_api.media_repository_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.stage_name}"
  service_auth_type = "AWS4"
}
