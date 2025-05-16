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

export const createBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { roomId, bandId: bandIdFromRequest, start, end } = req.body;
    const userMakingRequest = req.user;

    let effectiveBandId = bandIdFromRequest;

    if (!userMakingRequest) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // If the user is not an ADMIN, they can only book for their own band.
    // The bandId from the request MUST match their own bandId.
    if (userMakingRequest.role !== 'ADMIN') {
      if (!userMakingRequest.bandId) {
        return res.status(403).json({ message: 'User is not associated with a band and cannot create bookings.' });
      }
      if (bandIdFromRequest !== userMakingRequest.bandId) {
        console.warn(`User ${userMakingRequest.userId} (band: ${userMakingRequest.bandId}) attempted to book for band ${bandIdFromRequest}. Denied.`);
        return res.status(403).json({ message: 'You can only create bookings for your own band.' });
      }
      effectiveBandId = userMakingRequest.bandId; // Ensure it's their own band
    } else {
      // Admin is creating the booking. They can specify any band.
      // Ensure the bandIdFromRequest is provided by the admin.
      if (!bandIdFromRequest) {
        return res.status(400).json({ message: 'Admin must specify a bandId for the booking.' });
      }
    }

    if (!effectiveBandId) { // Should be caught by earlier checks, but as a safeguard
        return res.status(400).json({ message: 'Band ID is missing for the booking.' });
    }
    
    if (!roomId || !start || !end) {
        return res.status(400).json({ message: 'Missing required fields: roomId, start, or end.' });
    }

    // Check for booking conflicts
    const conflict = await checkBookingConflict(roomId, new Date(start), new Date(end));
    if (conflict) {
      return res.status(409).json({
        message: 'Booking conflict detected',
        conflict,
      });
    }

    console.log(`Creating booking with roomId: ${roomId}, bandId: ${effectiveBandId}, start: ${start}, end: ${end}`);

    const booking = await prisma.booking.create({
      data: {
        roomId,
        bandId: effectiveBandId,
        start: new Date(start),
        end: new Date(end),
      },
      include: {
        room: true,
        band: true,
      },
    });

    // Send confirmation email
    const bandForEmail = await prisma.band.findUnique({
      where: { id: effectiveBandId },
      include: { users: true },
    });

    if (bandForEmail?.users[0]?.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: bandForEmail.users[0].email,
          subject: 'Booking Confirmation',
          html: `
            <h1>Booking Confirmation</h1>
            <p>Your booking has been confirmed:</p>
            <ul>
              <li>Room: ${booking.room.name}</li>
              <li>Band: ${booking.band.name}</li>
              <li>Start: ${booking.start.toLocaleString()}</li>
              <li>End: ${booking.end.toLocaleString()}</li>
            </ul>
          `,
        });
        console.log(`Booking confirmation email sent to ${bandForEmail.users[0].email}`);
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        // Do not fail the booking if email fails, but log it.
      }
    }

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error in createBooking:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { start, end, roomId } = req.query;
    const bandId = req.user?.bandId;

    const where: any = {};
    
    // Date range filter
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
    
    // Room filter
    if (roomId) {
      where.roomId = roomId as string;
      console.log(`Filtering bookings by roomId: ${roomId}`);
    }
    
    // Band filter for non-admin users
    if (bandId && req.user?.role !== 'ADMIN') {
      where.bandId = bandId;
      console.log(`Filtering bookings by bandId: ${bandId} for non-admin user`);
    }
    
    console.log('Booking query filters:', JSON.stringify(where));

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
    
    console.log(`Found ${bookings.length} bookings matching the criteria`);
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<Response> => {
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

    return res.json(updatedBooking);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<Response> => {
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

    return res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 