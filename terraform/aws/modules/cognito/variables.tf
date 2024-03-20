variable "prefix" {
  type        = string
  description = "service name prefix"
}

variable "region" {
  type        = string
  description = "aws region"
}


variable "cognito_callback_urls" {
  type        = list(string)
  description = "cognito callback urls"
}

variable "cognito_logout_urls" {
  type        = list(string)
  description = "cognito logout urls"
}

variable "example_user_email" {
  type        = string
  description = "example user email"
}

variable "example_user_name" {
  type        = string
  description = "example user name"
}

variable "signup_endpoint_url" {
  type        = string
  description = "describe your variable"
}