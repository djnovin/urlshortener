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

variable "DATABASE_URL" {
  description = "The connection string for the database"
  type        = string
  sensitive   = true
}
