resource "google_project_iam_member" "reearth" {
  project = data.google_project.project.project_id
  role    = google_project_iam_custom_role.reearth.id
  member  = "serviceAccount:${google_service_account.reearth.email}"
}
