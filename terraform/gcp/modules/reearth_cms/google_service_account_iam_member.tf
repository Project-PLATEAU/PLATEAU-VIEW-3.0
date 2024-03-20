resource "google_service_account_iam_member" "reearth_cms" {
  service_account_id = google_service_account.reearth_cms.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.reearth_cms.email}"

}
