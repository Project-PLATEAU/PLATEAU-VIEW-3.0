data "cloudinit_config" "plateauview_tiles" {
  gzip          = false
  base64_encode = false

  part {
    content_type = "text/cloud-config"
    content = templatefile("${path.module}/cloud-init.yaml", {
      cache_bucket   = google_storage_bucket.app_tile_cache.name
      reearth_domain = local.reearth_domain
    })
    filename = "cloud-init.yaml"
  }
}
