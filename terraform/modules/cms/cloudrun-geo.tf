locals {
  plateauview_geo_secret = []
  plateauview_geo_ramdom = []
}

resource "google_cloud_run_service" "plateauview_geo" {
  name                       = "plateauview-geo"
  location                   = var.gcp_region
  autogenerate_revision_name = true
  metadata {
    annotations = {
      "run.googleapis.com/launch-stage"   = "BETA"
      "run.googleapis.com/ingress"        = "all"
      "run.googleapis.com/ingress-status" = "all"
    }
  }

  template {
    spec {
      service_account_name = google_service_account.plateauview_geo.email
      timeout_seconds      = 3600
      containers {
        # 初回作成時にreearth/reearthを指定すると、環境変数の設定不足で立ち上がらない。
        # そのため、一時的にサンプルアプリケーションでで作成し、セットアップ完了後にgcloudでdeployを行う。
        image = "gcr.io/cloudrun/hello"
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
          name  = "REEARTH_GEO_GCS_BUCKETNAME"
          value = google_storage_bucket.assets.name
        }
        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.gcp_project_name
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"         = "10"
        "run.googleapis.com/execution-environment" = "gen2"
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
  lifecycle {
    ignore_changes = [
      metadata[0].annotations,
      template[0].spec[0].containers[0].image,
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"]
    ]
  }
  depends_on = []
}

resource "google_cloud_run_service_iam_policy" "plateauview_geo_noauth" {
  location    = var.gcp_region
  project     = var.gcp_project_name
  service     = google_cloud_run_service.plateauview_geo.name
  policy_data = data.google_iam_policy.noauth.policy_data
}
