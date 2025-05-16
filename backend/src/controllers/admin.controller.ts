import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get all users
export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        band: true,
      },
      orderBy: {
        email: 'asc',
      }
    });
    return res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        band: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, role, bandId } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'BAND',
        bandId: role === 'BAND' ? bandId : null,
      },
      include: {
        band: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { email, password, role, bandId } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({ message: 'Email is already taken' });
      }
    }

    // Prepare update data
    const updateData: any = {
      email: email || undefined,
      role: role || undefined,
      bandId: role === 'BAND' ? bandId : null,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        band: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 