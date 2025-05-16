import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { assignBandsToRoom } from '../../store/slices/roomSlice';
import { fetchBands } from '../../store/slices/bandSlice';

interface RoomAssignmentFormProps {
  roomId: string;
  currentBandIds: string[];
  onClose: () => void;
}

const RoomAssignmentForm: React.FC<RoomAssignmentFormProps> = ({
  roomId,
  currentBandIds,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { bands, loading: bandsLoading } = useSelector((state: RootState) => state.bands);
  const [selectedBandIds, setSelectedBandIds] = useState<string[]>(currentBandIds || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load bands if not already loaded
    if (bands.length === 0 && !bandsLoading) {
      dispatch(fetchBands());
    }
  }, [dispatch, bands.length, bandsLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await dispatch(assignBandsToRoom({ roomId, bandIds: selectedBandIds })).unwrap();
      onClose();
    } catch (err) {
      setError('Failed to assign bands to room. Please try again.');
    }
  };

  const handleBandToggle = (bandId: string) => {
    setSelectedBandIds((prev) =>
      prev.includes(bandId)
        ? prev.filter((id) => id !== bandId)
        : [...prev, bandId]
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Assign Bands to Room</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-500 text-white rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 font-medium mb-2">
            Select Bands
          </label>
          
          {bandsLoading ? (
            <div className="animate-pulse">Loading bands...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bands.map((band) => (
                <div key={band.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`band-${band.id}`}
                    checked={selectedBandIds.includes(band.id)}
                    onChange={() => handleBandToggle(band.id)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded"
                  />
                  <label
                    htmlFor={`band-${band.id}`}
                    className="ml-2 block text-sm text-gray-300"
                  >
                    {band.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={bandsLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500 disabled:opacity-50"
          >
            Save Assignments
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomAssignmentForm; 