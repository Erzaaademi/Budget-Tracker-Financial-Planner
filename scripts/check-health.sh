#!/bin/bash

echo "🔍 Budget Tracker Health Check"
echo "=============================="

# Check MongoDB
echo "Checking MongoDB..."
if mongosh --eval "db.adminCommand('ismaster')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB: Running"
else
    echo "❌ MongoDB: Not running"
fi

# Check services
services=("user-service:3001" "transaction-service:3002" "budget-service:3003" "frontend:3000")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if [ "$name" = "frontend" ]; then
        # For frontend, just check if port is open
        if nc -z localhost $port 2>/dev/null; then
            echo "✅ $name: Running on port $port"
        else
            echo "❌ $name: Not running on port $port"
        fi
    else
        # For backend services, check health endpoint
        if curl -s http://localhost:$port/health > /dev/null; then
            echo "✅ $name: Healthy on port $port"
        else
            echo "❌ $name: Not healthy on port $port"
        fi
    fi
done

echo ""
echo "🐳 Docker containers:"
docker-compose ps
