import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '/src/features/authentication';
import './LoginPage.css';

const LoginPage = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/';
  
  useEffect(() => {
    // If the user is already logged in, redirect them
    if (user) {
      navigate(from, { replace: location.state?.replace || false });
    }
  }, [user, navigate, from, location.state]);

  const handleLogin = () => {
    loginUser({});
  };

  return (
    <div className="login-page">
      <div className="login-flex">
        <div className="login-panel left">
          {/* Add your left panel content here */}
        </div>
        <div className="login-panel right">
          {/* Add your right panel content here */}
          <button onClick={handleLogin}>Log In</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
