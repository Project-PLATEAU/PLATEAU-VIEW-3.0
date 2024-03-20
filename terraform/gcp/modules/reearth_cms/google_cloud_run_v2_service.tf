resource "google_cloud_run_v2_service" "plateauview_api" {
  project  = data.google_project.project.project_id
  name     = "plateauview-api"
  ingress  = "INGRESS_TRAFFIC_ALL"
  location = var.gcp_region

  template {
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
    service_account       = google_service_account.plateauview_api.email
    timeout               = "3600s"

    containers {
      image = "eukarya/plateauview2-sidecar:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "1Gi"
        }
      }

      ports {
        container_port = 8080
        name           = "http1"
      }

      dynamic "env" {
        for_each = { for i in local.plateauview_secrets : i => i }
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.plateauview[env.value].secret_id
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
        name  = "GOOGLE_CLOUD_REGION"
        value = var.gcp_region
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_CMS_BASEURL"
        value = "https://${local.api_cms_domain}"
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_CKAN_BASEURL"
        value = var.plateauview.ckan_base_url
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_CKAN_ORG"
        value = var.plateauview.ckan_org
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_CMS_PLATEAUPROJECT"
        value = var.plateauview.cms_plateau_project
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_CMS_SYSTEMPROJECT"
        value = var.plateauview.cms_system_project
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_DATACATALOG_CACHEGCPARCENT"
        value = var.plateauview.datacatalog_cache_percent
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_DATACATALOG_CACHESIZE"
        value = var.plateauview.datacatalog_cache_size
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_FME_BASEURL"
        value = var.plateauview.fme_baseurl
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_FME_URL_V3"
        value = var.plateauview.fme_url_v3
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_OPINION_TO"
        value = var.plateauview.option_to
      }

      env {
        name  = "REEARTH_PLATEAUVIEW_OPINION_FROM"
        value = var.plateauview.option_from
      }
    }

    scaling {
      max_instance_count = 10
    }
  }


  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  depends_on = [
    google_secret_manager_secret_version.plateauview_ckan_token,
    google_secret_manager_secret_version.plateauview_cms_token,
    google_secret_manager_secret_version.plateauview_fme_token,
    google_secret_manager_secret_version.plateauview_secret,
    google_secret_manager_secret_version.plateauview_sendgrid_api_key
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

resource "google_cloud_run_v2_service" "plateauview_geo" {
  project  = data.google_project.project.project_id
  name     = "plateauview-geo"
  ingress  = "INGRESS_TRAFFIC_ALL"
  location = var.gcp_region

  template {
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
    service_account       = google_service_account.plateauview_geo.email
    timeout               = "300s"

    containers {
      image = "eukarya/plateauview-geo:latest"
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

      env {
        name  = "GOOGLE_PROJECT_ID"
        value = var.gcp_project_id
      }

      env {
        name  = "ALLOW_ORIGIN"
        value = "[\"https://${local.reearth_domain}\", \"https://*.${var.domain}\"]"
      }

      env {
        name  = "TILE_CACHE_ROOT"
        value = "gs://${google_storage_bucket.app_tile_cache.name}/tiles"
      }
    }

    scaling {
      max_instance_count = 10
    }
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
}

resource "google_cloud_run_v2_service" "reearth_cms" {
  project  = data.google_project.project.project_id
  name     = "reearth-cms"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    execution_environment            = "EXECUTION_ENVIRONMENT_GEN2"
    max_instance_request_concurrency = 80
    service_account                  = google_service_account.reearth_cms.email
    timeout                          = "3600s"

    containers {
      image = "eukarya/plateauview2-reearth-cms:latest"

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
        for_each = { for i in local.reearth_cms_secrets : i => i }
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.reearth_cms[env.value].secret_id
              version = "latest"
            }
          }
        }
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = data.google_project.project.project_id
      }

      env {
        name  = "REEARTH_CMS_ASSETBASEURL"
        value = "https://${local.assets_cms_domain}"
      }

      env {
        name  = "REEARTH_CMS_AUTH0_AUDIENCE"
        value = "https://${local.api_cms_domain}"
      }

      env {
        name  = "REEARTH_CMS_AUTH0_DOMAIN"
        value = "https://${var.auth0_domain}"
      }

      env {
        name  = "REEARTH_CMS_AUTH0_WEBCLIENTID"
        value = module.auth0.auth0_client_spa.client_id
      }

      env {
        name  = "REEARTH_CMS_AUTHM2M_EMAIL"
        value = google_service_account.cms_worker_m2m.email
      }

      env {
        name  = "REEARTH_CMS_AUTHM2M_ISS"
        value = "https://accounts.google.com"
      }

      env {
        name  = "REEARTH_CMS_DB_ACCOUNT"
        value = "reearth-account"
      }

      env {
        name  = "REEARTH_CMS_GCS_BUCKETNAME"
        value = google_storage_bucket.assets.name
      }

      env {
        name  = "REEARTH_CMS_GRAPHQL_COMPLEXITYLIMIT"
        value = "6000"
      }

      env {
        name  = "REEARTH_CMS_HOST"
        value = "https://${local.api_cms_domain}"
      }

      env {
        name  = "REEARTH_CMS_ORIGINS"
        value = "https://${local.cms_domain}"
      }

      env {
        name  = "REEARTH_GCS_PUBLICATIONCACHECONTROL"
        value = "no-store"
      }

      env {
        name  = "REEARTH_HOST_WEB"
        value = "https://${local.cms_domain}"
      }

      env {
        name  = "REEARTH_CMS_AUTHM2M_AUD"
        value = "https://${local.api_cms_domain}"
      }

      env {
        name  = "REEARTH_CMS_TASK_DECOMPRESSORIMAGE"
        value = "reearth/reearth-cms-decompressor:rc"
      }

      env {
        name  = "REEARTH_CMS_TASK_GCPPROJECT"
        value = data.google_project.project.name
      }

      env {
        name  = "REEARTH_CMS_TASK_QUEUENAME"
        value = google_pubsub_topic.cms_decompress.name
      }

      env {
        name  = "REEARTH_CMS_TASK_SUBSCRIBERURL"
        value = "https://${local.worker_cms_domain}/api/decompress"
      }

      env {
        name  = "REEARTH_CMS_TASK_TOPIC"
        value = google_pubsub_topic.cms_webhook.name
      }

      env {
        name = "REEARTH_CMS_WEB_CONFIG"
        # Note: Cesium Ion Access Token is not a secret which will be expose to the frontend, but it is sensitive information.
        value = jsonencode({
          cesiumIonAccessToken = var.cesium_ion_access_token,
          coverImageUrl        = var.reearth_cms_web_config.coverImageUrl
          editorUrl            = "https://${local.reearth_domain}"
          logoUrl              = var.reearth_cms_web_config.logoUrl
        })
      }
    }

    scaling {
      max_instance_count = 10
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }

  depends_on = [
    google_secret_manager_secret_version.reearth_cms_db,
    google_secret_manager_secret_version.reearth_cms_auth0_client_secret
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].annotations["run.googleapis.com/client-name"],
      template[0].annotations["client.knative.dev/user-image"],
      template[0].annotations["run.googleapis.com/client-version"]
    ]
  }
}

