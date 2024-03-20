resource "aws_apprunner_custom_domain_association" "reearth_server" {
  service_arn          = var.app_runner_service_arn
  domain_name          = var.reearth_domain
  enable_www_subdomain = false
}


resource "aws_route53_record" "reearth_server" {
  zone_id = var.route53_zone_id
  name    = aws_apprunner_custom_domain_association.reearth_server.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [aws_apprunner_custom_domain_association.reearth_server.dns_target]
}

resource "aws_route53_record" "reearth_server_certificate" {
  for_each = {
    for record in aws_apprunner_custom_domain_association.reearth_server.certificate_validation_records : record.name => {
      name   = record.name
      record = record.value
      type   = record.type
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = "300"
  records = [each.value.record]
}