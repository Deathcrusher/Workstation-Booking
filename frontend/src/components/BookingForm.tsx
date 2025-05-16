import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { createBooking, updateBooking } from '../store/slices/bookingSlice';
import { fetchRooms } from '../store/slices/roomSlice';

interface BookingFormProps {
  selectedDate: Date;
  onClose: () => void;
  existingBooking?: any;
}

const BookingForm = ({ selectedDate, onClose, existingBooking }: BookingFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { rooms, loading: roomsLoading, error: roomsError } = useSelector((state: RootState) => state.rooms);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { error: bookingError } = useSelector((state: RootState) => state.bookings);

  const [formData, setFormData] = useState({
    roomId: existingBooking?.roomId || '',
    start: existingBooking?.start || '',
    end: existingBooking?.end || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user has permission to book
    if (user?.role !== 'ADMIN' && !user?.band) {
      setErrors({ auth: 'You do not have permission to make bookings' });
      return;
    }

    dispatch(fetchRooms());
  }, [dispatch, isAuthenticated, navigate, user]);

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = new Date(selectedDate);
        time.setHours(hour, minute, 0, 0);
        slots.push(time);
      }
    }
    return slots;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.start) {
      newErrors.start = 'Please select a start time';
    }

    if (!formData.end) {
      newErrors.end = 'Please select an end time';
    }

    if (formData.start && formData.end) {
      const startTime = new Date(formData.start);
      const endTime = new Date(formData.end);

      if (endTime <= startTime) {
        newErrors.end = 'End time must be after start time';
      }

      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      if (duration < 30) {
        newErrors.end = 'Minimum booking duration is 30 minutes';
      }
      if (duration > 240) {
        newErrors.end = 'Maximum booking duration is 4 hours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (existingBooking) {
        await dispatch(
          updateBooking({
            id: existingBooking.id,
            data: {
              start: formData.start,
              end: formData.end,
            },
          })
        ).unwrap();
      } else {
        await dispatch(createBooking(formData)).unwrap();
      }
      onClose();
    } catch (error) {
      // Error is handled by the booking slice
      console.error('Error saving booking:', error);
    }
  };

  const timeSlots = generateTimeSlots();

  if (!isAuthenticated) {
    return null;
  }

  if (errors.auth) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{errors.auth}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (roomsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const error = roomsError || bookingError;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="room" className="block text-sm font-medium text-gray-700">
          Room
        </label>
        <select
          id="room"
          name="room"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.roomId ? 'border-red-300' : 'border-gray-300'
          }`}
          value={formData.roomId}
          onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
        >
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        {errors.roomId && (
          <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>
        )}
      </div>

      <div>
        <label htmlFor="start" className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <select
          id="start"
          name="start"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.start ? 'border-red-300' : 'border-gray-300'
          }`}
          value={formData.start}
          onChange={(e) => setFormData({ ...formData, start: e.target.value })}
        >
          <option value="">Select start time</option>
          {timeSlots.map((time) => (
            <option key={time.toISOString()} value={time.toISOString()}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </option>
          ))}
        </select>
        {errors.start && (
          <p className="mt-1 text-sm text-red-600">{errors.start}</p>
        )}
      </div>

      <div>
        <label htmlFor="end" className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <select
          id="end"
          name="end"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.end ? 'border-red-300' : 'border-gray-300'
          }`}
          value={formData.end}
          onChange={(e) => setFormData({ ...formData, end: e.target.value })}
        >
          <option value="">Select end time</option>
          {timeSlots.map((time) => (
            <option key={time.toISOString()} value={time.toISOString()}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </option>
          ))}
        </select>
        {errors.end && (
          <p className="mt-1 text-sm text-red-600">{errors.end}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {existingBooking ? 'Update Booking' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm; 