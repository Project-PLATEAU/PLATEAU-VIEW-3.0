resource "google_secret_manager_secret_version" "reearth_auth0_clientsecret" {
  secret      = google_secret_manager_secret.reearth["REEARTH_AUTH0_CLIENTSECRET"].id
  secret_data = module.auth0.auth0_client_m2m.client_secret
}

resource "google_secret_manager_secret_version" "reearth_auth0_clientid" {
  secret      = google_secret_manager_secret.reearth["REEARTH_AUTH0_CLIENTID"].id
  secret_data = module.auth0.auth0_client_m2m.client_id
}

resource "google_secret_manager_secret_version" "reearth_REEARTH_DB" {
  secret      = google_secret_manager_secret.reearth["REEARTH_DB"].id
  secret_data = var.mongodb_connection_string
}

resource "google_secret_manager_secret_version" "reearth_REEARTH_MARKETPLACE_SECRET" {
  secret      = google_secret_manager_secret.reearth["REEARTH_MARKETPLACE_SECRET"].id
  secret_data = var.reearth_marketplace_secret
}

resource "google_secret_manager_secret_version" "reearth_signupsecret" {
  secret      = google_secret_manager_secret.reearth["REEARTH_SIGNUPSECRET"].id
  secret_data = module.auth0.action_secret.result
}

