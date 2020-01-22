#########################
# Module configuration
#########################

variable "module_prefix" {
  type        = string
  description = "Prefix for all managed resources in this module"
}

variable "stage_name" {
  type        = string
  description = "Stage name for the API endpoint"
}

variable "log_group_name" {
  type        = "string"
  description = "Log group name used by MCMA Event tracking"
}

variable "api_metrics_enabled" {
  type    = bool
  default = false
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

#########################
# Dependencies
#########################

variable "service_registry" {
  type = object({
    auth_type    = string,
    services_url = string,
  })
}
