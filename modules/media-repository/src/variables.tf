#########################
# Environment Variables
#########################

variable "module_prefix" {
  type        = string
  description = "Prefix for all managed resources in this module"
}

variable "stage_name" {
  type        = string
  description = "Stage name to be used for the API Gateway deployment"
}

variable "log_group_name" {
  type = "string"
  description = "Log group name used by MCMA Event tracking"
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
