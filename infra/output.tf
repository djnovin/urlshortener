# Output: S3 Bucket Name
output "s3_bucket_name" {
  description = "The name of the S3 bucket hosting the static site"
  value       = aws_s3_bucket.site.bucket
}

# Output: S3 Bucket ARN
output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.site.arn
}

# Output: CloudFront Distribution Domain Name (Public URL)
output "cloudfront_distribution_url" {
  description = "The CloudFront domain name for accessing the static site"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

# Output: CloudFront Distribution ID
output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.cdn.id
}

# Output: Full URL for public access (using CloudFront)
output "static_site_url" {
  description = "The full URL for accessing the static site"
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
}
