output "plateauview_cms_url" {
  value = module.reearth_cms.plateauview_cms_url
}

output "plateauview_cms_webhook_url" {
  value = "https://api.${var.domain}/webhook"
}

output "plateauview_cms_webhook_secret" {
  value     = module.reearth_cms.plateauview_cms_webhook_secret
  sensitive = true
}

output "plateauview_geo_url" {
  value = module.reearth_cms.plateauview_geo_url
}

output "plateauview_reearth_url" {
  value = module.reearth.plateauview_reearth_url
}

output "plateauview_sdk_token" {
  value     = module.reearth_cms.plateauview_sdk_token
  sensitive = true
}

output "plateauview_sidebar_token" {
  value     = module.reearth_cms.plateauview_sidebar_token
  sensitive = true
}

output "plateauview_sidecar_url" {
  value = module.reearth_cms.plateauview_url
}

output "plateauview_tiles_url" {
  value = module.reearth_cms.plateauview_tiles_url
}
