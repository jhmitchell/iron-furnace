import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/authentication';

const ProtectedRoute = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
