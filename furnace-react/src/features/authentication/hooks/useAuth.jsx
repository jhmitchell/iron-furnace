import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, isProcessing, login, logout } = context;

  const loginUser = (credentials) => {
    login(credentials);
  };

  const logoutUser = () => {
    logout();
  };

  return {
    user,
    loading,
    isProcessing,
    loginUser,
    logoutUser,
  };
};

export default useAuth;
