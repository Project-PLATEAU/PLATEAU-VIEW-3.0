resource "google_secret_manager_secret" "reearth_cms" {
  for_each  = toset(local.reearth_cms_secrets)
  project   = data.google_project.project.project_id
  secret_id = "reearth-cms-${each.value}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "reearth_cms_worker" {
  for_each  = toset(local.reearth_cms_worker_secrets)
  project   = data.google_project.project.project_id
  secret_id = "reearth-cms-worker-${each.value}"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "plateauview" {
  for_each  = toset(local.plateauview_secrets)
  project   = data.google_project.project.project_id
  secret_id = "plateau-view-${each.value}"

  replication {
    auto {}
  }
}
