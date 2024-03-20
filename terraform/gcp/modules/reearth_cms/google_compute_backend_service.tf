resource "google_compute_backend_service" "plateauview_tiles" {
  project                         = data.google_project.project.project_id
  name                            = "plateauview-tiles"
  timeout_sec                     = 30
  connection_draining_timeout_sec = 30

  backend {
    group = google_compute_instance_group_manager.plateauview_tiles.instance_group
  }

  health_checks = [google_compute_health_check.plateauview_tiles.id]
}
