import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface Booking {
  id: string;
  start: string;
  end: string;
  room: {
    id: string;
    name: string;
    color: string;
  };
  band: {
    id: string;
    name: string;
  };
}

interface CalendarProps {
  bookings: Booking[];
  onTimeSlotClick: (date: Date, roomId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const Calendar = ({ bookings, onTimeSlotClick, loading, error }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [rooms, setRooms] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Extract unique rooms from bookings
    const uniqueRooms = Array.from(
      new Set(bookings.map((booking) => booking.room.id))
    ).map((roomId) => {
      const booking = bookings.find((b) => b.room.id === roomId);
      return {
        id: roomId,
        name: booking!.room.name,
        color: booking!.room.color,
      };
    });
    setRooms(uniqueRooms);
  }, [bookings]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const getBookingsForTimeSlot = (date: Date, roomId: string) => {
    return bookings.filter(
      (booking) =>
        isSameDay(new Date(booking.start), date) &&
        booking.room.id === roomId
    );
  };

  const renderWeekView = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(subDays(currentDate, 7))}
              className="p-2 text-gray-400 hover:text-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {format(weekStart, 'd. MMMM', { locale: de })} -{' '}
              {format(weekEnd, 'd. MMMM yyyy', { locale: de })}
            </h2>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 text-gray-400 hover:text-white"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md ${
                view === 'week'
                  ? 'bg-[#FF5722] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md ${
                view === 'day'
                  ? 'bg-[#FF5722] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-px bg-gray-700">
            {/* Time column */}
            <div className="bg-gray-800">
              <div className="h-12"></div>
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-700 text-gray-400 text-sm p-2"
                >
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day) => (
              <div key={day.toISOString()} className="bg-gray-800">
                <div className="h-12 border-b border-gray-700 p-2">
                  <div className="text-white font-medium">
                    {format(day, 'EEEE', { locale: de })}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {format(day, 'd. MMMM', { locale: de })}
                  </div>
                </div>
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-700 relative"
                  >
                    {rooms.map((room) => {
                      const roomBookings = getBookingsForTimeSlot(day, room.id);
                      return (
                        <div
                          key={room.id}
                          className="absolute inset-0 cursor-pointer hover:bg-gray-700/50"
                          onClick={() => onTimeSlotClick(day, room.id)}
                        >
                          {roomBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="absolute inset-x-1 rounded-md p-1 text-xs"
                              style={{
                                backgroundColor: booking.room.color,
                                top: `${(new Date(booking.start).getMinutes() / 60) * 100}%`,
                                height: `${
                                  ((new Date(booking.end).getTime() -
                                    new Date(booking.start).getTime()) /
                                    (1000 * 60 * 60)) *
                                  100
                                }%`,
                              }}
                            >
                              <div className="font-medium text-white">
                                {booking.band.name}
                              </div>
                              <div className="text-white/80">
                                {format(new Date(booking.start), 'HH:mm')} -{' '}
                                {format(new Date(booking.end), 'HH:mm')}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
              className="p-2 text-gray-400 hover:text-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </h2>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="p-2 text-gray-400 hover:text-white"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md ${
                view === 'week'
                  ? 'bg-[#FF5722] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded-md ${
                view === 'day'
                  ? 'bg-[#FF5722] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-px bg-gray-700">
            {/* Time column */}
            <div className="bg-gray-800">
              <div className="h-12"></div>
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-700 text-gray-400 text-sm p-2"
                >
                  {format(new Date().setHours(hour, 0), 'HH:mm')}
                </div>
              ))}
            </div>

            {/* Rooms column */}
            <div className="bg-gray-800">
              <div className="h-12 border-b border-gray-700 p-2">
                <div className="text-white font-medium">Rooms</div>
              </div>
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-700 relative"
                >
                  {rooms.map((room) => {
                    const roomBookings = getBookingsForTimeSlot(currentDate, room.id);
                    return (
                      <div
                        key={room.id}
                        className="absolute inset-0 cursor-pointer hover:bg-gray-700/50"
                        onClick={() => onTimeSlotClick(currentDate, room.id)}
                      >
                        {roomBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="absolute inset-x-1 rounded-md p-1 text-xs"
                            style={{
                              backgroundColor: booking.room.color,
                              top: `${(new Date(booking.start).getMinutes() / 60) * 100}%`,
                              height: `${
                                ((new Date(booking.end).getTime() -
                                  new Date(booking.start).getTime()) /
                                  (1000 * 60 * 60)) *
                                100
                              }%`,
                            }}
                          >
                            <div className="font-medium text-white">
                              {booking.band.name}
                            </div>
                            <div className="text-white/80">
                              {format(new Date(booking.start), 'HH:mm')} -{' '}
                              {format(new Date(booking.end), 'HH:mm')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Authentication Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please log in to view the calendar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 rounded-lg p-4">
      {view === 'week' ? renderWeekView() : renderDayView()}
    </div>
  );
};

export default Calendar; 