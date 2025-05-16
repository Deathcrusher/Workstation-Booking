import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to convert features array to string
const convertFeaturesToString = (features: string[]): string => {
  return Array.isArray(features) ? features.join(',') : features;
};

// Helper function to convert features string to array
const convertFeaturesToArray = (featuresString: string): string[] => {
  return featuresString ? featuresString.split(',') : [];
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, location, features, color, bandIds } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }

    // Convert features array to comma-separated string
    const featuresString = convertFeaturesToString(features || []);

    const room = await prisma.room.create({
      data: {
        name,
        location,
        features: featuresString,
        color: color || '#000000',
        bands: {
          connect: bandIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        bands: true,
      },
    });

    // Convert features back to array for the response
    return res.status(201).json({
      ...room,
      features: convertFeaturesToArray(room.features),
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ message: 'Internal server error' });
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

    // Convert features string to array in each room
    const formattedRooms = rooms.map(room => ({
      ...room,
      features: convertFeaturesToArray(room.features),
    }));

    return res.json(formattedRooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, features, color, bandIds } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Convert features array to comma-separated string
    const featuresString = convertFeaturesToString(features || []);

    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        location,
        features: featuresString,
        color,
        bands: {
          set: bandIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        bands: true,
      },
    });

    // Convert features back to array for the response
    return res.json({
      ...room,
      features: convertFeaturesToArray(room.features),
    });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Delete associated bookings first
    await prisma.booking.deleteMany({
      where: { roomId: id },
    });

    // Delete the room
    await prisma.room.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 