resource "google_pubsub_topic" "cms_decompress" {
  project = data.google_project.project.project_id
  name    = "decompress"
}

resource "google_pubsub_topic" "cms_webhook" {
  project = data.google_project.project.project_id
  name    = "cms-webhook"
}
