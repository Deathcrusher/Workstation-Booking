import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchBands, createBand, updateBand, deleteBand } from '../../store/slices/bandSlice';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/axios';

interface Band {
  id: string;
  name: string;
  contactEmail: string;
  isActive: boolean;
  users: Array<{
    id: string;
    email: string;
  }>;
}

const BandsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bands, loading, error } = useSelector((state: RootState) => state.bands);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBand, setEditingBand] = useState<Band | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'BAND' });
  const [userMsg, setUserMsg] = useState('');
  const [userErrors, setUserErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchBands()).unwrap();
      } catch (error) {
        console.error('Error fetching bands:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Band name is required';
    }
    if (!formData.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUserForm = () => {
    const errors: { [key: string]: string } = {};
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Invalid email format';
    }
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingBand && editingBand.id) {
        await dispatch(updateBand({ id: editingBand.id, data: formData })).unwrap();
      } else if (!editingBand) {
        await dispatch(createBand(formData)).unwrap();
      } else {
        console.error('Cannot update band without a valid ID.');
        setSubmitError('Cannot update band without a valid ID.');
        return;
      }
      setIsModalOpen(false);
      setEditingBand(null);
      setFormData({ name: '', contactEmail: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Error saving band:', error);
      setSubmitError('Failed to save band. Please check your input and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this band?')) {
      try {
        await dispatch(deleteBand(id)).unwrap();
      } catch (error) {
        console.error('Error deleting band:', error);
        alert('Failed to delete band. Please try again.');
      }
    }
  };

  const handleUserCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg('');
    setUserErrors({});

    if (!validateUserForm()) {
      return;
    }

    try {
      const { data } = await api.post('/admin/users', newUser);
      setUserMsg('User created successfully!');
      setNewUser({ email: '', password: '', role: 'BAND' });
      // Refresh bands to get updated user list
      dispatch(fetchBands());
    } catch (error: any) {
      console.error('Error creating user:', error);
      setUserMsg(error.response?.data?.message || 'Failed to create user. Please try again.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5722]"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-md bg-red-50 p-4 mx-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
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
            <h1 className="text-2xl font-semibold text-white">Bands</h1>
            <p className="mt-2 text-sm text-gray-300">
              A list of all bands in the system including their name, contact email, and status.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setEditingBand(null);
                setFormData({ name: '', contactEmail: '' });
                setFormErrors({});
                setSubmitError(null);
                setIsModalOpen(true);
              }}
              className="block rounded-md bg-[#FF5722] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#F4511E]"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-1" />
              Add Band
            </button>
          </div>
        </div>

        {/* Bands Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {bands.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No bands found. Click "Add Band" to create one.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Contact Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                        Users
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {bands.map((band) => (
                      <tr key={band.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                          {band.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {band.contactEmail}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              band.isActive
                                ? 'bg-green-400/10 text-green-400'
                                : 'bg-red-400/10 text-red-400'
                            }`}
                          >
                            {band.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {(band.users || []).map((user) => (
                              <span
                                key={user.id}
                                className="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300"
                              >
                                {user.email}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={() => {
                              setEditingBand(band);
                              setFormData({
                                name: band.name,
                                contactEmail: band.contactEmail,
                              });
                              setFormErrors({});
                              setSubmitError(null);
                              setIsModalOpen(true);
                            }}
                            className="text-[#FF5722] hover:text-[#F4511E] mr-4"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(band.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
                  {editingBand ? 'Edit Band' : 'Add Band'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBand(null);
                    setFormData({ name: '', contactEmail: '' });
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
                    Band Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name || ''}
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
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                      formErrors.contactEmail ? 'border-red-500' : 'border-gray-600'
                    } focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] sm:text-sm`}
                  />
                  {formErrors.contactEmail && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.contactEmail}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingBand(null);
                      setFormData({ name: '', contactEmail: '' });
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
                    {editingBand ? 'Update Band' : 'Create Band'}
                  </button>
                </div>
              </form>

              {!editingBand && (
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Add User to Band</h3>
                  {userMsg && (
                    <div className={`mb-4 rounded-md p-4 ${
                      userMsg.includes('successfully') ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <p className={`text-sm ${
                        userMsg.includes('successfully') ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {userMsg}
                      </p>
                    </div>
                  )}
                  <form onSubmit={handleUserCreate} className="space-y-4">
                    <div>
                      <label htmlFor="userEmail" className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        id="userEmail"
                        value={newUser.email || ''}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                          userErrors.email ? 'border-red-500' : 'border-gray-600'
                        } focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] sm:text-sm`}
                      />
                      {userErrors.email && (
                        <p className="mt-1 text-sm text-red-500">{userErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="userPassword" className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <input
                        type="password"
                        id="userPassword"
                        value={newUser.password || ''}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                          userErrors.password ? 'border-red-500' : 'border-gray-600'
                        } focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] sm:text-sm`}
                      />
                      {userErrors.password && (
                        <p className="mt-1 text-sm text-red-500">{userErrors.password}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-[#FF5722] rounded-md hover:bg-[#F4511E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                      >
                        Add User
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BandsPage; 