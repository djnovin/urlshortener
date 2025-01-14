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

variable "S3_BUCKET_NAME" {
  description = "Name of the S3 bucket for storing Terraform state"
  type        = string
}

variable "DYNAMODB_TABLE_NAME" {
  description = "Name of the DynamoDB table for state locking"
  type        = string
}

variable "DB_USERNAME" {
  description = "Username for the database"
  type        = string
  sensitive   = true
}

variable "DB_PASSWORD" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "DATABASE_URL" {
  description = "The connection string for the database"
  type        = string
  sensitive   = true
}

variable "IMAGE_TAG" {
  description = "The Docker image tag for the Lambda function"
  type        = string
}

variable "SUBNET_IDS" {
  description = "List of subnet IDs for the Lambda function"
  type        = list(string)
}

variable "ALERT_EMAIL" {
  description = "Email address to receive CloudWatch alarms"
  type        = string
}
