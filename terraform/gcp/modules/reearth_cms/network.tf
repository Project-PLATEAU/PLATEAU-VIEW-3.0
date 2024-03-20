
resource "google_compute_target_http_proxy" "cms" {
  project    = data.google_project.project.project_id
  name       = "${var.prefix}-http-targetproxy"
  proxy_bind = "false"
  url_map    = google_compute_url_map.cms.id
}

resource "google_compute_target_https_proxy" "cms" {
  project          = data.google_project.project.project_id
  name             = "${var.prefix}-common-https-targetproxy"
  url_map          = google_compute_url_map.cms.id
  ssl_certificates = [google_compute_managed_ssl_certificate.common.id]
}

resource "google_compute_managed_ssl_certificate" "common" {
  project = data.google_project.project.project_id
  name    = "${var.prefix}-common-cert"

  managed {
    domains = [
      local.api_domain,
      local.api_cms_domain,
      local.assets_cms_domain,
      local.cms_domain,
      local.geo_domain,
      local.tiles_domain,
      local.worker_cms_domain
    ]
  }
}

resource "google_compute_global_address" "cms_lb" {
  project = data.google_project.project.project_id
  name    = "${var.prefix}-lb"
}

resource "google_compute_global_forwarding_rule" "cms_https" {
  project    = data.google_project.project.project_id
  name       = "${var.prefix}-https"
  target     = google_compute_target_https_proxy.cms.self_link
  port_range = "443"
  ip_address = google_compute_global_address.cms_lb.address

  depends_on = [google_compute_url_map.cms]
}

resource "google_compute_global_forwarding_rule" "reearth_http" {
  project    = data.google_project.project.project_id
  name       = "${var.prefix}-http-redirect"
  target     = google_compute_target_http_proxy.cms.self_link
  port_range = "80"
  ip_address = google_compute_global_address.cms_lb.address

  depends_on = [google_compute_url_map.cms]
}

resource "google_compute_url_map" "cms_redirect" {
  project = data.google_project.project.project_id
  name    = "${var.prefix}-https-redirect"
  default_url_redirect {
    https_redirect         = "true"
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = "false"
  }

  description = "HTTP to HTTPS redirect forwarding rule"
}

resource "google_compute_url_map" "cms" {
  project     = data.google_project.project.project_id
  name        = "cms-common-urlmap"
  description = "cms common urlmap"

  default_service = google_compute_backend_service.cms.self_link

  host_rule {
    hosts = [
      local.cms_domain,
      local.api_cms_domain,
    ]
    path_matcher = "path-matcher-1"
  }

  path_matcher {
    default_service = google_compute_backend_service.cms.self_link
    name            = "path-matcher-1"
  }

  host_rule {
    hosts = [
      local.assets_cms_domain,
    ]
    path_matcher = "path-matcher-2"
  }

  path_matcher {
    default_service = google_compute_backend_bucket.assets_backend.self_link
    name            = "path-matcher-2"
  }

  host_rule {
    hosts = [
      local.api_domain,
    ]
    path_matcher = "path-matcher-3"
  }

  path_matcher {
    default_service = google_compute_backend_service.plateauview_api.self_link
    name            = "path-matcher-3"
  }

  host_rule {
    hosts = [
      local.worker_cms_domain,
    ]
    path_matcher = "path-matcher-4"
  }

  path_matcher {
    default_service = google_compute_backend_service.cms_worker.self_link
    name            = "path-matcher-4"
  }

  host_rule {
    hosts = [
      local.geo_domain,
    ]
    path_matcher = "path-matcher-5"
  }

  path_matcher {
    default_service = google_compute_backend_service.plateauview_geo.self_link
    name            = "path-matcher-5"
  }


  host_rule {
    hosts = [
      local.tiles_domain,
    ]
    path_matcher = "path-matcher-6"
  }

  path_matcher {
    default_service = google_compute_backend_service.plateauview_tiles.self_link
    name            = "path-matcher-6"
  }
}

resource "google_compute_backend_bucket" "assets_backend" {
  project     = data.google_project.project.project_id
  name        = "${var.prefix}-assets-backend"
  bucket_name = google_storage_bucket.assets.name
  enable_cdn  = true
  cdn_policy {
    signed_url_cache_max_age_sec = 7200
  }
}


