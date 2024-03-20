resource "google_project_iam_member" "cms_worker_m2m" {
  project = data.google_project.project.project_id
  member  = "serviceAccount:${google_service_account.cms_worker_m2m.email}"
  role    = google_project_iam_custom_role.cms_worker_m2m.id
}

resource "google_project_iam_member" "reearth_cms" {
  role    = google_project_iam_custom_role.reearth_cms.id
  project = data.google_project.project.project_id
  member  = "serviceAccount:${google_service_account.reearth_cms.email}"
}

resource "google_project_iam_member" "reearth_cms_worker" {
  role    = google_project_iam_custom_role.reearth_cms_worker.id
  project = data.google_project.project.project_id
  member  = "serviceAccount:${google_service_account.reearth_cms_worker.email}"
}

resource "google_project_iam_member" "plateauview_api" {
  project = data.google_project.project.project_id
  role    = google_project_iam_custom_role.plateauview_api.id
  member  = "serviceAccount:${google_service_account.plateauview_api.email}"
}

resource "google_project_iam_member" "plateauview_geo" {
  project = data.google_project.project.project_id
  role    = google_project_iam_custom_role.plateauview_geo.id
  member  = "serviceAccount:${google_service_account.plateauview_geo.email}"
}


resource "google_project_iam_member" "plateauview_tiles" {
  project = data.google_project.project.project_id
  member  = "serviceAccount:${google_service_account.plateauview_tiles.email}"
  role    = "roles/logging.logWriter"
}
