# Band Rehearsal Room Booking System

A web application for managing band rehearsal room bookings, built with React, Node.js, and PostgreSQL.

## Features

- User authentication and authorization
- Admin dashboard for managing bands and rooms
- Band portal for viewing and managing bookings
- Calendar view for room availability
- Color-coded room management
- Responsive design with Tailwind CSS

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
- PostgreSQL database
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
   cd band-booking-system
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

3. Set up environment variables:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. Start the development environment:
   ```bash
   # Start all services
   docker-compose up -d

   # Or start services individually
   docker-compose up -d postgres
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

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

3. Run tests:
   ```bash
   npm test
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

## Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build and start Docker containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 