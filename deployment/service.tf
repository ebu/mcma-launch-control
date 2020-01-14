##################################
# aws_dynamodb_table : service_table
##################################

resource "aws_dynamodb_table" "service_table" {
  name         = "${var.project_prefix}-service"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "resource_type"
  range_key    = "resource_id"

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
#  aws_lambda_function : service-api-handler
#################################

resource "aws_lambda_function" "service_api_handler" {
  filename         = "../service/api-handler/build/dist/lambda.zip"
  function_name    = format("%.64s", replace("${var.project_prefix}-service-api-handler", "/[^a-zA-Z0-9_]+/", "-" ))
  role             = aws_iam_role.iam_for_exec_lambda.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("../service/api-handler/build/dist/lambda.zip")
  runtime          = "nodejs10.x"
  timeout          = "30"
  memory_size      = "256"

  environment {
    variables = {
      ServiceWorkerLambdaFunctionName = aws_lambda_function.service_worker.function_name
    }
  }
}

#################################
#  aws_lambda_function : service-worker
#################################

resource "aws_lambda_function" "service_worker" {
  filename         = "../service/worker/build/dist/lambda.zip"
  function_name    = format("%.64s", replace("${var.project_prefix}-service-worker", "/[^a-zA-Z0-9_]+/", "-" ))
  role             = aws_iam_role.iam_for_exec_lambda.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("../service/worker/build/dist/lambda.zip")
  runtime          = "nodejs10.x"
  timeout          = "900"
  memory_size      = "3008"

  layers = ["arn:aws:lambda:${var.aws_region}:553035198032:layer:git-lambda2:2"]

  environment {
    variables = {
      // TODO: Supply the variables through AWS Systems Manager Parameter Store instead of passing them here
      GlobalPrefix = var.global_prefix

      AwsAccountId = var.aws_account_id
      AwsAccessKey = var.aws_access_key
      AwsSecretKey = var.aws_secret_key
      AwsRegion    = var.aws_region

      AwsCodeCommitUsername = var.aws_code_commit_username
      AwsCodeCommitPassword = var.aws_code_commit_password
    }
  }
}

##############################
#  aws_api_gateway_rest_api:  service_api
##############################
resource "aws_api_gateway_rest_api" "service_api" {
  name        = "${var.project_prefix}-service-api"
  description = "Launch Control Service Rest Api"
}

resource "aws_api_gateway_resource" "service_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.service_api.id
  parent_id   = aws_api_gateway_rest_api.service_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "service_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.service_api.id
  resource_id   = aws_api_gateway_resource.service_api_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "service_options_200" {
  rest_api_id = aws_api_gateway_rest_api.service_api.id
  resource_id = aws_api_gateway_resource.service_api_resource.id
  http_method = aws_api_gateway_method.service_options_method.http_method
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

resource "aws_api_gateway_integration" "service_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.service_api.id
  resource_id = aws_api_gateway_resource.service_api_resource.id
  http_method = aws_api_gateway_method.service_options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_integration_response" "service_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.service_api.id
  resource_id = aws_api_gateway_resource.service_api_resource.id
  http_method = aws_api_gateway_method.service_options_method.http_method
  status_code = aws_api_gateway_method_response.service_options_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,PATCH,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }
}

resource "aws_api_gateway_method" "service_api_method" {
  rest_api_id   = aws_api_gateway_rest_api.service_api.id
  resource_id   = aws_api_gateway_resource.service_api_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  //"AWS_IAM"
}

resource "aws_api_gateway_integration" "service_api_method_integration" {
  rest_api_id             = aws_api_gateway_rest_api.service_api.id
  resource_id             = aws_api_gateway_resource.service_api_resource.id
  http_method             = aws_api_gateway_method.service_api_method.http_method
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${aws_lambda_function.service_api_handler.function_name}/invocations"
  integration_http_method = "POST"
}

resource "aws_lambda_permission" "apigw_service_api_handler" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.service_api_handler.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_api_gateway_rest_api.service_api.id}/*/${aws_api_gateway_method.service_api_method.http_method}/*"
}

resource "aws_api_gateway_deployment" "service_deployment" {
  depends_on = [
    aws_api_gateway_integration.service_options_integration,
    aws_api_gateway_integration.service_api_method_integration,
  ]

  rest_api_id = aws_api_gateway_rest_api.service_api.id
  stage_name  = var.stage_name

  variables = {
    "TableName"      = aws_dynamodb_table.service_table.name
    "PublicUrl"      = local.service_url
    "DeploymentHash" = filesha256("./service.tf")
  }
}

locals {
  service_url = "https://${aws_api_gateway_rest_api.service_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.stage_name}"
}
