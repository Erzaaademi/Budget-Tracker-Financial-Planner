# API Documentation

## Base URLs
- User Service: `http://localhost:3001/api`
- Transaction Service: `http://localhost:3002/api`
- Budget Service: `http://localhost:3003/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## User Service API

### Register User
**POST** `/users/register`

**Request Body:**
\`\`\`json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
\`\`\`

### Login User
**POST** `/users/login`

**Request Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
\`\`\`

### Get User Profile
**GET** `/users/profile` (Protected)

**Response:**
\`\`\`json
{
  "id": "user-id",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "preferences": {
    "currency": "USD",
    "theme": "light"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
\`\`\`

### Update User Profile
**PUT** `/users/profile` (Protected)

**Request Body:**
\`\`\`json
{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "currency": "EUR",
    "theme": "dark"
  }
}
\`\`\`

## Transaction Service API

### Create Transaction
**POST** `/transactions` (Protected)

**Request Body:**
\`\`\`json
{
  "amount": 50.00,
  "type": "expense",
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2023-12-01",
  "tags": ["groceries", "weekly"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "transaction-id",
    "userId": "user-id",
    "amount": 50.00,
    "type": "expense",
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2023-12-01T00:00:00.000Z",
    "tags": ["groceries", "weekly"],
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
\`\`\`

### Get Transactions
**GET** `/transactions` (Protected)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `type` (optional): 'income' or 'expense'
- `category` (optional): Filter by category
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Example:** `/transactions?type=expense&category=Food&page=1&limit=10`

**Response:**
\`\`\`json
{
  "transactions": [
    {
      "_id": "transaction-id",
      "userId": "user-id",
      "amount": 50.00,
      "type": "expense",
      "category": "Food",
      "description": "Grocery shopping",
      "date": "2023-12-01T00:00:00.000Z",
      "tags": ["groceries", "weekly"],
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
\`\`\`

### Get Transaction by ID
**GET** `/transactions/:id` (Protected)

**Response:**
\`\`\`json
{
  "_id": "transaction-id",
  "userId": "user-id",
  "amount": 50.00,
  "type": "expense",
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2023-12-01T00:00:00.000Z",
  "tags": ["groceries", "weekly"],
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
\`\`\`

### Update Transaction
**PUT** `/transactions/:id` (Protected)

**Request Body:**
\`\`\`json
{
  "amount": 55.00,
  "description": "Updated grocery shopping",
  "tags": ["groceries", "weekly", "organic"]
}
\`\`\`

### Delete Transaction
**DELETE** `/transactions/:id` (Protected)

**Response:**
\`\`\`json
{
  "message": "Transaction deleted successfully"
}
\`\`\`

### Get Transaction Statistics
**GET** `/transactions/stats/summary` (Protected)

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:**
\`\`\`json
{
  "summary": [
    {
      "_id": "income",
      "total": 3000.00,
      "count": 5
    },
    {
      "_id": "expense",
      "total": 1500.00,
      "count": 25
    }
  ],
  "categoryBreakdown": [
    {
      "_id": "Food",
      "total": 500.00,
      "count": 10
    },
    {
      "_id": "Transportation",
      "total": 300.00,
      "count": 8
    }
  ]
}
\`\`\`

## Budget Service API

### Create Budget
**POST** `/budgets` (Protected)

**Request Body:**
\`\`\`json
{
  "name": "Monthly Food Budget",
  "category": "Food",
  "limit": 500.00,
  "period": "monthly",
  "startDate": "2023-12-01",
  "endDate": "2023-12-31"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Budget created successfully",
  "budget": {
    "_id": "budget-id",
    "userId": "user-id",
    "name": "Monthly Food Budget",
    "category": "Food",
    "limit": 500.00,
    "spent": 0,
    "period": "monthly",
    "startDate": "2023-12-01T00:00:00.000Z",
    "endDate": "2023-12-31T00:00:00.000Z",
    "isActive": true,
    "alerts": {
      "enabled": true,
      "threshold": 80
    },
    "goals": [],
    "percentageSpent": 0,
    "remaining": 500.00,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
\`\`\`

### Get Budgets
**GET** `/budgets` (Protected)

**Query Parameters:**
- `isActive` (optional): true/false
- `category` (optional): Filter by category
- `period` (optional): 'weekly', 'monthly', 'yearly'

**Response:**
\`\`\`json
{
  "budgets": [
    {
      "_id": "budget-id",
      "userId": "user-id",
      "name": "Monthly Food Budget",
      "category": "Food",
      "limit": 500.00,
      "spent": 150.00,
      "period": "monthly",
      "startDate": "2023-12-01T00:00:00.000Z",
      "endDate": "2023-12-31T00:00:00.000Z",
      "isActive": true,
      "alerts": {
        "enabled": true,
        "threshold": 80
      },
      "goals": [],
      "percentageSpent": 30,
      "remaining": 350.00,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ]
}
\`\`\`

### Get Budget Analytics
**GET** `/budgets/analytics/overview` (Protected)

**Response:**
\`\`\`json
{
  "totalBudgets": 5,
  "totalLimit": 2500.00,
  "totalSpent": 1200.00,
  "budgetsOverLimit": 1,
  "budgetsNearLimit": 2,
  "categoryBreakdown": [
    {
      "category": "Food",
      "limit": 500.00,
      "spent": 450.00,
      "percentage": 90,
      "remaining": 50.00
    }
  ]
}
\`\`\`

### Add Goal to Budget
**POST** `/budgets/:id/goals` (Protected)

**Request Body:**
\`\`\`json
{
  "description": "Save for vacation",
  "targetAmount": 1000.00,
  "targetDate": "2024-06-01"
}
\`\`\`

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
\`\`\`json
{
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "message": "No token, authorization denied"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "message": "Resource not found"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "message": "Server error"
}
\`\`\`

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production use.

## Data Validation

All endpoints include comprehensive input validation:
- Required fields validation
- Data type validation
- Range validation for numeric fields
- Email format validation
- Date format validation (ISO 8601)

## Security Headers

The API includes security best practices:
- CORS configuration
- Input sanitization
- Password hashing with bcrypt
- JWT token expiration
- Environment variable configuration
