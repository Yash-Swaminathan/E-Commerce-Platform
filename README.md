# E-Commerce Platform

A modern e-commerce platform built with microservices architecture, AWS integration, and automated CI/CD pipeline.

## Prerequisites

- Java 17 or later
- Go 1.19 or later
- Docker
- Kubernetes cluster
- AWS account with appropriate permissions
- GitHub account

## Project Structure

```
.
├── .github/workflows/     # CI/CD pipeline configurations
├── infra/                 # Infrastructure as Code (Terraform)
├── k8s/                   # Kubernetes manifests
├── spring-services/       # Spring Boot microservices
├── go-services/          # Go microservices
├── frontend/             # Frontend application
└── payments/             # Payment service
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd ecommerce-platform
   ```

2. Set up AWS credentials:
   - Create an AWS account if you don't have one
   - Create an IAM user with appropriate permissions
   - Configure AWS CLI with your credentials

3. Set up GitHub repository:
   - Create a new repository on GitHub
   - Run the setup script:
     ```bash
     chmod +x setup-github.sh
     ./setup-github.sh
     ```

4. Configure GitHub Secrets:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `KUBE_CONFIG`

5. Enable GitHub Actions:
   - Go to your GitHub repository
   - Navigate to Actions
   - Enable GitHub Actions

## Development

1. Start local development environment:
   ```bash
   docker-compose up -d
   ```

2. Build and test services:
   ```bash
   # Spring services
   cd spring-services
   ./mvnw clean verify

   # Go services
   cd go-services
   go test ./...
   ```

## Deployment

The platform is automatically deployed through GitHub Actions when changes are pushed to the main branch. The deployment process includes:

1. Building and testing services
2. Creating Docker images
3. Pushing images to Amazon ECR
4. Deploying to Kubernetes
5. Applying infrastructure changes

## Infrastructure

The infrastructure is managed using Terraform and includes:

- AWS S3 bucket for product images
- IAM roles and policies
- Kubernetes cluster configuration

## Monitoring and Logging

- Application metrics are exposed through Spring Boot Actuator
- Logs are collected and can be viewed in your preferred logging solution
- AWS CloudWatch integration for infrastructure monitoring

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Create a pull request
4. Wait for CI/CD pipeline to validate changes
5. Get code review approval
6. Merge to main branch

## License

This project is licensed under the MIT License - see the LICENSE file for details.

