resource "google_compute_instance_template" "plateauview_tiles" {
  project     = data.google_project.project.project_id
  name_prefix = "plateauview-tiles-"
  description = "Run Re:Earth Plateau Tiles on GPU instances"

  instance_description = "description assigned to instances"

  # # NVIDIA L4
  # Ref: https://cloud.google.com/compute/docs/gpus
  machine_type = "g2-standard-4"

  disk {
    auto_delete  = true
    boot         = true
    disk_size_gb = 50 # GB (minimum is 10GB but it is likely to be fully utilized on using Docker)
    disk_type    = "pd-ssd"

    // backup the disk every day
    resource_policies = [google_compute_resource_policy.plateauview_tiles.id]

    source_image = "cos-cloud/cos-stable" # Container-Optimized OS from Google
  }

  metadata = {
    google-logging-enabled    = true
    google-monitoring-enabled = true
    user-data                 = data.cloudinit_config.plateauview_tiles.rendered
  }

  network_interface {
    network = "default"

    # Ephemeral IP
    # Ideally, the instance should not have a public IP address and the egress traffic should be routed through a NAT gateway.
    # On the other hand, currently, the existing infrastructure is using a public IP address for the instance for simplicity.
    access_config {}
  }

  service_account {
    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    # Use user-managed service accounts for fine-grained control over permissions.
    # Ref: https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances
    email  = google_service_account.plateauview_tiles.email
    scopes = ["cloud-platform"]
  }

  scheduling {
    automatic_restart = true

    # Live migration is not supported for VMs with GPUs.
    # Ref: https://cloud.google.com/compute/docs/instances/live-migration-process#limitations
    # Issue Tracker: https://issuetracker.google.com/issues/243455301
    on_host_maintenance = "TERMINATE"
  }

  tags = [
    "lb-health-check",
  ]

  lifecycle {
    create_before_destroy = true
  }
}
