provider "aws" {
  region = var.aws_region
}

# S3 bucket for product images
resource "aws_s3_bucket" "product_images" {
  bucket = "ecommerce-product-images-${var.environment}"

  tags = {
    Name        = "Product Images Bucket"
    Environment = var.environment
  }
}

# Bucket policy
resource "aws_s3_bucket_policy" "product_images_policy" {
  bucket = aws_s3_bucket.product_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowProductServiceAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_iam_role.product_service_role.arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.product_images.arn,
          "${aws_s3_bucket.product_images.arn}/*"
        ]
      }
    ]
  })
}

# IAM role for product service
resource "aws_iam_role" "product_service_role" {
  name = "product-service-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for S3 access
resource "aws_iam_policy" "s3_access_policy" {
  name        = "product-service-s3-access-${var.environment}"
  description = "Policy for product service to access S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.product_images.arn,
          "${aws_s3_bucket.product_images.arn}/*"
        ]
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "s3_access" {
  role       = aws_iam_role.product_service_role.name
  policy_arn = aws_iam_policy.s3_access_policy.arn
} 