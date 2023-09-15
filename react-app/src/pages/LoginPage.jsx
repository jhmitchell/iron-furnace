import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '/src/features/authentication';
import { LoginForm } from '/src/components/forms';
import './LoginPage.css';

const LoginPage = () => {
  const { user, loginUser,  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/';
  
  useEffect(() => {
    // If the user is already logged in, redirect them
    console.log('user', user);
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, location.state]);

  const handleLogin = (credentials) => {
    loginUser(credentials);
  };

  return (
    <div className="login-page">
      <div className="login-flex">
        <div className="login-form-container">
          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
