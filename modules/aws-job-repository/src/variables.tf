#########################
# Environment Variables
#########################

variable "module_prefix" {
  type        = string
  description = "Prefix for all managed resources in this module"
}

variable "stage_name" {
  type        = string
  description = "Stage name for the API endpoint"
}

#########################
# AWS Variables
#########################

variable "aws_account_id" {}
variable "aws_region" {}

#########################
# Module configuration
#########################

variable "api_metrics_enabled" {
  type    = bool
  default = false
}

#########################
# Dependencies
#########################

variable "service_registry" {
  type = object({
    service_url       = string,
    service_auth_type = string,
    services_url      = string,
  })
}
