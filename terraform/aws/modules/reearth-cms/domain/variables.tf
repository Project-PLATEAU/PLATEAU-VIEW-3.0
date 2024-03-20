variable "route53_zone_id" {
  type        = string
  description = "route53 zone id"
}

variable "cms_app_runner_service_arn" {
  type        = string
  description = "app runner service arn"
}

variable "cms_domain" {
  type        = string
  description = "cms domain"
}

variable "plateauview_api_app_runner_arn" {
  type        = string
  description = "plateauview api app runner arn"
}

variable "plateauview_api_domain" {
  type        = string
  description = "plateauview api domain"
}

variable "plateauview_geo_app_runner_arn" {
  type        = string
  description = "plateauview geo app runner arn"
}

variable "plateauview_geo_domain" {
  type        = string
  description = "plateauview geo domain"
}