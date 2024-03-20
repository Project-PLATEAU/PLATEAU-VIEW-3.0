module "reearth_cms" {
  source = "./modules/reearth_cms"

  auth0_domain              = var.auth0_domain
  cesium_ion_access_token   = var.cesium_ion_access_token
  ckan_token                = var.ckan_token
  domain                    = var.domain
  dns_managed_zone_name     = google_dns_managed_zone.zone.name
  fme_token                 = var.fme_token
  gcp_project_id            = data.google_project.project.project_id
  gcp_region                = var.gcp_region
  mongodb_connection_string = var.mongodb_connection_string
  plateauview               = var.plateauview
  prefix                    = var.prefix
  reearth_cms_web_config    = var.reearth_cms_web_config
  sendgrid_api_key          = var.sendgrid_api_key
}
