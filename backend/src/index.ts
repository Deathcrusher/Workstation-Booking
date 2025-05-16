import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.routes';
import bandRoutes from './routes/band.routes';
import roomRoutes from './routes/room.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';

// Import middleware
import { authenticate, requireAdmin } from './middleware/authMiddleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/bands', authenticate, bandRoutes);
app.use('/api/rooms', authenticate, roomRoutes);
app.use('/api/bookings', authenticate, bookingRoutes);
app.use('/api/admin', authenticate, requireAdmin, adminRoutes);

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Additional health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 