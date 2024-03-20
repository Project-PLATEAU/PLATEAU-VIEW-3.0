resource "google_compute_firewall" "allow_lb" {
  project  = data.google_project.project.project_id
  name     = "allow-lb"
  network  = "default"
  priority = 1000

  allow {
    protocol = "tcp"
  }

  source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22"
  ]

  target_tags = ["lb-health-check"]
}
