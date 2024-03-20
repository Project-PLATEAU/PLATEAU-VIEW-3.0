variable "prefix" {
  type        = string
  default     = "reearth"
  description = "作成されるリソース名のプレフィックス"
}

variable "region" {
  type        = string
  default     = "us-west-1"
  description = "AWSリージョン"
}

variable "base_domain" {
  type        = string
  description = "ベースドメイン"
}

variable "logo_url" {
  type        = string
  description = "ロゴ画像のURL"
}

variable "editor_url" {
  type        = string
  description = "エディタのURL"
}

variable "cover_image_url" {
  type        = string
  description = "カバー画像のURL"
}

variable "cesium_ion_access_token" {
  type        = string
  description = "cesium ion access token"
}

#-----------------------
# cms
#-----------------------
variable "plateauview_sidebar_token" {
  type = string
}

variable "plateauview_cms_plateauproject" {
  type = string
}

variable "plateauview_geo_image_identifier" {
  type = string
}

variable "plateauview_ckan_baseurl" {
  type = string
}

variable "reearth_domain" {
  type = string
}

variable "plateauview_ckan_org" {
  type = string
}

variable "plateauview_cms_systemproject" {
  type = string
}

variable "plateauview_fme_baseurl" {
  type = string
}

variable "plateauview_cms_webhook_secret" {
  type = string
}

variable "plateauview_api_image_identifier" {
  type = string
}

variable "plateauview_sdk_token" {
  type = string
}