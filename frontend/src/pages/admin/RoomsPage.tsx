import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchRooms, createRoom, updateRoom, deleteRoom, Room } from '../../store/slices/roomSlice';
import { fetchBands } from '../../store/slices/bandSlice';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import RoomAssignmentForm from '../../components/admin/RoomAssignmentForm';

const RoomsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, loading: roomsLoading, error: roomsError } = useSelector((state: RootState) => state.rooms);
  const { bands, loading: bandsLoading } = useSelector((state: RootState) => state.bands);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    features: [] as string[],
    color: '#FF5722',
    bandIds: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningRoom, setAssigningRoom] = useState<Room | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchRooms()).unwrap(),
          dispatch(fetchBands()).unwrap(),
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Room name is required';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (formData.features.length === 0) {
      errors.features = 'At least one feature is required';
    }
    if (!formData.color) {
      errors.color = 'Color is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      const featuresString = formData.features.join(', ');

      const roomPayload: Partial<Room> = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        features: featuresString,
        color: formData.color,
      };

      const finalPayload: any = { ...roomPayload };
      if (formData.bandIds && formData.bandIds.length > 0) {
        finalPayload.bandIds = formData.bandIds;
      }

      if (editingRoom) {
        await dispatch(updateRoom({ id: editingRoom.id, data: finalPayload })).unwrap();
      } else {
        await dispatch(createRoom(finalPayload)).unwrap();
      }
      setIsModalOpen(false);
      setEditingRoom(null);
      setFormData({
        name: '',
        location: '',
        features: [],
        color: '#FF5722',
        bandIds: [],
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error saving room:', error);
      setSubmitError(error.message || 'Failed to save room. Please check your input and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await dispatch(deleteRoom(id)).unwrap();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room. Please try again.');
      }
    }
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  // Close all modals function
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsAssignModalOpen(false);
    setEditingRoom(null);
    setAssigningRoom(null);
  };

  if (roomsLoading || bandsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5722]"></div>
        </div>
      </AdminLayout>
    );
  }

  if (roomsError) {
    return (
      <AdminLayout>
        <div className="rounded-md bg-red-50 p-4 mx-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{roomsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-indigo-600 hover:text-indigo-500"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-white">Rooms</h1>
            <p className="mt-2 text-sm text-gray-300">
              A list of all rehearsal rooms including their name, location, features, and assigned bands.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setEditingRoom(null);
                setFormData({
                  name: '',
                  location: '',
                  features: [],
                  color: '#FF5722',
                  bandIds: [],
                });
                setIsModalOpen(true);
              }}
              className="block rounded-md bg-[#FF5722] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#F4511E]"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-1" />
              Add Room
            </button>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No rooms found. Click "Add Room" to create one.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Location
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Features
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Assigned Bands
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {rooms.map((room: Room) => {
                      const featuresArray: string[] = 
                        room.features && typeof room.features === 'string' 
                          ? room.features.split(',').map(f => f.trim()).filter(f => f.length > 0) 
                          : [];

                      return (
                        <tr key={room.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            <div className="flex items-center">
                              <div
                                className="h-4 w-4 rounded-full mr-2"
                                style={{ backgroundColor: room.color }}
                              />
                              {room.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {room.location}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-300">
                            <div className="flex flex-wrap gap-1">
                              {featuresArray.map((feature: string) => (
                                <span
                                  key={feature}
                                  className="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-300">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(room.bands) && room.bands.map((band) => (
                                <span
                                  key={band.id}
                                  className="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300"
                                >
                                  {band.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button
                              onClick={() => {
                                setAssigningRoom(room);
                                setIsAssignModalOpen(true);
                              }}
                              className="text-blue-500 hover:text-blue-600 mr-4"
                              title="Manage room assignments"
                            >
                              <UsersIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingRoom(room);
                                const featuresForForm = 
                                  typeof room.features === 'string' && room.features.length > 0 
                                    ? room.features.split(',').map(f => f.trim()).filter(f => f.length > 0)
                                    : [];
                                setFormData({
                                  name: room.name,
                                  location: room.location,
                                  features: featuresForForm,
                                  color: room.color,
                                  bandIds: room.bands.map((band) => band.id),
                                });
                                setIsModalOpen(true);
                              }}
                              className="text-[#FF5722] hover:text-[#F4511E] mr-4"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(room.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">
                  {editingRoom ? 'Edit Room' : 'Add Room'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRoom(null);
                    setFormData({
                      name: '',
                      location: '',
                      features: [],
                      color: '#FF5722',
                      bandIds: [],
                    });
                    setFormErrors({});
                    setSubmitError(null);
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{submitError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Room Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                      formErrors.name ? 'border-red-500' : 'border-gray-600'
                    } focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] sm:text-sm`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                      formErrors.location ? 'border-red-500' : 'border-gray-600'
                    } focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] sm:text-sm`}
                  />
                  {formErrors.location && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {['PA System', 'Drums', 'Piano', 'Guitar Amp', 'Bass Amp'].map((feature) => (
                      <label key={feature} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                          className="rounded border-gray-600 text-[#FF5722] focus:ring-[#FF5722] bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.features && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.features}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-300">
                    Color
                  </label>
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="mt-1 block w-full h-10 rounded-md shadow-sm border border-gray-600 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingRoom(null);
                      setFormData({
                        name: '',
                        location: '',
                        features: [],
                        color: '#FF5722',
                        bandIds: [],
                      });
                      setFormErrors({});
                      setSubmitError(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#FF5722] rounded-md hover:bg-[#F4511E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                  >
                    {editingRoom ? 'Update Room' : 'Create Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Room Assignment Modal */}
        {isAssignModalOpen && assigningRoom && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-auto">
              <RoomAssignmentForm
                roomId={assigningRoom.id}
                currentBandIds={assigningRoom.bands.map(band => band.id)}
                onClose={() => {
                  setIsAssignModalOpen(false);
                  setAssigningRoom(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RoomsPage; 