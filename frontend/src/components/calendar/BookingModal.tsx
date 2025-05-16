import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Room {
  id: string;
  name: string;
  color: string;
}

interface Band {
  id: string;
  name: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: {
    start: string;
    end: string;
    roomId: string;
    bandId: string;
  }) => void;
  selectedDate: Date;
  selectedRoomId: string;
  rooms: Room[];
  bands: Band[];
  existingBooking?: {
    id: string;
    start: string;
    end: string;
    roomId: string;
    bandId: string;
  };
}

const BookingModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  selectedRoomId,
  rooms,
  bands,
  existingBooking,
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    start: '',
    end: '',
    roomId: selectedRoomId,
    bandId: '',
  });

  useEffect(() => {
    if (existingBooking) {
      setFormData({
        start: existingBooking.start,
        end: existingBooking.end,
        roomId: existingBooking.roomId,
        bandId: existingBooking.bandId,
      });
    } else {
      // Set default start time to next hour
      const nextHour = new Date(selectedDate);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const endHour = new Date(nextHour);
      endHour.setHours(endHour.getHours() + 1);

      setFormData({
        start: nextHour.toISOString(),
        end: endHour.toISOString(),
        roomId: selectedRoomId,
        bandId: '',
      });
    }
  }, [selectedDate, selectedRoomId, existingBooking]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the backdrop itself was clicked, not its children
    if (e.currentTarget === e.target) {
      onClose();
    }
  }, [onClose]);

  const handleModalContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click from propagating to backdrop
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={handleModalContentClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {existingBooking ? 'Edit Booking' : 'New Booking'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <div className="text-white">
                {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={format(new Date(formData.start), 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(formData.start);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setFormData({ ...formData, start: newDate.toISOString() });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={format(new Date(formData.end), 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(formData.end);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setFormData({ ...formData, end: newDate.toISOString() });
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Room
              </label>
              <select
                value={formData.roomId}
                onChange={(e) =>
                  setFormData({ ...formData, roomId: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Band
              </label>
              <select
                value={formData.bandId}
                onChange={(e) =>
                  setFormData({ ...formData, bandId: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                required
              >
                <option value="">Select a band</option>
                {bands.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF5722] text-white rounded-md hover:bg-[#F4511E] focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {existingBooking ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 