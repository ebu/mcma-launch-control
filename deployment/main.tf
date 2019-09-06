#########################
# Provider registration
#########################

provider "aws" {
  version = "~> 2.25"

  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
}

provider "template" {
  version = "~> 2.1.2"
}

##################################
# aws_iam_role : iam_for_exec_lambda
##################################

resource "aws_iam_role" "iam_for_exec_lambda" {
  name               = format("%.64s", "${var.project_prefix}.lambda-exec-role")
  assume_role_policy = file("policies/lambda-allow-assume-role.json")
}

resource "aws_iam_policy" "log_policy" {
  name        = "${var.project_prefix}.policy-log"
  description = "Policy to write to log"
  policy      = file("policies/allow-full-logs.json")
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_log" {
  role       = aws_iam_role.iam_for_exec_lambda.name
  policy_arn = aws_iam_policy.log_policy.arn
}

resource "aws_iam_policy" "dynamodb_policy" {
  name        = "${var.project_prefix}.policy-dynamodb"
  description = "Policy to Access DynamoDB"
  policy      = file("policies/allow-full-dynamodb.json")
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_dynamodb" {
  role       = aws_iam_role.iam_for_exec_lambda.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.project_prefix}.policy-lambda"
  description = "Policy to allow invoking lambda functions"
  policy      = file("policies/allow-invoke-lambda.json")
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_lambda" {
  role       = aws_iam_role.iam_for_exec_lambda.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "aws_iam_policy" "codecommit_policy" {
  name        = "${var.project_prefix}.policy-codecommit"
  description = "Policy to allow using codecommit"
  policy      = file("policies/allow-full-codecommit.json")
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_codecommit" {
  role       = aws_iam_role.iam_for_exec_lambda.name
  policy_arn = aws_iam_policy.codecommit_policy.arn
}
