resource "google_storage_bucket" "app_tile_cache" {
  project       = data.google_project.project.project_id
  name          = "${var.prefix}-app-tile-cache"
  location      = "ASIA"
  storage_class = "MULTI_REGIONAL"
}

resource "google_storage_bucket" "assets" {
  project       = data.google_project.project.project_id
  name          = "${var.prefix}-cms-assets-bucket"
  location      = "ASIA"
  storage_class = "MULTI_REGIONAL"

  cors {
    max_age_seconds = 60
    method = [
      "GET",
      "PATCH",
      "POST",
      "PUT",
      "HEAD",
      "OPTIONS",
    ]
    origin = [
      "*"
    ]
    response_header = [
      "Content-Type",
      "Access-Control-Allow-Origin"
    ]
  }

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket" "plateauview_worker_temp" {
  project       = data.google_project.project.project_id
  name          = "${var.prefix}-plateauview-worker-temp"
  location      = "ASIA"
  storage_class = "MULTI_REGIONAL"

  cors {
    max_age_seconds = 60
    method = [
      "GET",
      "HEAD",
      "OPTIONS",
    ]
    origin = [
      "*"
    ]
    response_header = [
      "Content-Type",
      "Access-Control-Allow-Origin"
    ]
  }

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}
