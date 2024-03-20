resource "aws_cognito_user_pool" "cognito" {
  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]
  deletion_protection      = "ACTIVE"
  mfa_configuration        = "OFF"
  name                     = "${var.prefix}-plateauview-pool"
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  admin_create_user_config {
    allow_admin_create_user_only = true
  }
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }
  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true
    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }
  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }
  username_configuration {
    case_sensitive = false
  }
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  # lambda_config {
  #   post_confirmation = aws_lambda_function.reearth_cms_signup.arn
  # }

}

resource "aws_cognito_user_pool_client" "cognito" {
  access_token_validity                         = 60
  allowed_oauth_flows                           = ["code"]
  allowed_oauth_flows_user_pool_client          = true
  allowed_oauth_scopes                          = ["aws.cognito.signin.user.admin", "email", "openid", "profile"]
  auth_session_validity                         = 3
  callback_urls                                 = var.cognito_callback_urls
  enable_propagate_additional_user_context_data = false
  enable_token_revocation                       = true
  explicit_auth_flows                           = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"]
  id_token_validity                             = 60
  logout_urls                                   = var.cognito_logout_urls
  name                                          = "$[var.prefix}-plateauview-client"
  prevent_user_existence_errors                 = "ENABLED"
  read_attributes                               = ["address", "birthdate", "email", "email_verified", "family_name", "gender", "given_name", "locale", "middle_name", "name", "nickname", "phone_number", "phone_number_verified", "picture", "preferred_username", "profile", "updated_at", "website", "zoneinfo"]
  refresh_token_validity                        = 30
  supported_identity_providers                  = ["COGNITO"]
  user_pool_id                                  = aws_cognito_user_pool.cognito.id
  write_attributes                              = ["address", "birthdate", "email", "family_name", "gender", "given_name", "locale", "middle_name", "name", "nickname", "phone_number", "picture", "preferred_username", "profile", "updated_at", "website", "zoneinfo"]
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

locals {
  user_pool_domain_prefix = "${var.prefix}-plateauview"
}


resource "aws_cognito_user_pool_domain" "cognito" {
  domain       = local.user_pool_domain_prefix
  user_pool_id = aws_cognito_user_pool.cognito.id
}


resource "aws_cognito_user" "test_user" {
  attributes = {
    email          = var.example_user_email
    email_verified = "true"
  }
  enabled      = true
  password     = random_string.test_user.result
  user_pool_id = aws_cognito_user_pool.cognito.id
  username     = var.example_user_name
}

resource "random_string" "test_user" {
  length  = 32
  special = true
}

output "test_user_passoword" {
  value = random_string.test_user.result
}