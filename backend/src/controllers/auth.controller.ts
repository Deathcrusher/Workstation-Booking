import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { log } from '../utils/logger';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('Login attempt:', req.body);
    log(`Login attempt: ${JSON.stringify(req.body)}`);
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { band: true },
    });
    console.log('User found for login:', !!user);
    if (!user) {
      console.log('No user found for email:', email);
      log(`Login failed: no user for ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log(`Login: User role from DB for ${email}: ${user.role}`);
    console.log(`Login: User ID from DB for ${email}: ${user.id}`);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      log(`Login failed: invalid password for ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.id) {
      console.error('User found but has no ID:', user);
      log(`Login error: user record missing ID for ${email}`);
      return res.status(500).json({ message: 'Authentication error: Invalid user data' });
    }
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        bandId: user.bandId,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    console.log('Login successful for:', email, 'with role:', user.role);
    console.log('Token payload:', { userId: user.id, role: user.role });
    log(`Login success for ${email} as ${user.role}`);
    
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        band: user.band,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    log(`Login exception: ${String(error)}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    return res.json({ message: 'Password reset instructions sent to email', resetToken });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return res.json({ message: 'Password reset successful', newPassword });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// New function to validate token
export const validateTokenHandler = async (req: Request, res: Response): Promise<Response> => {
  // This controller assumes that a middleware has already validated the token
  // and attached user information to req.user.
  
  // The JWT payload is expected to be on req.user (set by authMiddleware)
  const tokenUser = req.user;

  if (!tokenUser || !tokenUser.userId) {
    // This case should ideally be caught by the auth middleware itself
    return res.status(401).json({ message: 'Unauthorized: Invalid token data' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: { // Select only necessary fields to send to client
        id: true,
        email: true,
        role: true,
        bandId: true,
        band: true, // Assuming you want to send band info too
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    console.log(`ValidateTokenHandler: User role from DB for ${user.email}: ${user.role}`);

    return res.status(200).json({ 
      message: 'Token validated successfully', 
      user 
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Internal server error during token validation' });
  }
}; 