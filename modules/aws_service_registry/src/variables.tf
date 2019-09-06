#########################
# Environment Variables
#########################

variable "module_prefix" {
  type        = string
  description = "Prefix for all managed resources in this module"
}

variable "stage_name" {}

#########################
# AWS Variables
#########################

variable "aws_account_id" {}
variable "aws_region" {}
