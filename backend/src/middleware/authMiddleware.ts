import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
    bandId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth headers:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
      email?: string;
      role: string;
      bandId?: string;
    };
    
    console.log('Token decoded successfully:', { userId: decoded.userId, role: decoded.role });
    
    if (!decoded.userId) {
      console.log('Empty userId in token');
      return res.status(401).json({ message: 'Invalid token: missing user ID' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      bandId: user.bandId || undefined
    };
    
    return next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

export const requireBand = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'BAND') {
    return res.status(403).json({ message: 'Band access required' });
  }
  return next();
}; 