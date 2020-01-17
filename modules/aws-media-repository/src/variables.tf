#########################
# Environment Variables
#########################

variable "module_prefix" {
  type        = string
  description = "Prefix for all managed resources in this module"
}

variable "module_name" {
  type        = string
  description = "User friedly name to be displayed on the API Gateway"
}

variable "stage_name" {
  type        = string
  description = "Stage name to be used for the API Gateway deployment"
}

#########################
# AWS Variables
#########################

variable "aws_account_id" {
  type        = string
  description = "Account ID to which this module is deployed"
}
variable "aws_region" {
  type        = string
  description = "AWS Region to which this module is deployed"
}
