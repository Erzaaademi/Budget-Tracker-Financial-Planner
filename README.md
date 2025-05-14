# Budget Tracker & Financial Planner

A microservices-based application for tracking expenses, managing budgets, and setting financial goals.

## Current Implementation Status

- ✅ User Service (Authentication & Profile Management)
- 🔄 Transaction Service (Coming Soon)
- 🔄 Budget Service (Coming Soon)

## Technology Stack

- Frontend: React (Coming Soon)
- Backend: Node.js with Express
- Database: MongoDB
- Containerization: Docker & Docker Compose

## User Service API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (Protected)

## Setup Instructions

1. Prerequisites:
   - Docker and Docker Compose installed
   - Node.js (for local development)

2. Environment Setup:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd Budget-Tracker-Financial-Planner
   ```

3. Start the Services:
   ```bash
   docker-compose up --build
   ```

4. Access the Services:
   - User Service: http://localhost:3001
   - MongoDB: mongodb://localhost:27017

## Development

1. Install dependencies:
   ```bash
   cd user-service
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

## Future Services

### Transaction Service
- POST /api/transactions
- GET /api/transactions
- GET /api/transactions/:id
- DELETE /api/transactions/:id

### Budget Service
- POST /api/budgets
- GET /api/budgets
- GET /api/budgets/report
