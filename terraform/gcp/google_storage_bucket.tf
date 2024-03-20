resource "google_storage_bucket" "terraform" {
  project       = data.google_project.project.project_id
  location      = "asia-northeast1"
  name          = var.gcs_bucket
  storage_class = "STANDARD"
}