resource "google_compute_region_network_endpoint_group" "cms_api" {
  project               = data.google_project.project.project_id
  name                  = "${var.prefix}-cms-api-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp_region
  cloud_run {
    service = google_cloud_run_v2_service.reearth_cms.name
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_backend_service" "cms" {
  project                 = data.google_project.project.project_id
  affinity_cookie_ttl_sec = "0"

  enable_cdn = true
  cdn_policy {
    signed_url_cache_max_age_sec = 7200
  }

  backend {
    balancing_mode               = "UTILIZATION"
    capacity_scaler              = "0"
    group                        = google_compute_region_network_endpoint_group.cms_api.id
    max_connections              = "0"
    max_connections_per_endpoint = "0"
    max_connections_per_instance = "0"
    max_rate                     = "0"
    max_rate_per_endpoint        = "0"
    max_rate_per_instance        = "0"
    max_utilization              = "0"
  }

  connection_draining_timeout_sec = "0"
  description                     = "cms-api-neg"
  load_balancing_scheme           = "EXTERNAL"

  log_config {
    enable      = "true"
    sample_rate = "1"
  }

  name             = "cms-api-backend"
  port_name        = "http"
  protocol         = "HTTPS"
  session_affinity = "NONE"
  timeout_sec      = "30"

  lifecycle {
    create_before_destroy = true
  }

}


resource "google_compute_region_network_endpoint_group" "plateauview_api" {
  project               = data.google_project.project.project_id
  name                  = "${var.prefix}-plateauview-api-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp_region
  cloud_run {
    service = google_cloud_run_v2_service.plateauview_api.name
  }
}

resource "google_compute_region_network_endpoint_group" "plateauview_geo" {
  project               = data.google_project.project.project_id
  name                  = "${var.prefix}-plateauview-geo-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp_region
  cloud_run {
    service = google_cloud_run_v2_service.plateauview_geo.name
  }
}

resource "google_compute_backend_service" "plateauview_api" {
  project                 = data.google_project.project.project_id
  affinity_cookie_ttl_sec = "0"
  enable_cdn              = true
  cdn_policy {
    signed_url_cache_max_age_sec = 7200
  }

  backend {
    balancing_mode               = "UTILIZATION"
    capacity_scaler              = "0"
    group                        = google_compute_region_network_endpoint_group.plateauview_api.id
    max_connections              = "0"
    max_connections_per_endpoint = "0"
    max_connections_per_instance = "0"
    max_rate                     = "0"
    max_rate_per_endpoint        = "0"
    max_rate_per_instance        = "0"
    max_utilization              = "0"
  }

  connection_draining_timeout_sec = "0"
  description                     = "plateauview-api-neg"
  load_balancing_scheme           = "EXTERNAL"

  log_config {
    enable      = "true"
    sample_rate = "1"
  }

  name             = "plateauview-api-backend"
  port_name        = "http"
  protocol         = "HTTPS"
  session_affinity = "NONE"
  timeout_sec      = "30"
}

resource "google_compute_backend_service" "plateauview_geo" {
  project                 = data.google_project.project.project_id
  affinity_cookie_ttl_sec = "0"
  enable_cdn              = true

  backend {
    balancing_mode               = "UTILIZATION"
    capacity_scaler              = "0"
    group                        = google_compute_region_network_endpoint_group.plateauview_geo.id
    max_connections              = "0"
    max_connections_per_endpoint = "0"
    max_connections_per_instance = "0"
    max_rate                     = "0"
    max_rate_per_endpoint        = "0"
    max_rate_per_instance        = "0"
    max_utilization              = "0"
  }

  connection_draining_timeout_sec = "0"
  description                     = "plateauview-geo-neg"
  load_balancing_scheme           = "EXTERNAL"

  log_config {
    enable      = "true"
    sample_rate = "1"
  }

  name             = "plateauview-geo-backend"
  port_name        = "http"
  protocol         = "HTTPS"
  session_affinity = "NONE"
  timeout_sec      = "30"
}

resource "google_compute_region_network_endpoint_group" "cms_worker" {
  project               = data.google_project.project.project_id
  name                  = "${var.prefix}-cms-worker-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp_region
  cloud_run {
    service = google_cloud_run_v2_service.reearth_cms_worker.name
  }
}

resource "google_compute_backend_service" "cms_worker" {
  project                 = data.google_project.project.project_id
  affinity_cookie_ttl_sec = "0"
  backend {
    balancing_mode               = "UTILIZATION"
    capacity_scaler              = "0"
    group                        = google_compute_region_network_endpoint_group.cms_worker.id
    max_connections              = "0"
    max_connections_per_endpoint = "0"
    max_connections_per_instance = "0"
    max_rate                     = "0"
    max_rate_per_endpoint        = "0"
    max_rate_per_instance        = "0"
    max_utilization              = "0"
  }

  connection_draining_timeout_sec = "0"
  description                     = "cms-worker-neg"
  enable_cdn                      = "false"
  load_balancing_scheme           = "EXTERNAL"

  log_config {
    enable      = "true"
    sample_rate = "1"
  }

  name             = "cms-worker-backend"
  port_name        = "http"
  protocol         = "HTTPS"
  session_affinity = "NONE"
  timeout_sec      = "30"
}
