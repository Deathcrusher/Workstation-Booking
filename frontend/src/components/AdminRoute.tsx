import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  console.log('AdminRoute Check: isAuthenticated:', isAuthenticated, 'User:', user);

  if (!isAuthenticated) {
    console.warn('AdminRoute: User is not authenticated. Redirecting to /login.');
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'ADMIN') {
    console.warn(`AdminRoute: User role is "${user?.role}" instead of \'ADMIN\'. Redirecting to /login.`);
    return <Navigate to="/login" />;
  }

  console.log('AdminRoute: Access granted.');
  return <>{children}</>;
};

export default AdminRoute; 