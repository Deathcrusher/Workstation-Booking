import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/axios';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'BAND';
  band?: {
    id: string;
    name: string;
  } | null;
  bandId?: string | null;
}

const UsersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'BAND',
    bandId: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const { bands } = useSelector((state: RootState) => state.bands);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<User[]>('/admin/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = 'Password is required';
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
      const userData = {
        email: formData.email.trim(),
        password: formData.password.trim() || undefined,
        role: formData.role,
        bandId: formData.role === 'BAND' && formData.bandId ? formData.bandId : null,
      };

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, userData);
      } else {
        await api.post('/admin/users', userData);
      }

      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setSubmitError(
        err.response?.data?.message || 'Failed to save user. Please try again.'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err: any) {
        console.error('Error deleting user:', err);
        alert(err.response?.data?.message || 'Failed to delete user. Please try again.');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetEmail.trim()) {
      setResetError('Email is required');
      return;
    }

    try {
      const { data } = await api.post<{ message: string, newPassword: string }>('/auth/reset-password', { email: resetEmail });
      setResetSuccess(`Password has been reset. Temporary password: ${data.newPassword}`);
      setResetEmail('');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setResetError(
        err.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'BAND',
      bandId: '',
    });
    setFormErrors({});
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-white">Users</h1>
            <p className="mt-2 text-sm text-gray-300">
              A list of all users including their email, role, and band assignment.
            </p>
          </div>
          <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex space-x-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="block rounded-md bg-gray-700 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-gray-600"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary/80"
            >
              <PlusIcon className="h-5 w-5 inline-block mr-1" />
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <button
                    onClick={fetchUsers}
                    className="mt-2 text-indigo-600 hover:text-indigo-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No users found. Click "Add User" to create one.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Band
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'bg-green-500/10 text-green-400'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                          {user.band ? user.band.name : 'N/A'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setFormData({
                                email: user.email,
                                password: '',
                                role: user.role,
                                bandId: user.bandId || '',
                              });
                              setIsModalOpen(true);
                            }}
                            className="text-primary hover:text-primary/80 mr-4"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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

        {/* User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    resetForm();
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
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                      formErrors.email ? 'border-red-500' : 'border-gray-600'
                    } focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    {editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border ${
                      formErrors.password ? 'border-red-500' : 'border-gray-600'
                    } focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'BAND' })
                    }
                    className="mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="BAND">Band</option>
                  </select>
                </div>

                {formData.role === 'BAND' && (
                  <div>
                    <label
                      htmlFor="bandId"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Band
                    </label>
                    <select
                      id="bandId"
                      value={formData.bandId}
                      onChange={(e) =>
                        setFormData({ ...formData, bandId: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">-- Select a Band --</option>
                      {bands.map((band) => (
                        <option key={band.id} value={band.id}>
                          {band.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {isResetModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">Reset Password</h2>
                <button
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetEmail('');
                    setResetError(null);
                    setResetSuccess(null);
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {resetError && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{resetError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{resetSuccess}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label
                    htmlFor="resetEmail"
                    className="block text-sm font-medium text-gray-300"
                  >
                    User Email
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter user email address"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setResetEmail('');
                      setResetError(null);
                      setResetSuccess(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersPage; 