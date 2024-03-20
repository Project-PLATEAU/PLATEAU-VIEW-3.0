resource "aws_s3_bucket" "plateauview_geo_tile" {
  bucket = "${var.prefix}-plateauview-app-tile-cache"
}

resource "aws_s3_bucket_ownership_controls" "plateauview_geo_tile" {
  bucket = aws_s3_bucket.plateauview_geo_tile.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "plateauview_geo_tile" {
  bucket = aws_s3_bucket.plateauview_geo_tile.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


resource "aws_s3_bucket_cors_configuration" "plateauview_geo_tile" {
  bucket = aws_s3_bucket.plateauview_geo_tile.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE"]
    allowed_origins = ["https://${var.reearth_domain}"]
    expose_headers  = ["ETag"]
    # max_age_seconds = 3000
  }
  depends_on = [aws_s3_bucket_public_access_block.plateauview_geo_tile]
}


resource "aws_s3_bucket_policy" "plateauview_geo_tile" {
  bucket = aws_s3_bucket.plateauview_geo_tile.id
  policy = data.aws_iam_policy_document.plateauview_geo_tile.json

  depends_on = [aws_s3_bucket_public_access_block.plateauview_geo_tile]
}

data "aws_iam_policy_document" "plateauview_geo_tile" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:Get*",
    ]

    resources = [
      "${aws_s3_bucket.plateauview_geo_tile.arn}/*",
    ]
  }
}