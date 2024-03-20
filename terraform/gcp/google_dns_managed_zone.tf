resource "google_dns_managed_zone" "zone" {
  project     = data.google_project.project.project_id
  description = "Managed zone for ${var.domain}"
  dns_name    = "${var.domain}."
  name        = replace(var.domain, ".", "-")
}
