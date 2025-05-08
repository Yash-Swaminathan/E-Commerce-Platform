# Build and load Product Catalog service
Write-Host "Building Product Catalog service..."
docker build -t product-catalog:latest ./go-services/product-catalog
Write-Host "Loading Product Catalog image into minikube..."
minikube image load product-catalog:latest

# Build and load User service
Write-Host "Building User service..."
docker build -t user-service:latest ./spring-services/user-service
Write-Host "Loading User service image into minikube..."
minikube image load user-service:latest

# Build and load Search service
Write-Host "Building Search service..."
docker build -t search-service:latest ./go-services/search
Write-Host "Loading Search service image into minikube..."
minikube image load search-service:latest

# Build and load Order service
Write-Host "Building Order service..."
docker build -t order-service:latest ./spring-services/order-service
Write-Host "Loading Order service image into minikube..."
minikube image load order-service:latest 