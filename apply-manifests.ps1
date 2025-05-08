# Apply PostgreSQL ConfigMap
Write-Host "Applying PostgreSQL ConfigMap..."
kubectl apply -f k8s/postgres-configmap.yaml

# Apply PostgreSQL StatefulSet
Write-Host "Applying PostgreSQL StatefulSet..."
kubectl apply -f k8s/postgres-statefulset.yaml

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod/postgres-0 --timeout=300s

# Apply Product Catalog service
Write-Host "Applying Product Catalog service..."
kubectl apply -f k8s/product-catalog.yaml

# Apply User service
Write-Host "Applying User service..."
kubectl apply -f k8s/user-service.yaml

# Apply Search service
Write-Host "Applying Search service..."
kubectl apply -f k8s/search-service.yaml

# Apply Order service
Write-Host "Applying Order service..."
kubectl apply -f k8s/order-service.yaml

# Wait for all deployments to be ready
Write-Host "Waiting for all deployments to be ready..."
kubectl wait --for=condition=available deployment/product-catalog --timeout=300s
kubectl wait --for=condition=available deployment/user-service --timeout=300s
kubectl wait --for=condition=available deployment/search-service --timeout=300s
kubectl wait --for=condition=available deployment/order-service --timeout=300s 