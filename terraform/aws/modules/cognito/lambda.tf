# #-------------------------------------------------------------------------------------------------------------
# # Lambda 関数の設定
# resource "aws_lambda_function" "reearth_cms_signup" {
#   function_name = "reearth-cms-user-register"
#   handler       = "index.handler" # ファイル名が index.js の場合
#   runtime       = "nodejs20.x"
#   role          = aws_iam_role.reearth_cms_signup.arn

#   # Lambda 関数のコードが含まれる ZIP ファイルのパス
#   filename         = data.archive_file.reearth_cms_signup.output_path
#   source_code_hash = data.archive_file.reearth_cms_signup.output_base64sha256
#   environment {
#     variables = {
#       API_ENDPOINT = var.signup_endpoint_url
#     }
#   }
# }

# data "archive_file" "reearth_cms_signup" {
#   type        = "zip"
#   source_dir  = "lambda/src"
#   output_path = "lambda/upload/function.zip"
# }

# # Lambda 関数の実行ロール
# resource "aws_iam_role" "reearth_cms_signup" {
#   name = "ReearthCMSUserRegiserLambdaRole"

#   assume_role_policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [{
#     "Action": "sts:AssumeRole",
#     "Principal": {"Service": "lambda.amazonaws.com"},
#     "Effect": "Allow"
#   }]
# }
# EOF
# }

# resource "aws_iam_role_policy" "reearth_cms_signup" {
#   name = "ReearthCMSUserRegiserLambdaPolicy"
#   role = aws_iam_role.reearth_cms_signup.id

#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "logs:CreateLogGroup",
#           "logs:CreateLogStream",
#           "logs:PutLogEvents"
#         ]
#         Resource = "*"
#       },
#     ]
#   })
# }

# # Lambda 関数に Cognito トリガーの実行権限を付与
# resource "aws_lambda_permission" "reearth_cms_signup" {
#   statement_id  = "AllowExecutionFromCognito"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.reearth_cms_signup.function_name
#   principal     = "cognito-idp.amazonaws.com"
#   source_arn    = aws_cognito_user_pool.reearth_cms.arn
# }