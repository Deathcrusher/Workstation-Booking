import { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchBookings, createBooking, updateBooking, deleteBooking, Booking, clearError } from '../store/slices/bookingSlice';
import { fetchRooms, Room } from '../store/slices/roomSlice';
import { fetchBands, Band } from '../store/slices/bandSlice';
import BookingForm from '../components/BookingForm';
import CalendarFilters from '../components/calendar/CalendarFilters';
// @ts-ignore
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventInput, EventClickArg, DateSelectArg, EventContentArg } from '@fullcalendar/core';
import AdminLayout from '../components/layouts/AdminLayout';
import Layout from '../components/Layout';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Super simple modal component
const SimpleModal = ({ isOpen, onClose, children }: SimpleModalProps) => {
  if (!isOpen) return null;
  
  // Stop propagation at the container level
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="fixed inset-0 z-50" 
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div 
        className="flex items-center justify-center h-full"
        onClick={handleContainerClick}
      >
        <div 
          className="bg-gray-800 rounded-lg p-6 shadow-2xl max-w-lg w-full border-2 border-indigo-500"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const CalendarPage = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoomId, setSelectedRoomId] = useState(
    localStorage.getItem('preferredRoomId')
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(clearError());
    dispatch(fetchRooms());
    dispatch(fetchBands());
    
    // Fetch bookings with room filter if set
    const filters: { roomId?: string } = {};
    if (selectedRoomId) {
      filters.roomId = selectedRoomId;
    }
    dispatch(fetchBookings(filters));
    
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, navigate, selectedRoomId]);

  // Save user preference for room filter
  const saveRoomPreference = () => {
    if (selectedRoomId) {
      localStorage.setItem('preferredRoomId', selectedRoomId);
    } else {
      localStorage.removeItem('preferredRoomId');
    }
  };

  const handleDateClick = useCallback((arg: DateClickArg) => {
    setSelectedDate(arg.date);
    setEditingBooking(null);
    setIsModalOpen(true);
    console.log("Opening booking form for date:", arg.date);
  }, []);

  const handleSelectSlot = useCallback((arg: DateSelectArg) => {
    setSelectedDate(arg.start);
    setEditingBooking(null);
    setIsModalOpen(true);
    console.log("Opening booking form for selected slot:", arg.start);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const bookingId = clickInfo.event.id;
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setEditingBooking(booking);
      setSelectedDate(new Date(booking.start));
      setIsModalOpen(true);
      console.log("Opening booking form for existing booking:", booking.id);
    }
  }, [bookings]);
  
  const handleDeleteEvent = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await dispatch(deleteBooking(bookingId)).unwrap();
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
  };

  const closeModal = useCallback(() => {
    console.log("Closing booking modal");
    setIsModalOpen(false);
    // Add a small delay before clearing the editing booking to avoid UI flicker
    setTimeout(() => {
      setEditingBooking(null);
    }, 100);
  }, []);

  const openBookingModal = useCallback(() => {
    setSelectedDate(new Date());
    setEditingBooking(null);
    setIsModalOpen(true);
  }, []);

  const calendarEvents = bookings.map((booking) => {
    const room = rooms.find((r) => r.id === booking.roomId);
    const band = bands.find((b) => b.id === booking.bandId);
    return {
      id: booking.id,
      title: `${band?.name || 'Unknown Band'} - ${room?.name || 'Unknown Room'}`,
      start: booking.start,
      end: booking.end,
      backgroundColor: room?.color || '#3788D8',
      borderColor: room?.color || '#3788D8',
      extendedProps: {
        roomId: booking.roomId,
        bandId: booking.bandId,
        roomName: room?.name,
        bandName: band?.name,
      }
    };
  });

  const loading = bookingsLoading || roomsLoading || bandsLoading;
  const CurrentLayout = user?.role === 'ADMIN' ? AdminLayout : Layout;

  if (!isAuthenticated) return null;

  if ((loading && bookings.length === 0) || isInitialLoading) {
    return (
      <CurrentLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </CurrentLayout>
    );
  }

  const apiError = bookingsError || roomsError || bandsError;
  if (apiError) {
    return (
      <CurrentLayout>
        <div className="rounded-md bg-red-50 p-4 m-4">
          <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
          <p className="text-sm text-red-700">{String(apiError)}</p>
          <button 
            onClick={() => {
              dispatch(clearError());
              const filters: { roomId?: string } = {};
              if (selectedRoomId) {
                filters.roomId = selectedRoomId;
              }
              dispatch(fetchBookings(filters));
            }}
            className="mt-3 bg-red-100 px-3 py-1 rounded border border-red-300 text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </CurrentLayout>
    );
  }
  
  if (!rooms.length || !bands.length) {
     return (
      <CurrentLayout>
        <div className="p-4 text-center">
          <p>Rooms or bands not loaded yet. This might affect creating new bookings.</p>
          <p>If you are an admin, please set them up.</p>
        </div>
      </CurrentLayout>
    );
  }

  return (
    <CurrentLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-4">Calendar</h1>
        
        <CalendarFilters
          selectedRoomId={selectedRoomId}
          onRoomFilterChange={setSelectedRoomId}
          onSavePreference={saveRoomPreference}
        />
        
        <div className="flex justify-end mb-4">
          <button
            onClick={openBookingModal}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create New Booking
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-10 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {/* @ts-ignore - Bypass FullCalendar typing issues */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            selectable={true}
            select={handleSelectSlot}
            editable={user?.role === 'ADMIN'}
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            height="auto"
            nowIndicator={true}
          />
        </div>

        {/* Simplified Modal */}
        <SimpleModal isOpen={isModalOpen} onClose={closeModal}>
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBooking ? 'Edit Booking' : 'Create New Booking'}
            </h2>
            
            <div className="space-y-6">
              {isModalOpen && (
                <BookingForm
                  key={`booking-form-${editingBooking ? editingBooking.id : 'new'}-${Date.now()}`}
                  selectedDate={selectedDate}
                  onClose={closeModal}
                  existingBooking={editingBooking}
                  rooms={rooms}
                  bands={bands}
                />
              )}
            </div>
          </div>
        </SimpleModal>
      </div>
    </CurrentLayout>
  );
};

export default CalendarPage; 