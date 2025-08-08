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
import { useTranslation } from 'react-i18next';

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

  // t: translation function; i18n: holds current language ("en" or "de")
  const { t, i18n } = useTranslation();

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
        <h1 className="text-2xl font-bold text-white mb-4">{t('Modern Calendar')}</h1>
        <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            // Provide the current culture so the calendar's headings follow the
            // selected language (e.g., Monday vs. Montag).
            culture={i18n.language}
            // Only show month, week and day views
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            popup
            // Override navigation and view labels with translated strings
            messages={{
              next: t('Next'),
              previous: t('Previous'),
              today: t('Today'),
              month: t('Month'),
              week: t('Week'),
              day: t('Day'),
              agenda: t('Agenda'),
              date: t('Date'),
              time: t('Time'),
              noEventsInRange: t('No events in range'),
            }}
          />
        </div>
      </motion.div>
    </Layout>
  );
};

export default ModernCalendar;
