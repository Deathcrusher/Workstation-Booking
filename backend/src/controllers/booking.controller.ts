import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const checkBookingConflict = async (
  roomId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
) => {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      id: { not: excludeBookingId },
      OR: [
        {
          AND: [
            { start: { lte: start } },
            { end: { gt: start } },
          ],
        },
        {
          AND: [
            { start: { lt: end } },
            { end: { gte: end } },
          ],
        },
        {
          AND: [
            { start: { gte: start } },
            { end: { lte: end } },
          ],
        },
      ],
    },
  });

  return conflictingBooking;
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { roomId, start, end } = req.body;
    const bandId = req.user?.bandId;

    if (!bandId) {
      return res.status(403).json({ message: 'Only bands can create bookings' });
    }

    // Check for booking conflicts
    const conflict = await checkBookingConflict(roomId, new Date(start), new Date(end));
    if (conflict) {
      return res.status(409).json({
        message: 'Booking conflict detected',
        conflict,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        bandId,
        start: new Date(start),
        end: new Date(end),
      },
      include: {
        room: true,
        band: true,
      },
    });

    // Send confirmation email
    const band = await prisma.band.findUnique({
      where: { id: bandId },
      include: { users: true },
    });

    if (band?.users[0]?.email) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: band.users[0].email,
        subject: 'Booking Confirmation',
        html: `
          <h1>Booking Confirmation</h1>
          <p>Your booking has been confirmed:</p>
          <ul>
            <li>Room: ${booking.room.name}</li>
            <li>Start: ${booking.start.toLocaleString()}</li>
            <li>End: ${booking.end.toLocaleString()}</li>
          </ul>
        `,
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { start, end, roomId } = req.query;
    const bandId = req.user?.bandId;

    const where: any = {};
    if (start && end) {
      where.OR = [
        {
          AND: [
            { start: { lte: new Date(end as string) } },
            { end: { gte: new Date(start as string) } },
          ],
        },
      ];
    }
    if (roomId) {
      where.roomId = roomId;
    }
    if (bandId && req.user?.role !== 'ADMIN') {
      where.bandId = bandId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: true,
        band: true,
      },
      orderBy: {
        start: 'asc',
      },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body;
    const bandId = req.user?.bandId;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.bandId !== bandId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Check for booking conflicts
    const conflict = await checkBookingConflict(
      booking.roomId,
      new Date(start),
      new Date(end),
      id
    );
    if (conflict) {
      return res.status(409).json({
        message: 'Booking conflict detected',
        conflict,
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

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bandId = req.user?.bandId;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.bandId !== bandId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    await prisma.booking.delete({
      where: { id },
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}; 