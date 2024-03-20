resource "google_service_account" "reearth" {
  project      = data.google_project.project.project_id
  account_id   = "reearth"
  display_name = "Service Account for Re:Earth"
}
