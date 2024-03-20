resource "google_secret_manager_secret_version" "reearth_cms_worker_db" {
  secret      = google_secret_manager_secret.reearth_cms_worker["REEARTH_CMS_WORKER_DB"].id
  secret_data = var.mongodb_connection_string
}

resource "google_secret_manager_secret_version" "plateauview_ckan_token" {
  secret      = google_secret_manager_secret.plateauview["REEARTH_PLATEUVIEW_CKAN_TOKEN"].id
  secret_data = var.ckan_token
}

resource "google_secret_manager_secret_version" "plateauview_cms_token" {
  secret      = google_secret_manager_secret.plateauview["REEARTH_PLATEUVIEW_CMS_TOKEN"].id
  secret_data = "DUMMY" # MEMO: Will be added after CMS has started.
}

resource "google_secret_manager_secret_version" "plateauview_cms_webhook_secret" {
  secret      = google_secret_manager_secret.plateauview["REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET"].id
  secret_data = random_password.plateauview_env["REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET"].result
}

resource "google_secret_manager_secret_version" "plateauview_fme_token" {
  secret      = google_secret_manager_secret.plateauview["REEARTH_PLATEUVIEW_FME_TOKEN"].id
  secret_data = var.fme_token
}

resource "google_secret_manager_secret_version" "plateauview_secret" {
  secret      = google_secret_manager_secret.plateauview["REEARTH_PLATEUVIEW_SECRET"].id
  secret_data = random_password.plateauview_env["REEARTH_PLATEUVIEW_SECRET"].result
}

resource "google_secret_manager_secret_version" "plateauview_sendgrid_api_key" {
  secret      = google_secret_manager_secret.plateauview["REEARTH_PLATEUVIEW_SENDGRID_API_KEY"].id
  secret_data = var.sendgrid_api_key
}

resource "google_secret_manager_secret_version" "reearth_cms_auth0_client_secret" {
  secret      = google_secret_manager_secret.reearth_cms["REEARTH_CMS_AUTH0_CLIENTSECRET"].id
  secret_data = module.auth0.auth0_client_m2m.client_secret
}

resource "google_secret_manager_secret_version" "reearth_cms_db" {
  secret      = google_secret_manager_secret.reearth_cms["REEARTH_CMS_DB"].id
  secret_data = var.mongodb_connection_string
}
