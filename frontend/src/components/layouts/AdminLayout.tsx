import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from '../ThemeToggle';
import { motion } from 'framer-motion';
import logo from '../../images/logo_0.png';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Bands', href: '/admin/bands', icon: UserGroupIcon },
    { name: 'Rooms', href: '/admin/rooms', icon: BuildingOfficeIcon },
    { name: 'Users', href: '/admin/users', icon: UserIcon },
    { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-gray-100 bg-gradient-to-br from-muted-950 via-accent to-muted-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 backdrop-blur-md bg-gradient-to-b from-muted-950 via-primary to-muted-950 border-r border-white/10">
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10 bg-gradient-to-r from-primary/80 via-primary to-primary/80">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">Admin Dashboard</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <motion.div key={item.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                {item.name}
                </Link>
              </motion.div>
            );
          })}
          <motion.button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
            Logout
          </motion.button>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64 bg-gray-100/60 dark:bg-gray-900/60 backdrop-blur-md min-h-screen">
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 