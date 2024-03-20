locals {
  api_cms_domain    = "api.${local.cms_domain}"
  api_domain        = "api.${var.domain}"
  assets_cms_domain = "assets.${local.cms_domain}"
  cms_domain        = "cms.${var.domain}"
  geo_domain        = "geo.${var.domain}"
  tiles_domain      = "tiles.${var.domain}"
  reearth_domain    = "reearth.${var.domain}"
  worker_cms_domain = "worker.${local.cms_domain}"
}

locals {
  reearth_cms_secrets = [
    "REEARTH_CMS_AUTH0_CLIENTSECRET",
    "REEARTH_CMS_DB",
  ]
}

locals {
  reearth_cms_worker_secrets = [
    "REEARTH_CMS_WORKER_DB",
  ]
}

locals {
  plateauview_secrets = [
    "REEARTH_PLATEUVIEW_CKAN_TOKEN",
    "REEARTH_PLATEUVIEW_CMS_TOKEN",
    "REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET",
    "REEARTH_PLATEUVIEW_FME_TOKEN",
    "REEARTH_PLATEUVIEW_SECRET",
    "REEARTH_PLATEUVIEW_SENDGRID_API_KEY",
  ]

  plateauview_randoms = [
    "REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET",
    "REEARTH_PLATEUVIEW_SECRET",
    "REEARTH_PLATEUVIEW_SDK_TOKEN",
    "REEARTH_PLATEUVIEW_SIDEBAR_TOKEN",
  ]
}
