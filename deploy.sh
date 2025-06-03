#!/bin/bash

echo "🚀 Budget Tracker Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if MongoDB is running locally
echo "🔍 Checking MongoDB connection..."
if mongosh --eval "db.adminCommand('ismaster')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB is running on localhost:27017"
else
    echo "❌ MongoDB is not running on localhost:27017"
    echo "Please start MongoDB first:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    echo "  Windows: net start MongoDB"
    exit 1
fi

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p user-service/{models,routes,middleware}
mkdir -p transaction-service/{models,routes,middleware}
mkdir -p budget-service/{models,routes,middleware}
mkdir -p frontend/{src/{components,contexts,pages,services},public}

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down 2>/dev/null
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
services=("user-service:3001" "transaction-service:3002" "budget-service:3003")
all_healthy=true

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$port/health > /dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo "🎉 All services are running successfully!"
    echo ""
    echo "📱 Access your application:"
    echo "  Frontend:           http://localhost:3000"
    echo "  User Service API:   http://localhost:3001/api"
    echo "  Transaction API:    http://localhost:3002/api"
    echo "  Budget API:         http://localhost:3003/api"
    echo ""
    echo "📚 API Documentation: See API_DOCUMENTATION.md"
    echo "🔧 Setup Guide:       See SETUP_GUIDE.md"
    echo ""
    echo "🛑 To stop all services: docker-compose down"
else
    echo ""
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
fi
