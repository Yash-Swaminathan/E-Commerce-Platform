# Start port forwarding for all services in background
Write-Host "Setting up port forwarding for all services..."

# Product Catalog service
Start-Process powershell -ArgumentList "-Command kubectl port-forward svc/product-catalog 8080:8080"

# User service
Start-Process powershell -ArgumentList "-Command kubectl port-forward svc/user-service 8081:8081"

# Search service
Start-Process powershell -ArgumentList "-Command kubectl port-forward svc/search-service 8082:8082"

# Order service
Start-Process powershell -ArgumentList "-Command kubectl port-forward svc/order-service 8083:8083"

Write-Host "Port forwarding has been set up for all services:"
Write-Host "Product Catalog: http://localhost:8080"
Write-Host "User Service: http://localhost:8081"
Write-Host "Search Service: http://localhost:8082"
Write-Host "Order Service: http://localhost:8083" 