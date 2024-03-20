resource "aws_apprunner_service" "plateauview_geo" {
  service_name = "${var.prefix}-plateauview-geo"
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
    instance_role_arn = aws_iam_role.plateauview_geo_instance.arn
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
      access_role_arn = aws_iam_role.plateauview_geo_access.arn
    }
    image_repository {
      image_identifier      = var.plateauview_geo_image_identifier
      image_repository_type = "ECR"
      image_configuration {
        port                        = "8080"
        runtime_environment_secrets = {}
        runtime_environment_variables = {
          ALLOW_ORIGIN    = "[\"https://${var.reearth_domain}\",\"https://*.${var.reearth_domain}\"]"
          TILE_CACHE_ROOT = "s3://${aws_s3_bucket.plateauview_geo_tile.id}"
        }
      }

    }
  }
}

resource "aws_iam_role" "plateauview_geo_access" {
  name = "${title(var.prefix)}PlateauviewGeoECRAccessRole"
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

resource "aws_iam_role" "plateauview_geo_instance" {
  name = "${title(var.prefix)}PlateauviewGeoInstanceRole"
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

resource "aws_iam_role_policy" "plateauview_geo_access" {
  name = "${title(var.prefix)}PlateauviewGeoECRAccessPolicy"
  role = aws_iam_role.plateauview_geo_access.id

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

resource "aws_iam_role_policy" "plateauview_geo_instance" {
  name = "${title(var.prefix)}PlateauviewGeoInstancePolicy"
  role = aws_iam_role.plateauview_geo_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
        ]
        Resource = [
          "${aws_s3_bucket.plateauview_geo_tile.arn}/*",
        ]
      },
    ]
  })
}