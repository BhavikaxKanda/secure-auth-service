# Secure User Authentication & Authorization Service

A backend microservice for handling user identity, authentication, and authorization — built as part of my Web Developer Internship at Ultimez Technology.

This is Month 1 of a 3-month project. This phase covers the authentication foundation: user registration, login, JWT-based authentication, password security, and API documentation. Role-based access control, session management, and security hardening will be added in later phases.

## Tech Stack

- **Runtime:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken), bcrypt
- **Validation:** Joi
- **API Security:** Helmet, CORS
- **Documentation:** Swagger (OpenAPI 3.0)
- **Testing:** Postman

## Features Implemented (Month 1)

- User registration with email + username uniqueness checks
- Password hashing using bcrypt (12 salt rounds)
- Login with either email or username
- JWT access token + refresh token generation
- Session tracking on login
- Protected route middleware (JWT verification)
- Request validation using Joi
- Swagger API documentation
- Postman collection for manual testing

## Project Structure

\`\`\`
secure-auth-service/
├── prisma/
│   ├── schema.prisma       # Database models (User, Role, Permission, Session)
│   └── migrations/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── utils/
│   │   ├── hash.js
│   │   └── jwt.js
│   ├── validators/
│   │   └── auth.validator.js
│   └── app.js
├── postman/
│   └── Secure Auth Service.postman_collection.json
├── swagger.yaml
├── server.js
└── README.md
\`\`\`

## Setup Instructions

### 1. Clone the repo
\`\`\`bash
git clone https://github.com/BhavikaxKanda/secure-auth-service.git
cd secure-auth-service
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables
Create a \`.env\` file in the root with:
\`\`\`
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/auth_service_db?schema=public"
PORT=5000
JWT_ACCESS_SECRET=your_own_random_secret
JWT_REFRESH_SECRET=your_own_different_random_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
\`\`\`

### 4. Run database migrations
\`\`\`bash
npx prisma migrate dev
\`\`\`

### 5. Start the server
\`\`\`bash
npm run dev
\`\`\`

Server runs at \`http://localhost:5000\`

## API Documentation

Once the server is running, visit:
\`\`\`
http://localhost:5000/api-docs
\`\`\`

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|--------------|----------------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Log in and receive tokens | No |
| GET | /api/auth/me | Get current authenticated user | Yes (Bearer token) |

## Testing

A Postman collection is included in \`/postman\`. Import it into Postman to test all endpoints directly.

## Author

Bhavika Kanda — Web Developer Intern, Ultimez Technology Pvt Ltd.