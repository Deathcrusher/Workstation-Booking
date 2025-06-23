import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';
import logo from '../images/logo_0.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-gradient-to-br from-muted-50 via-accent to-muted-50 dark:from-muted-950 dark:via-accent dark:to-muted-950">
      <nav className="backdrop-blur-md bg-gradient-to-r from-primary/80 via-primary to-primary/80 dark:from-muted-950 dark:via-primary dark:to-muted-950 shadow-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <img src={logo} alt="Logo" className="h-8 w-auto" />
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">Band Booking</span>
                </Link>
              </div>
              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/"
                      className="border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  {user?.role === 'ADMIN' && (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          to="/admin/bands"
                          className="border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                          Bands
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          to="/admin/rooms"
                          className="border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                          Rooms
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <motion.button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 