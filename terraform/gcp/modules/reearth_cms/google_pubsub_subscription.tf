#TODO: subscriptionの設定を見直す
resource "google_pubsub_subscription" "cms_notify" {
  project = data.google_project.project.project_id
  name    = "notify-cms"
  topic   = google_pubsub_topic.cms_decompress.name

  push_config {
    push_endpoint = "https://${local.api_cms_domain}/api/notify"
    oidc_token {
      service_account_email = google_service_account.cms_worker_m2m.email
      audience              = "https://${local.api_cms_domain}"
    }
  }

  message_retention_duration = "604800s"
  retry_policy {
    maximum_backoff = "600s"
    minimum_backoff = "10s"
  }

  expiration_policy {
    ttl = ""
  }
}

resource "google_pubsub_subscription" "cms_webhook" {
  project = data.google_project.project.project_id
  name    = "cms-webhook"
  topic   = google_pubsub_topic.cms_webhook.name

  push_config {
    push_endpoint = "https://${local.worker_cms_domain}/api/webhook"
    oidc_token {
      service_account_email = google_service_account.cms_worker_m2m.email
    }
  }

  retry_policy {
    maximum_backoff = "600s"
    minimum_backoff = "10s"
  }

  expiration_policy {
    ttl = ""
  }
}
