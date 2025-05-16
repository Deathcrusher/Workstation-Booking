import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createBand = async (req: Request, res: Response) => {
  try {
    const { name, contactEmail } = req.body;

    // Generate a random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

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

    // In a real application, you would send the temporary password to the user's email
    res.status(201).json({
      band,
      tempPassword, // Remove this in production
    });
  } catch (error) {
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
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const band = await prisma.band.findUnique({
      where: { id },
      include: {
        users: true,
        rooms: true,
        bookings: true,
      },
    });

    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }

    return res.json(band);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

    res.json(band);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete associated users first
    await prisma.user.deleteMany({
      where: { bandId: id },
    });

    // Then delete the band
    await prisma.band.delete({
      where: { id },
    });

    res.json({ message: 'Band deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}; 