resource "google_dns_record_set" "api" {
  project = data.google_project.project.project_id
  name    = "${local.api_cms_domain}."
  type    = "CNAME"
  ttl     = 60

  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = ["${local.cms_domain}."]
}

resource "google_dns_record_set" "app" {
  project      = data.google_project.project.project_id
  name         = "${local.cms_domain}."
  type         = "A"
  ttl          = 60
  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = [google_compute_global_address.cms_lb.address]
}

resource "google_dns_record_set" "assets" {
  project = data.google_project.project.project_id
  name    = "${local.assets_cms_domain}."
  type    = "CNAME"
  ttl     = 60

  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = ["${local.cms_domain}."]
}

resource "google_dns_record_set" "plateauview_api" {
  project = data.google_project.project.project_id
  name    = "${local.api_domain}."
  type    = "CNAME"
  ttl     = 60

  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = ["${local.cms_domain}."]
}

resource "google_dns_record_set" "plateauview_geo" {
  project = data.google_project.project.project_id
  name    = "${local.geo_domain}."
  type    = "CNAME"
  ttl     = 60

  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = ["${local.cms_domain}."]
}

resource "google_dns_record_set" "plateauview_tiles" {
  project = data.google_project.project.project_id
  name    = "${local.tiles_domain}."
  type    = "CNAME"
  ttl     = 60

  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = ["${local.cms_domain}."]
}

resource "google_dns_record_set" "worker" {
  project = data.google_project.project.project_id
  name    = "${local.worker_cms_domain}."
  type    = "CNAME"
  ttl     = 60

  managed_zone = data.google_dns_managed_zone.cms.name
  rrdatas      = ["${local.cms_domain}."]
}
