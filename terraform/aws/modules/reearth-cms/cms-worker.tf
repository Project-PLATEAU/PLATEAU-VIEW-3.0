resource "aws_apprunner_service" "reearth_cms_worker" {
  service_name = "${var.prefix}-reearth-cms-worker"
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
    instance_role_arn = aws_iam_role.reearth_cms_worker_instance.arn
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
      access_role_arn = aws_iam_role.reearth_cms_worker_access.arn
    }
    image_repository {
      image_identifier      = var.cms_worker_image_identifier
      image_repository_type = "ECR"
      image_configuration {
        port = "8080"

        runtime_environment_secrets = {
          for secret in toset(local.reearth_cms_worker_secret) : secret => aws_secretsmanager_secret.reearth_cms_worker_secret[secret].arn
        }
        runtime_environment_variables = {
          REEARTH_CMS_WORKER_DECOMPRESSION_NUM_WORKERS     = "500"
          REEARTH_CMS_WORKER_DECOMPRESSION_WORKQUEUE_DEPTH = "20000"
          REEARTH_CMS_WORKER_DEV                           = "true"
          REEARTH_CMS_WORKER_SNS_TOPICARN                  = aws_sns_topic.reearth_cms_notify.arn
          S3_ASSET_BASE_URL                                = "https://${aws_s3_bucket.reearth_cms_assets.bucket_domain_name}"
          S3_BUCKET_NAME                                   = aws_s3_bucket.reearth_cms_assets.id
        }
      }
    }
  }
}

resource "aws_iam_role" "reearth_cms_worker_access" {
  name = "${title(var.prefix)}ReearthCMSWorkerECRAccessRole"
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

resource "aws_iam_role_policy" "reearth_cms_worker_access" {
  name = "${title(var.prefix)}ReearthCMSWorkerECRAccessPolicy"
  role = aws_iam_role.reearth_cms_worker_access.id

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

resource "aws_iam_role" "reearth_cms_worker_instance" {
  name = "${title(var.prefix)}ReearthCMSWorkerInstanceRole"
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

resource "aws_iam_role_policy" "reearth_cms_worker_instance" {
  name = "${title(var.prefix)}ReearthCMWorkerInstancePolicy"
  role = aws_iam_role.reearth_cms_worker_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:*",
          "sns:*"
        ]
        Resource = "*"
      },
    ]
  })
}

locals {
  reearth_cms_worker_secret = [
    "REEARTH_CMS_WORKER_DB"
  ]
}

resource "aws_secretsmanager_secret" "reearth_cms_worker_secret" {
  for_each = toset(local.reearth_cms_worker_secret)
  name     = "${var.prefix}/reearth-cms/${each.value}"
}