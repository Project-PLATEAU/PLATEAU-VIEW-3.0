resource "aws_s3_bucket" "reearth_static" {
  bucket = "${var.prefix}-reearth-static-bucket"
}

resource "aws_s3_bucket_ownership_controls" "reearth_static" {
  bucket = aws_s3_bucket.reearth_static.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "reearth_static" {
  bucket = aws_s3_bucket.reearth_static.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


resource "aws_s3_bucket_cors_configuration" "reearth_static" {
  bucket = aws_s3_bucket.reearth_static.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE"]
    allowed_origins = ["https://${var.reearth_domain}"]
    expose_headers  = ["ETag"]
  }
  depends_on = [aws_s3_bucket_public_access_block.reearth_static]
}


resource "aws_s3_bucket_policy" "reearth_static" {
  bucket = aws_s3_bucket.reearth_static.id
  policy = data.aws_iam_policy_document.reearth_static.json

  depends_on = [aws_s3_bucket_public_access_block.reearth_static]

}

data "aws_iam_policy_document" "reearth_static" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = [
      "s3:Get*",
    ]
    resources = [
      "${aws_s3_bucket.reearth_static.arn}/*",
    ]
  }
}