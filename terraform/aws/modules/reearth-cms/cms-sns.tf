resource "aws_sns_topic" "reearth_cms_decompress" {
  name = "${var.prefix}-reearth-cms-decompress"
}

resource "aws_sns_topic" "reearth_cms_webhook" {
  name = "${var.prefix}-reearth-cms-webhook"
}

resource "aws_sns_topic" "reearth_cms_notify" {
  name = "${var.prefix}-reearth-cms-notify"
}

resource "aws_sns_topic_subscription" "reearth_cms_decompress" {
  topic_arn = aws_sns_topic.reearth_cms_decompress.arn
  protocol  = "https"
  endpoint  = "https://${aws_apprunner_service.reearth_cms_worker.service_url}/api/decompress"
}

resource "aws_sns_topic_subscription" "reearth_cms_webhook" {
  topic_arn = aws_sns_topic.reearth_cms_webhook.arn
  protocol  = "https"
  endpoint  = "https://${aws_apprunner_service.reearth_cms_worker.service_url}/api/webhook"
}

resource "aws_sns_topic_subscription" "reearth_cms_notify" {
  topic_arn = aws_sns_topic.reearth_cms_notify.arn
  protocol  = "https"
  endpoint  = "https://${aws_apprunner_service.reearth_cms_server.service_url}/api/notify?token=${random_string.reearth_cms_notify_token.result}"
}

resource "random_string" "reearth_cms_notify_token" {
  length  = 32
  special = false
}