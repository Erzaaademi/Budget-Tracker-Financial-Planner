# Budget Tracker & Financial Planner

A comprehensive microservices-based budget tracking and financial planning application built with React, Node.js, Express, and MongoDB.

## 🏗️ Architecture

This application follows a microservices architecture with the following components:

### Services
- **User Service** (Port 3001): Authentication, profile management
- **Transaction Service** (Port 3002): Expense tracking, categorization
- **Budget Service** (Port 3003): Budget setting, reports, forecasting
- **Frontend** (Port 3000): React-based dashboard and user interface

### Database
- **MongoDB**: Single database with collections for users, transactions, and budgets

## 🚀 Features

### Core Features
- ✅ User authentication and authorization
- ✅ Transaction management (income/expense tracking)
- ✅ Budget creation and monitoring
- ✅ Financial dashboard with visualizations
- ✅ Category-based expense tracking
- ✅ Budget progress monitoring with alerts

### Advanced Features
- 📊 Data visualization with charts and graphs
- 🎯 Financial goal tracking
- 📈 Budget forecasting and analytics
- 🔄 Recurring transaction support
- 📱 Responsive design
- 🔒 Secure authentication with JWT

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **React Hook Form**: Form management
- **React Hot Toast**: Notifications
- **Axios**: HTTP client

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **express-validator**: Input validation

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd budget-tracker
   \`\`\`

2. **Start all services**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Access the application**
   - Frontend: http://localhost:3000
   - User Service: http://localhost:3001
   - Transaction Service: http://localhost:3002
   - Budget Service: http://localhost:3003

### Local Development

1. **Start MongoDB**
   \`\`\`bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongo mongo:6.0
   \`\`\`

2. **Install dependencies for each service**
   \`\`\`bash
   # User Service
   cd user-service
   npm install
   npm run dev

   # Transaction Service
   cd transaction-service
   npm install
   npm run dev

   # Budget Service
   cd budget-service
   npm install
   npm run dev

   # Frontend
   cd frontend
   npm install
   npm start
   \`\`\`

## 🔧 Configuration

### Environment Variables

Each service uses environment variables for configuration:

#### User Service (.env)
\`\`\`env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
\`\`\`

#### Transaction Service (.env)
\`\`\`env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
\`\`\`

#### Budget Service (.env)
\`\`\`env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
\`\`\`

#### Frontend (.env)
\`\`\`env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TRANSACTION_API_URL=http://localhost:3002/api
REACT_APP_BUDGET_API_URL=http://localhost:3003/api
\`\`\`

## 📚 API Documentation

### User Service API

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Transaction Service API

#### Transactions
- `POST /api/transactions` - Create transaction (protected)
- `GET /api/transactions` - Get transactions with filtering (protected)
- `GET /api/transactions/:id` - Get transaction by ID (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)
- `GET /api/transactions/stats/summary` - Get transaction statistics (protected)

### Budget Service API

#### Budgets
- `POST /api/budgets` - Create budget (protected)
- `GET /api/budgets` - Get budgets (protected)
- `GET /api/budgets/:id` - Get budget by ID (protected)
- `PUT /api/budgets/:id` - Update budget (protected)
- `DELETE /api/budgets/:id` - Delete budget (protected)
- `GET /api/budgets/analytics/overview` - Get budget analytics (protected)

#### Goals
- `POST /api/budgets/:id/goals` - Add goal to budget (protected)
- `PUT /api/budgets/:id/goals/:goalId` - Update goal (protected)

## 🗄️ Database Schema

### Users Collection
\`\`\`javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: ['user', 'admin']),
  preferences: {
    currency: String,
    theme: String
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Transactions Collection
\`\`\`javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  type: String (enum: ['income', 'expense']),
  category: String,
  description: String,
  date: Date,
  recurring: {
    isRecurring: Boolean,
    frequency: String,
    nextDate: Date
  },
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Budgets Collection
\`\`\`javascript
{
  userId: ObjectId (ref: User),
  name: String,
  category: String,
  limit: Number,
  spent: Number,
  period: String (enum: ['weekly', 'monthly', 'yearly']),
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  alerts: {
    enabled: Boolean,
    threshold: Number
  },
  goals: [{
    description: String,
    targetAmount: Number,
    currentAmount: Number,
    targetDate: Date,
    isCompleted: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: express-validator for request validation
- **CORS Protection**: Cross-origin request handling
- **Environment Variables**: Secure configuration management
- **Role-based Access Control**: User and admin roles

## 🧪 Testing

### Health Checks
Each service provides a health check endpoint:
- User Service: `GET http://localhost:3001/health`
- Transaction Service: `GET http://localhost:3002/health`
- Budget Service: `GET http://localhost:3003/health`

## 📱 Usage Guide

### Getting Started
1. **Register**: Create a new account
2. **Login**: Access your dashboard
3. **Add Transactions**: Record income and expenses
4. **Create Budgets**: Set spending limits for categories
5. **Monitor Progress**: View charts and analytics

### Key Features
- **Dashboard**: Overview of financial status
- **Transactions**: Add, edit, and categorize transactions
- **Budgets**: Create and monitor budget limits
- **Profile**: Manage account settings and preferences

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Use production MongoDB instance
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Use Docker Compose for orchestration

### Docker Production
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0**: Initial release with core features
  - User authentication
  - Transaction management
  - Budget tracking
  - Dashboard analytics
