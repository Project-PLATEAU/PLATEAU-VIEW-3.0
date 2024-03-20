variable "prefix" {
  type        = string
  description = "service name prefix"
}

variable "region" {
  type        = string
  description = "aws region"
}

variable "cognito_user_pool_client_id" {
  type        = string
  description = "cognito user pool client id"
}

variable "cognito_user_pool_endpoint" {
  type        = string
  description = "cognito user pool endpoint"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "cognito user pool id"
}

variable "cognito_auth_domain" {
  type        = string
  description = "cognito auth domain"
}

variable "cesium_ion_access_token" {
  type        = string
  description = "cesium ion access token"
}

variable "cover_image_url" {
  type        = string
  description = "cover image url"
}

variable "editor_url" {
  type        = string
  description = "editor url"
}

variable "logo_url" {
  type        = string
  description = "logo url"
}

variable "cms_domain" {
  type        = string
  description = "cms domain"
}

variable "cms_image_identifier" {
  type        = string
  description = "image identifier"
}

variable "cms_worker_image_identifier" {
  type        = string
  description = "image identifier"
}


variable "plateauview_api_image_identifier" {
  type        = string
  description = "image identifier"
}

variable "plateauview_fme_baseurl" {
  type        = string
  description = "fme base url"
}

variable "plateauview_ckan_baseurl" {
  type        = string
  description = "ckan base url"
}

variable "plateauview_ckan_org" {
  type        = string
  description = "ckan organization"
}

variable "plateauview_cms_systemproject" {
  type        = string
  description = "cms systemproject"
}

variable "plateauview_opinion_to" {
  type    = string
  default = "plateauview option to"
}

variable "plateauview_opinion_from" {
  type    = string
  default = "plateauview opinion from"
}


variable "plateauview_cms_plateauproject" {
  type        = string
  description = "cms plateau project"
}

variable "plateauview_sdk_token" {
  type        = string
  description = "sdk token"
}

variable "plateauview_sidebar_token" {
  type        = string
  description = "sidebar token"
}

variable "plateauview_cms_webhook_secret" {
  type        = string
  description = "webhook secret"

}

variable "plateauview_geo_image_identifier" {
  type        = string
  description = "image identifier"
}

variable "reearth_domain" {
  type        = string
  description = "reearth domain"
}