resource "aws_lambda_function" "lambda" {
  function_name = "${var.BASE_NAME}-lambda"
  role          = aws_iam_role.lambda_exec_role.arn
  runtime       = "nodejs20.x"
  handler       = "lambda.handler"

  filename = "${path.module}/../apps/backend/build/function.zip"

  memory_size = 128
  timeout     = 10

  environment {
    variables = {
      NODE_ENV           = "production"
      DATABASE_URL       = var.DATABASE_URL
      JWT_SECRET         = "secret"
      JWT_REFRESH_SECRET = "supersecret"
    }
  }

  tags = local.tags
}
