import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/authentication';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();  // Get loading state
  const location = useLocation();

  if (loading) {
    // Render nothing while loading results from auth provider
    // Could be replaced with a loading indicator
    return null;
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
};

export default ProtectedRoute;
