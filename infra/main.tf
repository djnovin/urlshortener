locals {
  tags = {
    Project = var.PROJECT_NAME
    Name    = "${var.BASE_NAME}-resources"
  }
}

# ECR Repository
resource "aws_ecr_repository" "repository" {
  name = "${var.BASE_NAME}-repository"

  lifecycle {
    prevent_destroy = true
  }
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

  lifecycle {
    prevent_destroy = true
  }
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
  image_uri     = "${aws_ecr_repository.repository.repository_url}:${var.IMAGE_TAG}"
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

resource "aws_appautoscaling_target" "lambda_scaling" {
  max_capacity       = 1
  min_capacity       = 0
  resource_id        = "function:${aws_lambda_function.lambda.function_name}:live"
  scalable_dimension = "lambda:function:ProvisionedConcurrency"
  service_namespace  = "lambda"
}

resource "aws_appautoscaling_policy" "scale_up" {
  name               = "${var.BASE_NAME}-scale-up"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.lambda_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.lambda_scaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.lambda_scaling.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0
    predefined_metric_specification {
      predefined_metric_type = "LambdaProvisionedConcurrencyUtilization"
    }
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

resource "aws_appautoscaling_policy" "scale_down" {
  name               = "${var.BASE_NAME}-scale-down"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.lambda_scaling.resource_id
  scalable_dimension = aws_appautoscaling_target.lambda_scaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.lambda_scaling.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 30.0
    predefined_metric_specification {
      predefined_metric_type = "LambdaProvisionedConcurrencyUtilization"
    }
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# S3 Bucket for Static Site Hosting
resource "aws_s3_bucket" "astro_site" {
  bucket        = "${var.BASE_NAME}-astro-site"
  force_destroy = true

  tags = local.tags
}

resource "aws_s3_bucket_website_configuration" "astro_site" {
  bucket = aws_s3_bucket.astro_site.bucket

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "404.html"
  }
}

# S3 Bucket Policy for Public Access
resource "aws_s3_bucket_policy" "astro_site_policy" {
  bucket = aws_s3_bucket.astro_site.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.astro_site.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution for S3 Site
resource "aws_cloudfront_distribution" "astro_site" {
  origin {
    domain_name = "${aws_s3_bucket.astro_site.bucket}.s3.amazonaws.com"
    origin_id   = "S3-${aws_s3_bucket.astro_site.bucket}"
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.astro_site.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.tags
}

resource "aws_db_instance" "postgres" {
  identifier             = "my-app-db"
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  engine_version         = "14.5"
  username               = var.DB_USERNAME
  password               = var.DB_PASSWORD
  publicly_accessible    = true
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.postgres_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres_subnet.name

  tags = {
    Name = "MyApp-Postgres"
  }
}

resource "aws_security_group" "postgres_sg" {
  name_prefix = "postgres-sg"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict this in production!
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "postgres_subnet" {
  name       = "postgres-subnet-group"
  subnet_ids = var.SUBNET_IDS
}

resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  alarm_name          = "${var.BASE_NAME}-rds-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80 # Alarm when CPU utilization exceeds 80%
  alarm_description   = "Alarm when RDS CPU utilization exceeds 80% for 10 minutes"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
  actions_enabled = true
}

resource "aws_cloudwatch_metric_alarm" "free_storage_space" {
  alarm_name          = "${var.BASE_NAME}-rds-free-storage-space"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10000000000 # Alarm when free storage space drops below 10 GB
  alarm_description   = "Alarm when RDS free storage space is less than 10 GB for 10 minutes"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
  actions_enabled = true
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "${var.BASE_NAME}-rds-database-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 100 # Alarm when database connections exceed 100
  alarm_description   = "Alarm when RDS database connections exceed 100 for 10 minutes"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
  actions_enabled = true
}

# Create an SNS topic for notifications
resource "aws_sns_topic" "rds_alerts" {
  name = "${var.BASE_NAME}-rds-alerts"
}

# Subscribe an email address to the SNS topic
resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.rds_alerts.arn
  protocol  = "email"
  endpoint  = var.ALERT_EMAIL # Replace with your email address
}

# Link SNS topic to CPU utilization alarm
resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  alarm_name          = "${var.BASE_NAME}-rds-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80 # Alarm when CPU utilization exceeds 80%
  alarm_description   = "Alarm when RDS CPU utilization exceeds 80% for 10 minutes"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
  actions_enabled = true
  alarm_actions   = [aws_sns_topic.rds_alerts.arn]
}
