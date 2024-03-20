resource "google_cloud_run_v2_service" "reearth_api" {
  project  = data.google_project.project.project_id
  name     = "reearth-api"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "eukarya/plateauview2-reearth:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
      ports {
        container_port = 8080
        name           = "h2c"
      }

      dynamic "env" {
        for_each = { for i in local.reearth_secrets : i => i }
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.reearth[env.value].secret_id
              version = "latest"
            }
          }
        }
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.gcp_project_id
      }

      env {
        name  = "REEARTH_AUTH0_DOMAIN"
        value = "https://${var.auth0_domain}"
      }

      env {
        name  = "REEARTH_DB_ACCOUNT"
        value = "reearth-account"
      }

      env {
        name  = "REEARTH_GCS_BUCKETNAME"
        value = google_storage_bucket.static.name
      }

      env {
        name  = "REEARTH_ASSETBASEURL"
        value = "https://${local.static_reearth_domain}"
      }

      env {
        name  = "REEARTH_TRACERSAMPLE"
        value = ".0"
      }

      env {
        name  = "REEARTH_GCS_PUBLICATIONCACHECONTROL"
        value = "no-store"
      }

      env {
        name  = "REEARTH_ORIGINS"
        value = "https://${local.reearth_domain}"
      }

      env {
        name  = "REEARTH_AUTHSRV_DISABLED"
        value = "true"
      }

      env {
        name  = "REEARTH_HOST"
        value = "https://${local.api_reearth_domain}"
      }

      env {
        name  = "REEARTH_HOST_WEB"
        value = "https://${local.reearth_domain}"
      }

      env {
        name  = "REEARTH_AUTH0_AUDIENCE"
        value = "https://${local.api_reearth_domain}"
      }

      env {
        name  = "REEARTH_MARKETPLACE_ENDPOINT"
        value = "https://api.marketplace.reearth.io"
      }

      env {
        name  = "REEARTH_PUBLISHED_HOST"
        value = "{}.${local.reearth_domain}"
      }

      env {
        name  = "REEARTH_AUTH0_WEBCLIENTID"
        value = module.auth0.auth0_client_spa.client_id
      }

      env {
        name = "REEARTH_WEB_CONFIG"
        value = jsonencode({
          brand = {
            background = var.reearth_web_config.brand.background
            logoUrl    = var.reearth_web_config.brand.logoUrl
          }
          cesiumIonAccessToken = var.cesium_ion_access_token
          developerMode        = true
          ip                   = google_compute_global_address.reearth_lb.address
          unsafePluginUrls : [
            "https://${local.api_domain}/PlateauView3.js"
          ]
        })
      }
    }

    scaling {
      max_instance_count = 100
    }

    service_account = google_service_account.reearth.email
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }

  depends_on = [
    google_secret_manager_secret_version.reearth_REEARTH_DB,
    google_secret_manager_secret_version.reearth_REEARTH_MARKETPLACE_SECRET,
  ]
}
