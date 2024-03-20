module "reearth" {
  source = "./modules/reearth"

  auth0_domain               = var.auth0_domain
  cesium_ion_access_token    = var.cesium_ion_access_token
  dns_managed_zone_name      = google_dns_managed_zone.zone.name
  domain                     = var.domain
  gcp_project_id             = var.gcp_project_id
  gcp_region                 = var.gcp_region
  mongodb_connection_string  = var.mongodb_connection_string
  reearth_marketplace_secret = var.reearth_marketplace_secret
  reearth_web_config         = var.reearth_web_config
  prefix                     = var.prefix
}
