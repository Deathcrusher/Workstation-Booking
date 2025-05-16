import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createBand = async (req: Request, res: Response) => {
  try {
    const { name, contactEmail } = req.body;

    // Generate a random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create band and user
    const band = await prisma.band.create({
      data: {
        name,
        contactEmail,
        users: {
          create: {
            email: contactEmail,
            password: hashedPassword,
            role: 'BAND',
          },
        },
      },
      include: {
        users: true,
      },
    });

    // TODO: Send email with credentials
    res.status(201).json({
      band,
      password, // In production, this should be sent via email
    });
  } catch (error) {
    console.error('Create band error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBands = async (_req: Request, res: Response) => {
  try {
    const bands = await prisma.band.findMany({
      include: {
        users: true,
        rooms: true,
      },
    });
    res.json(bands);
  } catch (error) {
    console.error('Get bands error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate id is provided and not 'undefined'
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid band ID is required' });
    }
    
    const { name, contactEmail, isActive } = req.body;

    const band = await prisma.band.update({
      where: { id },
      data: {
        name,
        contactEmail,
        isActive,
      },
      include: {
        users: true,
      },
    });

    return res.json(band);
  } catch (error) {
    console.error('Update band error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate id is provided and not 'undefined'
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Valid band ID is required' });
    }

    // Delete associated users first
    await prisma.user.deleteMany({
      where: { bandId: id },
    });

    // Delete the band
    await prisma.band.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Delete band error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 