resource "google_secret_manager_secret" "reearth" {
  project   = data.google_project.project.project_id
  for_each  = toset(local.reearth_secrets)
  secret_id = "reearth-api-${each.value}"
  labels = {
    label = "reearth-api"
  }
  replication {
    user_managed {
      replicas {
        location = "asia-northeast2"
      }
    }
  }
}
