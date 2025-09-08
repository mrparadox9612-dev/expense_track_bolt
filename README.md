# Expense Tracker Mobile Application

A comprehensive expense tracking mobile application built with React Native (Expo), Node.js/Express backend, and MongoDB database.

## Project Structure

```
expense-tracker/
├── frontend/                 # React Native (Expo) application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── screens/         # Application screens
│   │   ├── navigation/      # Navigation configuration
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── constants/       # App constants
│   │   └── types/           # TypeScript types
│   ├── assets/              # Images, fonts, etc.
│   ├── app.json
│   ├── package.json
│   └── App.tsx
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── package.json
│   └── server.js
└── README.md
```

## Features

- User authentication (register, login, forgot password)
- Expense tracking with categories
- Income management
- Budget planning and monitoring
- Expense analytics and reports
- Receipt photo upload
- Multi-currency support
- Data export functionality

## Technology Stack

### Frontend
- React Native with Expo
- TypeScript
- React Navigation 6
- React Hook Form
- Async Storage
- Expo Camera & Image Picker

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Bcrypt for password hashing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Expo CLI
- iOS Simulator or Android Emulator

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
expo start
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Frontend
Configure API base URL in `src/constants/config.ts`

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/forgot-password` - Forgot password
- POST `/api/auth/reset-password` - Reset password
- GET `/api/auth/profile` - Get user profile

### Expense Endpoints
- GET `/api/expenses` - Get user expenses
- POST `/api/expenses` - Create new expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

### Category Endpoints
- GET `/api/categories` - Get expense categories
- POST `/api/categories` - Create new category

### Budget Endpoints
- GET `/api/budgets` - Get user budgets
- POST `/api/budgets` - Create new budget
- PUT `/api/budgets/:id` - Update budget

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  avatar: String,
  currency: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  description: String,
  category: ObjectId,
  date: Date,
  receipt: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  color: String,
  userId: ObjectId (optional - for custom categories),
  isDefault: Boolean,
  createdAt: Date
}
```

### Budgets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  category: ObjectId,
  amount: Number,
  period: String, // monthly, weekly, yearly
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.