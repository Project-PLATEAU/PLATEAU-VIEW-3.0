resource "aws_ecr_repository" "cms" {
  name                 = "${var.prefix}-reearth-cms-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "cms_worker" {
  name                 = "${var.prefix}-reearth-cms-worker"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}


resource "aws_ecr_repository" "plateauview_api" {
  name                 = "${var.prefix}-plateauview-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "plateauview_geo" {
  name                 = "${var.prefix}-plateauview-geo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

