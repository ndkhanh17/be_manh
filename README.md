# AyaBook Backend

Backend API for AyaBook online bookstore built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Book management
- Order processing
- Category management
- Admin dashboard statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/category/:category` - Get books by category
- `GET /api/books/bestsellers/list` - Get best selling books
- `GET /api/books/new/arrivals` - Get new arrivals
- `POST /api/books` - Create a new book (Admin only)
- `PUT /api/books/:id` - Update a book (Admin only)
- `DELETE /api/books/:id` - Delete a book (Admin only)

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order by ID (Authenticated)
- `GET /api/orders/user/me` - Get current user's orders (Authenticated)
- `GET /api/orders` - Get all orders (Admin only)
- `PATCH /api/orders/:id/status` - Update order status (Admin only)
- `GET /api/orders/stats/overview` - Get order statistics (Admin only)
- `GET /api/orders/recent/list` - Get recent orders (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category (Admin only)
- `PUT /api/categories/:id` - Update a category (Admin only)
- `DELETE /api/categories/:id` - Delete a category (Admin only)

### Users
- `GET /api/users/me` - Get current user (Authenticated)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin or self)
- `PUT /api/users/:id` - Update user (Admin or self)
- `PATCH /api/users/:id/role` - Update user role (Admin only)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   \`\`\`
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ayabook
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   \`\`\`
4. Start the server: `npm run dev`

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Token (JWT)
- bcryptjs
