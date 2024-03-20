resource "google_compute_instance_group_manager" "plateauview_tiles" {
  project            = data.google_project.project.project_id
  base_instance_name = "plateauview-tiles"
  name               = "plateauview-tiles"
  target_size        = 1
  zone               = "${var.gcp_region}-a"

  auto_healing_policies {
    health_check      = google_compute_health_check.plateauview_tiles.id
    initial_delay_sec = 300 # 5 minutes
  }

  named_port {
    name = "http"
    port = 8888
  }

  version {
    instance_template = google_compute_instance_template.plateauview_tiles.self_link_unique
  }

  update_policy {
    max_surge_fixed                = 1
    max_unavailable_fixed          = 1
    minimal_action                 = "REPLACE"
    most_disruptive_allowed_action = "REPLACE"
    replacement_method             = "SUBSTITUTE"
    type                           = "PROACTIVE"
  }
}
