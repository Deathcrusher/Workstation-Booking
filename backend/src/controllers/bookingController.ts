import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { roomId, start, end } = req.body;
    const bandId = req.user?.bandId;

    // Check for booking conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        OR: [
          {
            AND: [
              { start: { lte: new Date(start) } },
              { end: { gt: new Date(start) } },
            ],
          },
          {
            AND: [
              { start: { lt: new Date(end) } },
              { end: { gte: new Date(end) } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: 'Booking conflict detected',
        conflictingBooking,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        bandId: bandId!,
        start: new Date(start),
        end: new Date(end),
      },
      include: {
        room: true,
        band: true,
      },
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { start, end, roomId } = req.query;
    const bandId = req.user?.bandId;
    const isAdmin = req.user?.role === 'ADMIN';

    const where: any = {};

    if (start && end) {
      where.OR = [
        {
          AND: [
            { start: { lte: new Date(start as string) } },
            { end: { gt: new Date(start as string) } },
          ],
        },
        {
          AND: [
            { start: { lt: new Date(end as string) } },
            { end: { gte: new Date(end as string) } },
          ],
        },
      ];
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (!isAdmin && bandId) {
      where.bandId = bandId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: true,
        band: true,
      },
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body;
    const bandId = req.user?.bandId;
    const isAdmin = req.user?.role === 'ADMIN';

    // Get the booking to check ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!isAdmin && booking.bandId !== bandId) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Check for booking conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId: booking.roomId,
        id: { not: id },
        OR: [
          {
            AND: [
              { start: { lte: new Date(start) } },
              { end: { gt: new Date(start) } },
            ],
          },
          {
            AND: [
              { start: { lt: new Date(end) } },
              { end: { gte: new Date(end) } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: 'Booking conflict detected',
        conflictingBooking,
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        start: new Date(start),
        end: new Date(end),
      },
      include: {
        room: true,
        band: true,
      },
    });

    return res.json(updatedBooking);
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bandId = req.user?.bandId;
    const isAdmin = req.user?.role === 'ADMIN';

    // Get the booking to check ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!isAdmin && booking.bandId !== bandId) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    await prisma.booking.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 