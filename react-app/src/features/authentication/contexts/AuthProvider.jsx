import React, { createContext, useState, useEffect } from 'react';
import { loginService, validateTokenService } from '../services/authService';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for user data in local storage upon initialization
  useEffect(() => {
    const initAndValidateUser = async () => {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Validation here also checks for essential fields
          const validation = await validateTokenService(parsedUser.accessToken);

          if (validation && validation.member_id && validation.email) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // Error during validation, assume token is invalid
          console.log('Validation error:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initAndValidateUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { username, password } = credentials;
      const result = await loginService(username, password);

      if (result && result.access_token) {
        // Set the user information and the access token
        const newUser = {
          username,
          accessToken: result.access_token,
        };

        localStorage.setItem('user', JSON.stringify(newUser)); // store user to localStorage
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error during login: ', error);
      // Handle error accordingly
    }
  };

  const logout = () => {
    // Implement logout logic
    // TODO: Remove the access token from the browser's local storage
    localStorage.removeItem('user'); // remove user from localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
