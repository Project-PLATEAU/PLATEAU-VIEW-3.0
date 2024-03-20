resource "aws_apprunner_service" "reearth_server" {
  service_name = "${var.prefix}-reearth-server"
  health_check_configuration {
    healthy_threshold   = 1
    interval            = 10
    path                = "/"
    protocol            = "TCP"
    timeout             = 5
    unhealthy_threshold = 5
  }
  instance_configuration {
    cpu               = "512"
    instance_role_arn = aws_iam_role.reearth_server_instance.arn
    memory            = "1024"
  }
  network_configuration {
    ip_address_type = "IPV4"
    egress_configuration {
      egress_type = "DEFAULT"
    }
    ingress_configuration {
      is_publicly_accessible = true
    }
  }
  observability_configuration {
    observability_enabled = false
  }
  source_configuration {
    auto_deployments_enabled = true
    authentication_configuration {
      access_role_arn = aws_iam_role.reearth_server_access.arn
    }
    image_repository {
      image_identifier      = var.reearth_image_identifier
      image_repository_type = "ECR"
      image_configuration {
        port = "8080"

        runtime_environment_secrets = {
          for secret in toset(local.reearth_secret) : secret => aws_secretsmanager_secret.reearth_secret[secret].arn
        }

        runtime_environment_variables = {
          REEARTH_COGNITO_USERPOOLID = var.cognito_user_pool_id
          REEARTH_COGNITO_REGION     = var.region
          REEARTH_COGNITO_CLIENTID   = var.cognito_user_pool_client_id
          REEARTH_S3_BUCKETNAME      = aws_s3_bucket.reearth_static.id
          REEARTH_ASSETBASEURL       = "https://${aws_s3_bucket.reearth_static.bucket_domain_name}"
          REEARTH_ORIGINS            = "https://${var.reearth_domain}"
          REEARTH_HOST               = "https://${var.reearth_domain}"
          REEARTH_HOST_WEB           = "https://${var.reearth_domain}"
          REEARTH_DB_ACCOUNT         = "reearth-account"
          REEARTH_AUTHSRV_DISABLED   = true
          REEARTH_PUBLISHED_HOST     = "{}.${var.reearth_domain}"
          REEARTH_WEB_CONFIG = jsonencode({
            esiumIonAccessToken = var.cesium_ion_access_token
            unsafePluginUrls    = ["https://${var.plateauview_api_domain}/PlateauView3.js"]
            developerMode       = true
            authProvider        = "cognito"
            cognito = {
              region               = "us-east-1",
              userPoolId           = var.cognito_user_pool_id,
              userPoolWebClientId  = var.cognito_user_pool_client_id,
              oauthScope           = "email, openid, profile, aws.cognito.signin.user.admin",
              oauthDomain          = var.cognito_auth_domain,
              oauthRedirectSignIn  = "https://${var.reearth_domain}",
              oauthRedirectSignOut = "https://${var.reearth_domain}",
              oauthResponseType    = "code",
            }
          })
        }
      }
    }
  }
}

resource "aws_iam_role" "reearth_server_access" {
  name = "${title(var.prefix)}ReearthServerECRAccessRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      },
      {
        Effect = "Allow",
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role" "reearth_server_instance" {
  name = "${title(var.prefix)}ReearthServerInstanceRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      },
      {
        Effect = "Allow",
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "reearth_server_access" {
  name = "${title(var.prefix)}ReearthServerECRAccessPolicy"
  role = aws_iam_role.reearth_server_access.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy" "reearth_server_instance" {
  name = "${title(var.prefix)}ReearthServerInstancePolicy"
  role = aws_iam_role.reearth_server_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*",
        ]
        Resource = "*"
      },
    ]
  })
}

locals {
  reearth_secret = [
    "REEARTH_DB"
  ]
}


resource "aws_secretsmanager_secret" "reearth_secret" {
  for_each = toset(local.reearth_secret)
  name     = "${var.prefix}/reearth-server/${each.value}"
}