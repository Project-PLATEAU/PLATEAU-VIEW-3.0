locals {
  api_domain            = "api.${var.domain}"
  api_reearth_domain    = "api.${local.reearth_domain}"
  app_reearth_domain    = "app.${local.reearth_domain}"
  cms_domain            = "cms.${var.domain}"
  reearth_domain        = "reearth.${var.domain}"
  static_reearth_domain = "static.${local.reearth_domain}"
}

locals {
  reearth_secrets = [
    "REEARTH_DB",
    "REEARTH_AUTH0_CLIENTID",
    "REEARTH_AUTH0_CLIENTSECRET",
    "REEARTH_MARKETPLACE_SECRET",
    "REEARTH_SIGNUPSECRET",
  ]
}
