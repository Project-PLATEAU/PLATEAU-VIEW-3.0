resource "aws_s3_bucket" "reearth_cms_assets" {
  bucket = "${var.prefix}-reearth-cms-asset"
}

resource "aws_s3_bucket_public_access_block" "reearth_cms_assets" {
  bucket = aws_s3_bucket.reearth_cms_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_cors_configuration" "reearth_cms_assets" {
  bucket = aws_s3_bucket.reearth_cms_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE"]
    allowed_origins = ["https://${var.cms_domain}"]
    expose_headers  = ["ETag"]
  }

  depends_on = [aws_s3_bucket_public_access_block.reearth_cms_assets]
}


resource "aws_s3_bucket_policy" "reearth_cms_assets" {
  bucket = aws_s3_bucket.reearth_cms_assets.id
  policy = data.aws_iam_policy_document.reearth_cms_assets.json

  depends_on = [aws_s3_bucket_public_access_block.reearth_cms_assets]
}

data "aws_iam_policy_document" "reearth_cms_assets" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:Get*",
    ]

    resources = [
      "${aws_s3_bucket.reearth_cms_assets.arn}/*",
    ]
  }
}