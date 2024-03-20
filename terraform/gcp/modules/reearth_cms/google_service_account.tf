resource "google_service_account" "cms_worker_m2m" {
  project      = data.google_project.project.project_id
  account_id   = "cms-worker-m2m"
  display_name = "Service Account for cms worker m2m"
}

resource "google_service_account" "reearth_cms" {
  project      = data.google_project.project.project_id
  account_id   = "reearth-cms"
  display_name = "Service Account for reearth cms api"
}

resource "google_service_account" "reearth_cms_worker" {
  project      = data.google_project.project.project_id
  account_id   = "reearth-cms-worker"
  display_name = "Service Account for reearth cms worker"
}

resource "google_service_account" "plateauview_api" {
  project      = data.google_project.project.project_id
  account_id   = "plateauview"
  display_name = "Service Account for PLATEAU View api"
}

resource "google_service_account" "plateauview_geo" {
  project      = data.google_project.project.project_id
  account_id   = "plateauview-geo"
  display_name = "Service Account for PLATEAU Geo"
}

resource "google_service_account" "plateauview_tiles" {
  project      = data.google_project.project.project_id
  account_id   = "plateauview-tiles"
  display_name = "plateauview-tiles"
}
