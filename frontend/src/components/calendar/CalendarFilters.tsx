import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Room {
  id: string;
  name: string;
  color: string;
}

interface CalendarFiltersProps {
  selectedRoomId: string | null;
  onRoomFilterChange: (roomId: string | null) => void;
  onSavePreference: () => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  selectedRoomId,
  onRoomFilterChange,
  onSavePreference,
}) => {
  const { rooms, loading: roomsLoading } = useSelector((state: RootState) => state.rooms);
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-auto">
          <label htmlFor="room-filter" className="block text-sm font-medium text-gray-300 mb-1">
            Filter by Room
          </label>
          <select
            id="room-filter"
            value={selectedRoomId || ''}
            onChange={(e) => {
              const value = e.target.value;
              onRoomFilterChange(value === '' ? null : value);
            }}
            className="block w-full rounded-md py-2 px-3 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            disabled={roomsLoading}
          >
            <option value="">All Rooms</option>
            {rooms.map((room: Room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        
        {user && (
          <button
            onClick={onSavePreference}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 whitespace-nowrap mt-2 sm:mt-6"
          >
            Save as Default View
          </button>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {!selectedRoomId && rooms.map((room: Room) => (
          <div key={room.id} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: room.color }}
            ></div>
            <span className="text-xs text-gray-300">{room.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarFilters; 