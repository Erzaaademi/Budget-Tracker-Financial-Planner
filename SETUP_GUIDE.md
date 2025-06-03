# Setup Guide - Connecting to Your Existing MongoDB Database

## Prerequisites

You mentioned you already have:
- MongoDB running on `localhost:27017`
- Database named: `Budget-Tracker-&-Financial-Planner`
- Collections: `users`, `transactions`, `budgets`

## Step 1: Update MongoDB Connection

Since you're using your existing MongoDB database, you'll need to update the connection strings in the Docker Compose file and environment files.

### Option A: Using Your Local MongoDB (Recommended)

1. **Update docker-compose.yml** - Remove the MongoDB service and update connection strings:

\`\`\`yaml
version: '3.8'

services:
  # User Service
  user-service:
    build: ./user-service
    container_name: budget-tracker-user-service
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - MONGODB_URI=mongodb://host.docker.internal:27017/Budget-Tracker-&-Financial-Planner
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - NODE_ENV=development
    networks:
      - budget-tracker-network

  # Transaction Service
  transaction-service:
    build: ./transaction-service
    container_name: budget-tracker-transaction-service
    restart: unless-stopped
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - MONGODB_URI=mongodb://host.docker.internal:27017/Budget-Tracker-&-Financial-Planner
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - NODE_ENV=development
    networks:
      - budget-tracker-network

  # Budget Service
  budget-service:
    build: ./budget-service
    container_name: budget-tracker-budget-service
    restart: unless-stopped
    ports:
      - "3003:3003"
    environment:
      - PORT=3003
      - MONGODB_URI=mongodb://host.docker.internal:27017/Budget-Tracker-&-Financial-Planner
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - NODE_ENV=development
    networks:
      - budget-tracker-network

  # Frontend
  frontend:
    build: ./frontend
    container_name: budget-tracker-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001/api
      - REACT_APP_TRANSACTION_API_URL=http://localhost:3002/api
      - REACT_APP_BUDGET_API_URL=http://localhost:3003/api
    depends_on:
      - user-service
      - transaction-service
      - budget-service
    networks:
      - budget-tracker-network

networks:
  budget-tracker-network:
    driver: bridge
\`\`\`

### Option B: Using Docker MongoDB with Your Data

If you want to use Docker but preserve your existing data:

1. **Export your existing data:**
\`\`\`bash
# Export users collection
mongodump --host localhost:27017 --db "Budget-Tracker-&-Financial-Planner" --collection users --out ./backup

# Export transactions collection
mongodump --host localhost:27017 --db "Budget-Tracker-&-Financial-Planner" --collection transactions --out ./backup

# Export budgets collection
mongodump --host localhost:27017 --db "Budget-Tracker-&-Financial-Planner" --collection budgets --out ./backup
\`\`\`

2. **Use the original docker-compose.yml** and then import your data:
\`\`\`bash
# Start the services
docker-compose up -d

# Wait for MongoDB to be ready, then import data
mongorestore --host localhost:27017 --db "Budget-Tracker-&-Financial-Planner" ./backup/Budget-Tracker-&-Financial-Planner/
\`\`\`

## Step 2: Update Environment Files

Update all `.env` files to use your database:

### user-service/.env
\`\`\`env
PORT=3001
MONGODB_URI=mongodb://host.docker.internal:27017/Budget-Tracker-&-Financial-Planner
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
\`\`\`

### transaction-service/.env
\`\`\`env
PORT=3002
MONGODB_URI=mongodb://host.docker.internal:27017/Budget-Tracker-&-Financial-Planner
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
\`\`\`

### budget-service/.env
\`\`\`env
PORT=3003
MONGODB_URI=mongodb://host.docker.internal:27017/Budget-Tracker-&-Financial-Planner
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
\`\`\`

### frontend/.env
\`\`\`env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TRANSACTION_API_URL=http://localhost:3002/api
REACT_APP_BUDGET_API_URL=http://localhost:3003/api
\`\`\`

## Step 3: Project Structure

Create the following directory structure:

\`\`\`
budget-tracker/
├── user-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── userRoutes.js
│   └── middleware/
│       └── auth.js
├── transaction-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── models/
│   │   └── Transaction.js
│   ├── routes/
│   │   └── transactionRoutes.js
│   └── middleware/
│       └── auth.js
├── budget-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── models/
│   │   └── Budget.js
│   ├── routes/
│   │   └── budgetRoutes.js
│   └── middleware/
│       └── auth.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── services/
├── docker-compose.yml
├── README.md
├── API_DOCUMENTATION.md
└── SETUP_GUIDE.md
\`\`\`

## Step 4: Installation and Startup

1. **Clone/Create the project structure** with all the files provided

2. **Make sure MongoDB is running** on your local machine:
\`\`\`bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
\`\`\`

3. **Start the application:**
\`\`\`bash
# Using Docker (recommended)
docker-compose up -d

# Or for development with logs
docker-compose up
\`\`\`

4. **Verify services are running:**
\`\`\`bash
# Check service health
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Transaction Service
curl http://localhost:3003/health  # Budget Service
\`\`\`

5. **Access the application:**
- Frontend: http://localhost:3000
- User Service API: http://localhost:3001/api
- Transaction Service API: http://localhost:3002/api
- Budget Service API: http://localhost:3003/api

## Step 5: Testing the Connection

1. **Register a new user** via the frontend or API:
\`\`\`bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
\`\`\`

2. **Check your MongoDB** to see if the user was created:
\`\`\`bash
mongosh "Budget-Tracker-&-Financial-Planner"
db.users.find()
\`\`\`

## Troubleshooting

### Common Issues:

1. **Connection refused to MongoDB:**
   - Make sure MongoDB is running: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)
   - Check if port 27017 is available: `netstat -an | grep 27017`

2. **Docker can't connect to host MongoDB:**
   - Use `host.docker.internal:27017` instead of `localhost:27017` in Docker environment
   - On Linux, you might need to use `172.17.0.1:27017`

3. **Services not starting:**
   - Check Docker logs: `docker-compose logs [service-name]`
   - Verify environment variables are set correctly

4. **Frontend can't connect to backend:**
   - Make sure all services are running on correct ports
   - Check CORS configuration in backend services

### Database Schema Validation

The application will automatically create the proper schema when you start using it. Your existing collections will be used, and new documents will follow the defined schemas.

## Security Notes

1. **Change the JWT secret** in production
2. **Use environment variables** for sensitive data
3. **Enable MongoDB authentication** in production
4. **Use HTTPS** in production
5. **Implement rate limiting** for production APIs

## Next Steps

1. Start the application using the steps above
2. Register a new user account
3. Begin adding transactions and creating budgets
4. Explore the dashboard and analytics features
5. Customize the application as needed for your requirements
\`\`\`

Now let me create a quick deployment script to help you get started:
