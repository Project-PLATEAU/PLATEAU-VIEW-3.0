module "reearth_cms_ecr" {
  source = "./modules/reearth-cms/ecr"
  prefix = var.prefix
}

module "reearth_cms" {
  source = "./modules/reearth-cms"

  prefix = var.prefix
  region = var.region

  cms_domain              = local.cms_domain
  cesium_ion_access_token = var.cesium_ion_access_token
  logo_url                = var.logo_url
  editor_url              = var.editor_url
  cover_image_url         = var.cover_image_url

  cms_image_identifier        = module.reearth_cms_ecr.cms_image_identifier
  cognito_auth_domain         = module.cognito.auth_domain
  cognito_user_pool_id        = module.cognito.user_pool_client_id
  cognito_user_pool_endpoint  = module.cognito.user_pool_endpoint
  cognito_user_pool_client_id = module.cognito.user_pool_id

  cms_worker_image_identifier = module.reearth_cms_ecr.cms_worker_image_identifier

  plateauview_sidebar_token        = var.plateauview_sidebar_token
  plateauview_cms_plateauproject   = var.plateauview_cms_plateauproject
  plateauview_geo_image_identifier = var.plateauview_geo_image_identifier
  plateauview_ckan_baseurl         = var.plateauview_ckan_baseurl
  reearth_domain                   = var.reearth_domain
  plateauview_ckan_org             = var.plateauview_ckan_org
  plateauview_cms_systemproject    = var.plateauview_cms_systemproject
  plateauview_fme_baseurl          = var.plateauview_fme_baseurl
  plateauview_cms_webhook_secret   = var.plateauview_cms_webhook_secret
  plateauview_api_image_identifier = var.plateauview_api_image_identifier
  plateauview_sdk_token            = var.plateauview_sdk_token
}

module "reearth_cms_domain" {
  source = "./modules/reearth-cms/domain"

  route53_zone_id = aws_route53_zone.reearth.zone_id

  cms_domain                 = local.cms_domain
  cms_app_runner_service_arn = module.reearth_cms.cms_app_runner_service_arn

  plateauview_api_domain         = local.plateauview_api_domain
  plateauview_api_app_runner_arn = module.reearth_cms.plateauview_api_app_runner_arn

  plateauview_geo_domain         = local.plateauview_geo_domain
  plateauview_geo_app_runner_arn = module.reearth_cms.plateauview_geo_app_runner_arn
}