data "google_dns_managed_zone" "reearth" {
  project = data.google_project.project.project_id
  name    = var.dns_managed_zone_name
}
