import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ensureDefaultAdmin } from './utils/ensureAdmin';

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

/*
 * Always ensure a default administrator account exists.  The helper
 * `ensureDefaultAdmin` will create the admin user if one with the
 * hard‑coded credentials (`admin@admin.com` / `admin`) is missing.  By
 * invoking this outside of the conditional `require.main` check, the
 * admin is seeded on module import as well as when the server is
 * started via `node dist/index.js` or `ts-node src/index.ts`.  Any
 * errors will be logged but will not prevent the application from
 * continuing to start.
 */
ensureDefaultAdmin(prisma).catch((err) => {
  console.error('Failed to ensure default admin', err);
});

// Middleware
app.use(cors());
// Use Helmet to help secure Express apps by setting various HTTP headers.
// Helmet is a collection of small middleware functions that set different HTTP
// response headers for security. See Express security best practices【216966032337858†L97-L115】.
app.use(helmet());
// Use gzip compression middleware to reduce the size of the response body and
// improve performance【544840395305597†L95-L120】.
app.use(compression());
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
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server when executed directly
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  ensureDefaultAdmin(prisma)
    .catch(err => console.error('Failed to ensure default admin', err))
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    });
}

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
