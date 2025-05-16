import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchBookings } from '../../store/slices/bookingSlice';
import { fetchRooms } from '../../store/slices/roomSlice';
import { fetchBands } from '../../store/slices/bandSlice';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  roomId: string;
  bandId: string;
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

const AdminDashboard = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchBookings()).unwrap(),
          dispatch(fetchRooms()).unwrap(),
          dispatch(fetchBands()).unwrap()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [dispatch]);

  const quickActions = [
    {
      name: 'Manage Bands',
      href: '/admin/bands',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      description: 'View and manage bands'
    },
    {
      name: 'Manage Rooms',
      href: '/admin/rooms',
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      description: 'View and manage rooms'
    },
    {
      name: 'View Calendar',
      href: '/calendar',
      icon: CalendarIcon,
      color: 'bg-purple-500',
      description: 'View and manage bookings'
    },
  ];

  if (bookingsLoading || roomsLoading || bandsLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5722]"></div>
        </div>
      </AdminLayout>
    );
  }

  const error = bookingsError || roomsError || bandsError;
  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
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
        {/* Quick Actions */}
        <div className="bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">Quick Actions</h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="relative block w-full rounded-lg border-2 border-dashed border-gray-700 p-6 text-center hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:ring-offset-2"
                >
                  <action.icon className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-white">
                    {action.name}
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">
                    {action.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Total Bands</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">{bands.length}</dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Total Rooms</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">{rooms.length}</dd>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-400 truncate">Active Bookings</dt>
              <dd className="mt-1 text-3xl font-semibold text-white">
                {bookings.filter(b => new Date(b.end) > new Date()).length}
              </dd>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-white">Recent Bookings</h3>
            <div className="mt-5">
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent bookings</p>
              ) : (
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {bookings.slice(0, 5).map((booking, index) => (
                      <li key={booking.id}>
                        <div className="relative pb-8">
                          {index !== bookings.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-[#FF5722] flex items-center justify-center ring-8 ring-gray-800">
                                <CalendarIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-white">
                                  {booking.band.name} booked {booking.room.name}
                                </p>
                                <p className="mt-0.5 text-sm text-gray-400">
                                  {new Date(booking.start).toLocaleDateString()} - {new Date(booking.end).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 