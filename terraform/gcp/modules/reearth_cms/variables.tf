variable "auth0_domain" {
  type        = string
  description = "Auth0のドメイン"
}

variable "cesium_ion_access_token" {
  type        = string
  description = "Cesium IONのアクセストークン"

  # Note: Cesium Ion Access Token is not a secret which will be expose to the frontend, but it is sensitive information.
  sensitive = true
}

variable "ckan_token" {
  type        = string
  description = "FMEトークン"
  sensitive   = true
}

variable "domain" {
  type        = string
  description = "PLATEAU VIEWを提供するドメイン名"
}

variable "dns_managed_zone_name" {
  type        = string
  description = "Cloud DNSマネージドゾーンの名前"
}

variable "fme_token" {
  type        = string
  description = "FMEトークン"
  sensitive   = true
}

variable "gcp_project_id" {
  type        = string
  description = "GCPプロジェクトのID"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$", var.gcp_project_id))
    error_message = "GCPプロジェクトIDは、小文字で始まり、小文字、数字、またはハイフンを含む必要があります。また、6文字以上30文字以下の長さである必要があります。"
  }
}

variable "gcp_region" {
  type        = string
  default     = "asia-northeast1"
  description = "GCPで使用するリージョン"
}

variable "mongodb_connection_string" {
  type        = string
  description = "MongoDB Altasのデータベース接続文字列"
  sensitive   = true
}

variable "plateauview" {
  type = object({
    ckan_org                  = string
    ckan_base_url             = string
    cms_plateau_project       = string
    cms_system_project        = string
    datacatalog_cache_size    = string
    datacatalog_cache_percent = number
    fme_baseurl               = string
    fme_skip_quality_check    = string
    fme_url_v3                = string
    option_to                 = string
    option_from               = string
  })
}

variable "prefix" {
  type        = string
  description = "作成されるリソース名のプレフィックス"
}

variable "reearth_version" {
  type    = string
  default = "0.14.1"
}

variable "reearth_cms_web_config" {
  type = object({
    coverImageUrl = string
    logoUrl       = string
  })
}

variable "sendgrid_api_key" {
  type        = string
  description = "SendGridのAPIキー"
  sensitive   = true
}
