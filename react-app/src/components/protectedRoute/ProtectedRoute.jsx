import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/authentication';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();  // Get loading state
  const location = useLocation();

  if (loading) {
    // Render nothing while loading results from auth provider
    // If not included, the user may see a flash of the login screen
    return null;
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate replace to="/login" state={{ from: location }} />
  );
};

export default ProtectedRoute;
