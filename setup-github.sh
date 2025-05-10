#!/bin/bash

# Create .gitignore file
cat > .gitignore << EOL
# IDE files
.idea/
.vscode/
*.iml

# Build files
target/
build/
*.class
*.jar
*.war

# Node modules
node_modules/

# Environment files
.env
*.env

# Logs
*.log
logs/

# AWS credentials
.aws/
aws-credentials.json

# Kubernetes
kubeconfig
.kube/

# Terraform
.terraform/
*.tfstate
*.tfstate.*
*.tfvars
.terraform.lock.hcl

# Docker
.docker/
docker-compose.override.yml

# Temporary files
*.tmp
*.temp
.DS_Store
EOL

# Initialize git if not already initialized
if [ ! -d .git ]; then
    git init
fi

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: E-commerce platform with AWS integration and CI/CD"

# Add GitHub remote (replace with your repository URL)
echo "Please enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
read repo_url

git remote add origin $repo_url

# Push to GitHub
git push -u origin main

echo "Setup complete! Your code has been pushed to GitHub."
echo "Please make sure to:"
echo "1. Set up the following secrets in your GitHub repository:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - KUBE_CONFIG"
echo "2. Enable GitHub Actions in your repository settings" 