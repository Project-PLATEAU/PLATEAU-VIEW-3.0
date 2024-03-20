resource "aws_apprunner_custom_domain_association" "reearth_cms_server" {
  service_arn          = var.cms_app_runner_service_arn
  domain_name          = var.cms_domain
  enable_www_subdomain = false
}


resource "aws_route53_record" "reearth_cms_server" {
  zone_id = var.route53_zone_id
  name    = aws_apprunner_custom_domain_association.reearth_cms_server.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [aws_apprunner_custom_domain_association.reearth_cms_server.dns_target]
}

resource "aws_route53_record" "reearth_cms_server_certificate" {
  for_each = {
    for record in aws_apprunner_custom_domain_association.reearth_cms_server.certificate_validation_records : record.name => {
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

resource "aws_apprunner_custom_domain_association" "plateauview_api" {
  service_arn          = var.plateauview_api_app_runner_arn
  domain_name          = var.plateauview_api_domain
  enable_www_subdomain = false
}

resource "aws_route53_record" "plateauview_api" {
  zone_id = var.route53_zone_id
  name    = aws_apprunner_custom_domain_association.plateauview_api.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [aws_apprunner_custom_domain_association.plateauview_api.dns_target]
}

resource "aws_route53_record" "plateauview_api_certificate" {
  for_each = {
    for record in aws_apprunner_custom_domain_association.plateauview_api.certificate_validation_records : record.name => {
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

resource "aws_apprunner_custom_domain_association" "plateauview_geo" {
  service_arn          = var.plateauview_geo_app_runner_arn
  domain_name          = var.plateauview_geo_domain
  enable_www_subdomain = false
}


resource "aws_route53_record" "plateauview_geo" {
  zone_id = var.route53_zone_id
  name    = aws_apprunner_custom_domain_association.plateauview_geo.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [aws_apprunner_custom_domain_association.plateauview_geo.dns_target]
}

resource "aws_route53_record" "plateauview_geo_certificate" {
  for_each = {
    for record in aws_apprunner_custom_domain_association.plateauview_geo.certificate_validation_records : record.name => {
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

