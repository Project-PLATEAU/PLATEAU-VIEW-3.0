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

variable "reearth_domain" {
  type        = string
  description = "cms domain"
}

variable "plateauview_api_domain" {
  type        = string
  description = "plateauview api domain"
}

variable "reearth_image_identifier" {
  type        = string
  description = "image identifier"
}