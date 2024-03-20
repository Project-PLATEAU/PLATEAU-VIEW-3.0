output "auth0_action_signup" {
  value = module.auth0.action_signup
}

output "plateauview_cms_url" {
  value = "https://${local.cms_domain}"
}

output "plateauview_cms_webhook_secret" {
  value = random_password.plateauview_env["REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET"].result
}

output "plateauview_geo_url" {
  value = "https://${local.geo_domain}"
}

output "plateauview_sdk_token" {
  value = random_password.plateauview_env["REEARTH_PLATEUVIEW_SDK_TOKEN"].result
}

output "plateauview_sidebar_token" {
  value = random_password.plateauview_env["REEARTH_PLATEUVIEW_SIDEBAR_TOKEN"].result
}

output "plateauview_tiles_url" {
  value = "https://${local.tiles_domain}"
}

output "plateauview_url" {
  value = "https://${local.api_domain}"
}
