#!/bin/bash

# Make the script executable
chmod +x setup-github.sh

# Create initial commit with all files
git add .

# Create a commit with all the files
git commit -m "Initial commit: Complete e-commerce platform setup

- Added CI/CD pipeline with GitHub Actions
- Configured AWS S3 integration
- Set up Kubernetes manifests
- Added Terraform infrastructure code
- Created service configurations
- Added documentation and setup scripts"

# Push to GitHub
git push origin main

echo "All files have been committed and pushed to GitHub!"
echo "Please make sure to:"
echo "1. Set up the required secrets in your GitHub repository"
echo "2. Enable GitHub Actions"
echo "3. Configure your AWS credentials" 