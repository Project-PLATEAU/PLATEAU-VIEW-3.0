module "reearth_ecr" {
  source = "./modules/reearth/ecr"
  prefix = var.prefix
}

module "reearth" {
  source = "./modules/reearth"

  prefix = var.prefix
  region = var.region

  reearth_domain              = local.reearth_domain
  cesium_ion_access_token     = var.cesium_ion_access_token
  logo_url                    = var.logo_url
  editor_url                  = var.editor_url
  cover_image_url             = var.cover_image_url
  plateauview_api_domain      = ""
  reearth_image_identifier    = module.reearth_ecr.image_identifier
  cognito_auth_domain         = module.cognito.auth_domain
  cognito_user_pool_id        = module.cognito.user_pool_client_id
  cognito_user_pool_endpoint  = module.cognito.user_pool_endpoint
  cognito_user_pool_client_id = module.cognito.user_pool_id
}

module "reearth_domain" {
  source = "./modules/reearth/domain"

  reearth_domain         = local.reearth_domain
  app_runner_service_arn = module.reearth.app_runner_service_arn
  route53_zone_id        = aws_route53_zone.reearth.zone_id

}