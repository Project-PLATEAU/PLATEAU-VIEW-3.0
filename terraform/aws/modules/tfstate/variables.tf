variable "prefix" {
  type        = string
  description = "作成されるリソース名のプレフィックス"
}


output "bucket_name" {
  value = aws_s3_bucket.tfstate.id
}