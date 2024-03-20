output "user_pool_id" {
  value = aws_cognito_user_pool.cognito.id
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.cognito.id
}

output "user_pool_endpoint" {
  value = aws_cognito_user_pool.cognito.endpoint
}

output "auth_domain" {
  value = "${local.user_pool_domain_prefix}.auth.${var.region}.amazoncognito.com"
}