provider "auth0" {
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
  domain        = var.auth0_domain
}

provider "google" {
  region = var.gcp_region
}
