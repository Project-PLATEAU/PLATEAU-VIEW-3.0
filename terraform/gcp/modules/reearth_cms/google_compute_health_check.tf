resource "google_compute_health_check" "plateauview_tiles" {
  project             = data.google_project.project.project_id
  check_interval_sec  = 10
  healthy_threshold   = 2
  name                = "plateauview-tiles"
  timeout_sec         = 5
  unhealthy_threshold = 10

  log_config {
    enable = true
  }

  http_health_check {
    request_path = "/tiles" # TODO: Change to /tiles
    port         = 8888
  }
}
