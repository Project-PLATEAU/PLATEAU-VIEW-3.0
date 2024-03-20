resource "google_compute_resource_policy" "plateauview_tiles" {
  project = data.google_project.project.project_id
  name    = "plateauview-tiles"
  region  = var.gcp_region

  snapshot_schedule_policy {
    schedule {
      daily_schedule {
        days_in_cycle = 1
        start_time    = "01:00" # UTC (10:00 JST)
      }
    }
  }
}
