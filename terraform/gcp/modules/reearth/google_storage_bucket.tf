resource "google_storage_bucket" "static" {
  project       = data.google_project.project.project_id
  name          = "${var.prefix}-reearth-static-bucket"
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

