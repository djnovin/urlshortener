output "ecr_repository_arn" {
  description = "The ARN of the ECR repository"
  value       = aws_ecr_repository.main.repository_arn
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.main.repository_url
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.main.arn
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.main.bucket
}

# Output the S3 Bucket URL and CloudFront Distribution Domain Name
output "astro_site_s3_bucket_url" {
  description = "The URL of the S3 bucket hosting the Astro site"
  value       = aws_s3_bucket.astro_site.website_endpoint
}

output "astro_site_cloudfront_url" {
  description = "The CloudFront distribution domain name for the Astro site"
  value       = aws_cloudfront_distribution.astro_site.domain_name
}
