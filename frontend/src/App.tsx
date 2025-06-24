import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { validateToken } from './store/slices/authSlice';
import Layout from './components/Layout';
import AdminLayout from './components/layouts/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import ModernCalendar from './pages/ModernCalendar';
import Bands from './pages/admin/Bands';
import RoomsPage from './pages/admin/RoomsPage';
import UsersPage from './pages/admin/UsersPage';
import AdminDashboard from './pages/admin/Dashboard';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('App mounted, validating token');
    dispatch(validateToken())
      .unwrap()
      .then(response => {
        console.log('Token validation successful:', response);
      })
      .catch(error => {
        console.error('Token validation failed:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    console.log('Auth state updated:', {
      isAuthenticated: auth.isAuthenticated,
      userRole: auth.user?.role
    });
  }, [auth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Layout>
                <Calendar />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar-modern"
          element={
            <PrivateRoute>
              <Layout>
                <ModernCalendar />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/bands"
          element={
            <AdminRoute>
              <AdminLayout>
                <Bands />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <AdminRoute>
              <AdminLayout>
                <RoomsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <AdminRoute>
              <AdminLayout>
                <Calendar />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App; 