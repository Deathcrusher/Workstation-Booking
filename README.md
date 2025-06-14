# Band Rehearsal Room Booking System

A web application for managing band rehearsal room bookings, built with React, Node.js, and PostgreSQL.

**Author: René Gattermair**

## Features

- User authentication and authorization (Admin, Band)
- Admin dashboard for managing bands, rooms, and bookings
- Band portal for viewing and managing their bookings
- Calendar view with room availability visualization
- Color-coded room management
- Responsive design with Tailwind CSS
- Booking creation and management system

## Tech Stack

### Frontend
- React 18
- TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- Database: 
  - SQLite (current development database)
  - Support for PostgreSQL, MySQL or other SQL databases via Prisma
- JWT authentication
- Docker for containerization

## Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Workstation-Booking
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Generate Prisma client and create the default admin user:
   ```bash
   cd backend
   npx prisma generate
   npx ts-node prisma/fix-admin.ts
   cd ..
   ```
4. Set up environment variables:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

   After copying the example file, update `VITE_API_URL` in `frontend/.env` if your backend runs on a different host or port.

4. Start the development environment:
   ```bash
   # Using SQLite (default configuration)
   cd backend && npm run dev
   cd frontend && npm run dev

   # Or using PostgreSQL with Docker
   docker-compose up -d postgres
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173 (or another port if 5173 is in use)
   - Backend API: http://localhost:3000

## Backend Environment Variables

The backend relies on several environment variables for authentication,
database access and email notifications. The most common ones are:

- `JWT_SECRET` – secret used to sign JWT tokens
- `JWT_EXPIRES_IN` – token expiry time
- `DATABASE_URL` – connection URL for your database
- `SMTP_HOST` – address of your SMTP server
- `SMTP_PORT` – port for the SMTP server
- `SMTP_USER` – SMTP username
- `SMTP_PASS` – SMTP password
- `PORT` – port where the backend listens

Create a `.env` file in `backend/` (see `backend/.env.example`) and define
these variables there. When running the Docker setup, the same variables are
referenced in `docker-compose.yml` and can also be configured through your
environment.

## Development

### Backend Development

1. Database migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run tests (located in `backend/tests`):
   ```bash
   ./scripts/test-backend.sh
   ```

4. Lint the code:
   ```bash
   cd backend
   npm run lint
   ```
  
### Frontend Development

1. Start development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Lint the code:
   ```bash
   npm run lint
   ```

### Database Development

1. Database setup for SQLite (default):
   ```bash
   cd backend
   # The SQLite database will be created automatically when you run the application
   # To apply migrations:
   npx prisma migrate dev
   ```

2. For PostgreSQL setup:
   ```bash
   # Edit the DATABASE_URL in .env to point to your PostgreSQL instance
   # Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/band_booking"
   
   # Then run migrations
   npx prisma migrate dev
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. View your database with Prisma Studio:
   ```bash
   npx prisma studio
   ```

## Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build and start Docker containers:
   ```bash
   docker-compose up -d
   ```

## Project Structure

```
band-booking-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
└── docker-compose.yml
```

## Recent Fixes

- Fixed calendar booking form rendering issues
- Resolved modal display problems when clicking on time slots
- Implemented optimized state management to prevent infinite rendering loops
- Enhanced event propagation handling in modal system
- Improved form field validation and error reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

© 2024 René Gattermair 