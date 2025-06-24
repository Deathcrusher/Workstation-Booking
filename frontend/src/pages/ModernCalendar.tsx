import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { fetchBookings, Booking } from '../store/slices/bookingSlice';
import { fetchRooms } from '../store/slices/roomSlice';
import { fetchBands } from '../store/slices/bandSlice';
import { RootState, AppDispatch } from '../store';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const locales = {
  'de': de,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Event {
  title: string;
  start: Date;
  end: Date;
}

const ModernCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const { rooms } = useSelector((state: RootState) => state.rooms);
  const { bands } = useSelector((state: RootState) => state.bands);

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchBands());
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    const evts = bookings.map((b: Booking) => {
      const room = rooms.find(r => r.id === b.roomId);
      const band = bands.find(br => br.id === b.bandId);
      return {
        title: `${band?.name || 'Band'} - ${room?.name || 'Room'}`,
        start: new Date(b.start),
        end: new Date(b.end),
      } as Event;
    });
    setEvents(evts);
  }, [bookings, rooms, bands]);

  return (
    <Layout>
      <motion.div
        className="p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-4">Modern Calendar</h1>
        <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            popup
          />
        </div>
      </motion.div>
    </Layout>
  );
};

export default ModernCalendar;
