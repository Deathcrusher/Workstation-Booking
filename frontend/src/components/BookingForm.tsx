import { useState, useEffect, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { createBooking, updateBooking } from '../store/slices/bookingSlice';
import { fetchRooms, Room } from '../store/slices/roomSlice';
import { fetchBands, Band } from '../store/slices/bandSlice';

interface BookingFormProps {
  selectedDate: Date;
  onClose: () => void;
  existingBooking?: any;
  rooms: Room[];
  bands: Band[];
}

// Wrap component in React.memo to prevent unnecessary re-renders
const BookingForm = memo(({ selectedDate, onClose, existingBooking, rooms, bands }: BookingFormProps) => {
  console.log("⭐ BookingForm rendered with date:", selectedDate);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading: roomsLoading, error: roomsError } = useSelector((state: RootState) => state.rooms);
  const { loading: bandsLoading, error: bandsError } = useSelector((state: RootState) => state.bands);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { error: bookingError, loading: bookingLoading } = useSelector((state: RootState) => state.bookings);

  // Get initial room preference from localStorage
  const roomPreference = localStorage.getItem('preferredRoomId');

  // Initialize form state once, not on every render
  const [formData, setFormData] = useState(() => {
    // Get default start/end times
    const defaultStartTime = new Date(selectedDate);
    // Round to the next half hour
    const minutes = defaultStartTime.getMinutes();
    const roundedMinutes = minutes < 30 ? 30 : 0;
    const hoursAdjustment = minutes < 30 ? 0 : 1;
    
    defaultStartTime.setHours(
      defaultStartTime.getHours() + hoursAdjustment,
      roundedMinutes,
      0,
      0
    );
    
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 1);
    
    return {
      roomId: existingBooking?.roomId || (user?.role === 'BAND' ? (roomPreference || '') : ''),
      bandId: existingBooking?.bandId || (user?.band?.id || ''),
      start: existingBooking?.start || defaultStartTime.toISOString(),
      end: existingBooking?.end || defaultEndTime.toISOString(),
    };
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Set up the user/auth check only once
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'ADMIN' && !user?.band) {
      setErrors({ auth: 'You do not have permission to make bookings' });
    }
  }, [isAuthenticated, navigate, user]);

  // Update form data if existing booking changes - only runs when the existingBooking prop changes
  useEffect(() => {
    if (existingBooking) {
      setFormData({
        roomId: existingBooking.roomId || '',
        bandId: existingBooking.bandId || '',
        start: existingBooking.start || '',
        end: existingBooking.end || '',
      });
    }
  }, [existingBooking]);

  // Generate time slots for the select dropdowns - memoized to prevent recalculation
  const generateTimeSlots = useCallback(() => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 23; // 11 PM
    const interval = 30; // 30 minutes

    // Get the date part only from selectedDate
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = new Date(baseDate);
        time.setHours(hour, minute, 0, 0);
        slots.push(time);
      }
    }
    
    // Sort by time
    return slots.sort((a, b) => a.getTime() - b.getTime());
  }, [selectedDate]);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.bandId) {
      newErrors.bandId = 'Please select a band';
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

    setErrors(prevErrors => {
      // Only update errors if they've changed
      const hasChanges = Object.keys(newErrors).some(key => prevErrors[key] !== newErrors[key]) || 
                         Object.keys(prevErrors).some(key => !newErrors[key]);
      
      if (hasChanges) {
        return {...prevErrors, ...newErrors};
      }
      return prevErrors;
    });
    
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    try {
      setSubmitting(true);
      console.log("Submitting booking data:", formData);
      
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
        console.log("Booking updated successfully");
      } else {
        await dispatch(createBooking(formData)).unwrap();
        console.log("Booking created successfully");
      }
      setSubmitting(false);
      // Save room preference
      localStorage.setItem('preferredRoomId', formData.roomId);
      onClose();
    } catch (error) {
      setSubmitting(false);
      console.error('Error saving booking:', error);
      setErrors(prev => ({
        ...prev, 
        submission: typeof error === 'string' ? error : 'Failed to save booking. Please try again.'
      }));
    }
  }, [dispatch, existingBooking, formData, onClose, validateForm]);

  // Calculate time slots just once during render
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

  if (roomsLoading || bandsLoading || submitting) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const error = roomsError || bookingError || bandsError || errors.submission;
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

  // Use memoized handlers for form field changes to avoid frequent re-renders
  const handleRoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, roomId: e.target.value }));
  }, []);

  const handleBandChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, bandId: e.target.value }));
  }, []);

  const handleStartChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, start: e.target.value }));
  }, []);

  const handleEndChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, end: e.target.value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      <div>
        <label htmlFor="room" className="block text-sm font-medium text-white">
          Room
        </label>
        <select
          id="room"
          name="room"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-600 text-white ${
            errors.roomId ? 'border-red-500' : 'border-gray-500'
          }`}
          value={formData.roomId}
          onChange={handleRoomChange}
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
        <label htmlFor="band" className="block text-sm font-medium text-white">
          Band
        </label>
        <select
          id="band"
          name="band"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-600 text-white ${
            errors.bandId ? 'border-red-500' : 'border-gray-500'
          }`}
          value={formData.bandId}
          onChange={handleBandChange}
          disabled={user?.role === 'BAND'} // Disable for band members
        >
          <option value="">Select a band</option>
          {bands.map((band) => (
            <option key={band.id} value={band.id}>
              {band.name}
            </option>
          ))}
        </select>
        {errors.bandId && (
          <p className="mt-1 text-sm text-red-600">{errors.bandId}</p>
        )}
      </div>

      <div>
        <label htmlFor="start" className="block text-sm font-medium text-white">
          Start Time
        </label>
        <select
          id="start"
          name="start"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-600 text-white ${
            errors.start ? 'border-red-500' : 'border-gray-500'
          }`}
          value={formData.start}
          onChange={handleStartChange}
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
        <label htmlFor="end" className="block text-sm font-medium text-white">
          End Time
        </label>
        <select
          id="end"
          name="end"
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-600 text-white ${
            errors.end ? 'border-red-500' : 'border-gray-500'
          }`}
          value={formData.end}
          onChange={handleEndChange}
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
          className="inline-flex justify-center py-2 px-4 border border-gray-500 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {submitting ? 'Saving...' : existingBooking ? 'Update Booking' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo to prevent unnecessary re-renders
  // Only re-render if key props have actually changed
  return (
    prevProps.selectedDate.getTime() === nextProps.selectedDate.getTime() &&
    prevProps.existingBooking?.id === nextProps.existingBooking?.id &&
    prevProps.rooms.length === nextProps.rooms.length &&
    prevProps.bands.length === nextProps.bands.length
  );
});

export default BookingForm; 