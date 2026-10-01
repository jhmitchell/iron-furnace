import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, isProcessing, login, logout } = context;

  return {
    user,
    loading,
    isProcessing,
    /** Resolves to { ok: true } or { ok: false, error, retryAfter }; see AuthProvider. */
    loginUser: login,
    logoutUser: logout,
  };
};

export default useAuth;
