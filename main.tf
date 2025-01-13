variable "PROJECT_NAME" {
  description = "Name of the project"
  type        = string
  default     = "url-shortener"
}

variable "BASE_NAME" {
  description = "Base name for the resources"
  type        = string
  default     = "novin"
}

variable "AWS_REGION" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-2"
}

variable "IMAGE_TAG" {
  description = "Docker image tag for the Lambda function"
  type        = string
  default     = "latest"
}

variable "DATABASE_URL" {
  description = "The connection string for the database"
  type        = string
  sensitive   = true
}

# Tags for resources
locals {
  tags = {
    Project = var.PROJECT_NAME
    Name    = "${var.BASE_NAME}-resources"
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"


}


provider "aws" {
  region = var.AWS_REGION
}

# ECR Repository
resource "aws_ecr_repository" "repository" {
  name = "${var.BASE_NAME}-repository"
}

# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.BASE_NAME}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM Policy for Full Access
resource "aws_iam_role_policy" "lambda_exec_policy" {
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "*",
        Resource = "*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "lambda" {
  function_name = "${var.BASE_NAME}-lambda"
  role          = aws_iam_role.lambda_exec_role.arn

  architectures = ["x86_64"]
  description   = "Lambda function for NestJS URL Shortener"
  package_type  = "Image"
  memory_size   = 128
  timeout       = 10
  image_uri     = "${aws_ecr_repository.repository_url}:${var.IMAGE_TAG}"
  publish       = true

  environment {
    variables = {
      NODE_ENV     = "production"
      DATABASE_URL = var.DATABASE_URL
    }
  }

  tags = local.tags
}

# Lambda Alias for version control
resource "aws_lambda_alias" "live" {
  name             = "live"
  function_name    = aws_lambda_function.lambda.function_name
  function_version = aws_lambda_function.lambda.version
}

# Lambda Provisioned Concurrency (Optional for faster cold start)
resource "aws_lambda_provisioned_concurrency_config" "lambda_concurrency" {
  function_name                     = aws_lambda_alias.live.function_name
  qualifier                         = aws_lambda_alias.live.name
  provisioned_concurrent_executions = 1
}

# CloudWatch Alarm for Lambda Errors
resource "aws_cloudwatch_metric_alarm" "lambda_error_alarm" {
  alarm_name          = "${var.BASE_NAME}-lambda-errors"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  alarm_description   = "Alarm when Lambda function errors exceed 1"
  dimensions = {
    FunctionName = aws_lambda_function.lambda.function_name
  }

  actions_enabled = true

  tags = local.tags
}
