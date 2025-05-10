# E-Commerce Platform

A microservice-based e-commerce platform built with Go and Spring Boot services, containerized with Docker and orchestrated by Kubernetes on AWS.

## Architecture

- **Go Services**
  - Product Catalog Service
  - Search Service
- **Spring Boot Services**
  - User Service
  - Order Service
- **Infrastructure**
  - PostgreSQL Database
  - AWS S3 for file storage
  - Kubernetes (EKS) for orchestration
  - Stripe for payment processing

## Prerequisites

- Docker & Docker Compose
- Node.js (for frontend local dev)
- Java 17 (for Spring services local dev)
- Go 1.21+ (for Go services local dev)
- PostgreSQL (if not using Docker)
- kubectl
- AWS CLI
- Stripe CLI (optional)

## Quick Start (with Docker Compose)

```sh
docker-compose up --build
```

- Product Catalog: [http://localhost:8080](http://localhost:8080)
- User Service: [http://localhost:8081](http://localhost:8081)
- Search Service: [http://localhost:8082](http://localhost:8082)
- Order Service: [http://localhost:8083](http://localhost:8083)
- PostgreSQL: `localhost:5432` (user: postgres, password: postgres, db: ecommerce)

## Frontend

1. `cd frontend`
2. Create `.env.local`:
    ```env
    NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:8080
    NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8081
    NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8083
    ```
3. Install dependencies: `npm install`
4. Run: `npm run dev`

## Local Development (without Docker)

- Start PostgreSQL and create the `ecommerce` database (see `infra/docker/init-db.sql`).
- Set environment variables as above for each service.
- Start each backend service in its directory.

## Troubleshooting

- **401/404 errors:** Check if the backend services are running and accessible on the correct ports.
- **Database errors:** Ensure PostgreSQL is running and the `ecommerce` database exists.
- **Port conflicts:** Make sure nothing else is using ports 8080-8083 or 5432.

## Development

### Go Services
```bash
cd go-services/product-catalog
go mod tidy
go run main.go
```

### Spring Boot Services
```bash
cd spring-services/user-service
./mvnw spring-boot:run
```

## Testing

Run the test suite:
```bash
# Go services
cd go-services/product-catalog
go test ./...

# Spring Boot services
cd spring-services/user-service
./mvnw test
```

## Deployment

1. Build Docker images:
```bash
docker-compose build
```

2. Push to ECR:
```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker-compose push
```

3. Deploy to Kubernetes:
```bash
kubectl apply -f infra/k8s/
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