resource "google_cloud_run_v2_service" "reearth_cms_worker" {
  project  = data.google_project.project.project_id
  name     = "reearth-cms-worker"
  location = var.gcp_region


  template {
    execution_environment            = "EXECUTION_ENVIRONMENT_GEN2"
    max_instance_request_concurrency = 1
    service_account                  = google_service_account.reearth_cms_worker.email
    timeout                          = "3600s"

    containers {
      image = "eukarya/plateauview2-reearth-cms-worker:latest"
      resources {
        limits = {
          cpu    = "8000m"
          memory = "32Gi"
        }
      }
      ports {
        container_port = 8080
        name           = "h2c"
      }

      dynamic "env" {
        for_each = { for i in local.reearth_cms_worker_secrets : i => i }
        content {
          name = env.value
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.reearth_cms_worker[env.value].secret_id
              version = "latest"
            }
          }
        }
      }

      env {
        name  = "GCS_BUCKET_NAME"
        value = google_storage_bucket.assets.name
      }

      env {
        name  = "REEARTH_CMS_WORKER_PUBSUB_TOPIC"
        value = "decompress"
      }

      env {
        name  = "REEARTH_CMS_WORKER_GCP_PROJECT"
        value = data.google_project.project.name
      }

      env {
        name  = "REEARTH_CMS_WORKER_DECOMPRESSION_NUM_WORKERS"
        value = "500"
      }

      env {
        name  = "REEARTH_CMS_WORKER_DECOMPRESSION_WORKQUEUE_DEPTH"
        value = "https://${var.auth0_domain}"
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.gcp_project_id
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }


  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].annotations["run.googleapis.com/client-name"],
      template[0].annotations["client.knative.dev/user-image"],
      template[0].annotations["run.googleapis.com/client-version"]
    ]
  }

  depends_on = [
    google_secret_manager_secret_version.plateauview_cms_webhook_secret,
  ]
}
