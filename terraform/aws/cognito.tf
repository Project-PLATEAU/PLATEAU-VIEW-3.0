module "cognito" {
  source = "./modules/cognito"

  prefix                = var.prefix
  region                = var.region
  cognito_callback_urls = ["https://${local.cms_domain}", "https://${local.reearth_domain}"]
  cognito_logout_urls   = ["https://${local.cms_domain}", "https://${local.reearth_domain}"]
  example_user_email    = "example@${var.base_domain}"
  example_user_name     = "example"
  signup_endpoint_url   = "https://${local.cms_domain}/api/signup"
}

