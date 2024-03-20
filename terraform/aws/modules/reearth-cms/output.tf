output "cms_app_runner_service_arn" {
  value = aws_apprunner_service.reearth_cms_server.arn
}

output "plateauview_api_app_runner_arn" {
  value = aws_apprunner_service.plateauview_api.arn
}

output "plateauview_geo_app_runner_arn" {
  value = aws_apprunner_service.plateauview_geo.arn
}