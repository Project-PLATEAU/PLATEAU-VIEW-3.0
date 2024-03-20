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

variable "domain" {
  type        = string
  description = "PLATEAU VIEWを提供するドメイン名"
}

variable "dns_managed_zone_name" {
  type        = string
  default     = null
  description = "CloudDNSのゾーン名を指定してください"
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

variable "prefix" {
  type        = string
  description = "作成されるリソース名のプレフィックス"
}

variable "reearth_web_config" {
  type = object({
    brand = object({
      background = string
      logoUrl    = string
    })
  })
  description = "Re:Earthの設定"
}

variable "reearth_version" {
  type    = string
  default = "0.14.1"
}

variable "reearth_marketplace_secret" {
  type        = string
  description = "Re:Earth Marketplaceのシークレット"
  sensitive   = true
}
