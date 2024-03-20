resource "google_cloud_run_service_iam_member" "reearth_cms_noauth" {
  location = google_cloud_run_v2_service.reearth_cms.location
  project  = google_cloud_run_v2_service.reearth_cms.project
  service  = google_cloud_run_v2_service.reearth_cms.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "reearth_cms_worker_noauth" {
  location = google_cloud_run_v2_service.reearth_cms_worker.location
  project  = google_cloud_run_v2_service.reearth_cms_worker.project
  service  = google_cloud_run_v2_service.reearth_cms_worker.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "plateauview_api_noauth" {
  location = google_cloud_run_v2_service.plateauview_api.location
  project  = google_cloud_run_v2_service.plateauview_api.project
  service  = google_cloud_run_v2_service.plateauview_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "plateauview_geo_noauth" {
  location = google_cloud_run_v2_service.plateauview_geo.location
  project  = google_cloud_run_v2_service.plateauview_geo.project
  service  = google_cloud_run_v2_service.plateauview_geo.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
