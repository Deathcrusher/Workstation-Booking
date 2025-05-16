import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchBookings, deleteBooking } from '../store/slices/bookingSlice';
import { fetchRooms } from '../store/slices/roomSlice';
import { fetchBands } from '../store/slices/bandSlice';
import BookingForm from '../components/BookingForm';

interface Room {
  id: string;
  name: string;
  color: string;
}

interface Booking {
  id: string;
  roomId: string;
  bandId: string;
  start: string;
  end: string;
  room: Room;
  band: {
    id: string;
    name: string;
  };
}

const Calendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { bookings, loading: bookingsLoading, error: bookingsError } = useSelector(
    (state: RootState) => state.bookings
  );
  const { rooms, loading: roomsLoading, error: roomsError } = useSelector(
    (state: RootState) => state.rooms
  );
  const { bands, loading: bandsLoading, error: bandsError } = useSelector(
    (state: RootState) => state.bands
  );
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([
          dispatch(fetchBookings()).unwrap(),
          dispatch(fetchRooms()).unwrap(),
          dispatch(fetchBands()).unwrap(),
        ]);
        setRetryCount(0); // Reset retry count on success
      } catch (error: any) {
        console.error('Error loading data:', error);
        const errorMessage = error.message || 'Failed to load calendar data.';
        setError(errorMessage);
        
        // Only retry up to 3 times
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(loadData, 2000); // Retry after 2 seconds
        }
      }
    };

    loadData();
  }, [dispatch, isAuthenticated, navigate, retryCount]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        setError(null);
        await dispatch(deleteBooking(id)).unwrap();
      } catch (err: any) {
        console.error('Error deleting booking:', err);
        setError(err.message || 'Failed to delete booking. Please try again.');
      }
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking: Booking) => {
      const bookingDate = new Date(booking.start);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    window.location.reload();
  };

  if (!isAuthenticated) {
    return null;
  }

  const loading = bookingsLoading || roomsLoading || bandsLoading;
  const apiError = bookingsError || roomsError || bandsError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || apiError}</p>
                  <div className="mt-4 space-x-4">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rooms.length || !bands.length) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {!rooms.length && !bands.length
                ? 'No rooms or bands have been set up yet.'
                : !rooms.length
                ? 'No rooms have been set up yet.'
                : 'No bands have been set up yet.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(selectedDate);
  const bookingsForSelectedDate = getBookingsForDate(selectedDate);

  return (
    <div className="space-y-6 p-4">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage room bookings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setEditingBooking(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add booking
          </button>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-900"
              >
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div
                key={index}
                className={`bg-white p-2 min-h-[100px] ${
                  day && day.getDate() === selectedDate.getDate()
                    ? 'ring-2 ring-indigo-500'
                    : ''
                }`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="text-sm text-gray-500">{day.getDate()}</div>
                    <div className="mt-1 space-y-1">
                      {getBookingsForDate(day).map((booking: Booking) => {
                        const room = rooms.find((r: Room) => r.id === booking.roomId);
                        return (
                          <div
                            key={booking.id}
                            className="text-xs p-1 rounded truncate cursor-pointer hover:bg-opacity-30"
                            style={{
                              backgroundColor: `${room?.color}20`,
                              color: room?.color,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBooking(booking);
                              setIsModalOpen(true);
                            }}
                          >
                            {booking.band.name} - {room?.name}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Bookings for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {bookingsForSelectedDate.map((booking: Booking) => {
                  const room = rooms.find((r: Room) => r.id === booking.roomId);
                  return (
                    <li key={booking.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {booking.band.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.start).toLocaleTimeString()} -{' '}
                            {new Date(booking.end).toLocaleTimeString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${room?.color}20`,
                              color: room?.color,
                            }}
                          >
                            {room?.name}
                          </span>
                        </div>
                        {user?.role === 'ADMIN' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingBooking(booking);
                                setIsModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <BookingForm
              selectedDate={selectedDate}
              onClose={() => {
                setIsModalOpen(false);
                setEditingBooking(null);
              }}
              existingBooking={editingBooking}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 