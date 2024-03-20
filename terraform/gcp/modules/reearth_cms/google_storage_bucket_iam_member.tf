resource "google_storage_bucket_iam_member" "plateauview_tiles_is_app_tile_cache_object_admin" {
  bucket = google_storage_bucket.app_tile_cache.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.plateauview_tiles.email}"
}

