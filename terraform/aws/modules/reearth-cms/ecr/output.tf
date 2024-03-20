output "cms_image_identifier" {
  value = aws_ecr_repository.cms.repository_url
}

output "cms_worker_image_identifier" {
  value = aws_ecr_repository.cms_worker.repository_url
}

output "plateauview_api_image_identifier" {
  value = aws_ecr_repository.plateauview_api.repository_url
}

output "plateauview_geo_image_identifier" {
  value = aws_ecr_repository.plateauview_geo.repository_url
}