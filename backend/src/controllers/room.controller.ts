import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRoom = async (req: Request, res: Response) => {
  console.log('Attempting to create room with body:', req.body);
  try {
    let { name, location, features, color } = req.body;

    if (!name) {
      console.log('Validation failed: Room name is missing');
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Convert features array to a comma-separated string if it's an array
    if (Array.isArray(features)) {
      features = features.join(', ');
    }

    const room = await prisma.room.create({
      data: {
        name,
        location,
        features: features as string, // Ensure it's passed as string
        color,
      },
    });
    console.log('Room created successfully:', room);
    return res.status(201).json(room);
  } catch (error) {
    console.error('Error in createRoom:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

export const getRooms = async (_req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        bands: true,
        bookings: true,
      },
    });
    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bands: true,
        bookings: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    return res.json(room);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  console.log(`Attempting to update room with ID: ${req.params.id}, body:`, req.body);
  try {
    const { id } = req.params;
    let { name, location, features, color } = req.body;

    // Convert features array to a comma-separated string if it's an array
    if (Array.isArray(features)) {
      features = features.join(', ');
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        location,
        features: features as string, // Ensure it's passed as string
        color,
      },
    });
    console.log('Room updated successfully:', room);
    return res.json(room);
  } catch (error) {
    console.error(`Error in updateRoom for ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete associated bookings first
    await prisma.booking.deleteMany({
      where: { roomId: id },
    });

    // Then delete the room
    await prisma.room.delete({
      where: { id },
    });

    return res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignBandsToRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { bandIds } = req.body;

    // First, remove all existing band assignments
    await prisma.room.update({
      where: { id: roomId },
      data: {
        bands: {
          set: [], // Clear existing relationships
        },
      },
    });

    // Then, add the new band assignments
    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        bands: {
          connect: bandIds.map((id: string) => ({ id })),
        },
      },
      include: {
        bands: true,
      },
    });

    return res.json(room);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 