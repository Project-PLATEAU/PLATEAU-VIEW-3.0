resource "aws_route53_zone" "reearth" {
  name = "${var.base_domain}."
}