import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchBookings } from '../store/slices/bookingSlice';
import { fetchRooms } from '../store/slices/roomSlice';
import { fetchBands } from '../store/slices/bandSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookings, loading: bookingsLoading } = useSelector(
    (state: RootState) => state.bookings
  );
  const { rooms, loading: roomsLoading } = useSelector(
    (state: RootState) => state.rooms
  );
  const { bands, loading: bandsLoading } = useSelector(
    (state: RootState) => state.bands
  );

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchRooms());
    dispatch(fetchBands());
  }, [dispatch]);

  if (bookingsLoading || roomsLoading || bandsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Welcome, {user?.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.isAdmin
                ? 'You have access to all features as an administrator.'
                : 'You can view and manage your band bookings.'}
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Rooms
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {rooms.length}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Bands
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {bands.length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Bookings
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <li key={booking.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {booking.band.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.start).toLocaleString()} -{' '}
                          {new Date(booking.end).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${booking.room.color}20`,
                            color: booking.room.color,
                          }}
                        >
                          {booking.room.name}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 