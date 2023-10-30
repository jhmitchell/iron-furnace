import React, { createContext, useState, useEffect } from "react";
import { loginService, validateTokenService } from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  /**
   * State variables explained:
   * - user: Holds the current authenticated user data, null if not authenticated.
   * - loading: A boolean indicating if the initial token validation is in progress.
   * - isProcessing: A boolean indicating if any API calls (like login) are in progress.
   */

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for user data in local storage upon initialization
  useEffect(() => {
    const initAndValidateUser = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Validation here also checks for essential fields
          const validation = await validateTokenService(parsedUser.accessToken);

          if (validation && validation.member_id && validation.email) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("user");
            setUser(null);
          }
        } catch (error) {
          // Error during validation, assume token is invalid
          console.log("Validation error:", error);
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false); // Initial validation complete
    };

    initAndValidateUser();
  }, []);

  const login = async (credentials) => {
    setIsProcessing(true); // Start API processing
    try {
      const { username, password } = credentials;
      const result = await loginService(username, password);

      if (result && result.access_token) {
        // Set the user information and the access token
        const newUser = {
          username,
          accessToken: result.access_token,
        };

        localStorage.setItem("user", JSON.stringify(newUser)); // store user to localStorage
        setUser(newUser);
      }
    } catch (error) {
      console.error("Error during login: ", error);
      // Handle error accordingly
    } finally {
      setIsProcessing(false); // End API processing
    }
  };

  const logout = () => {
    // Implement logout logic
    // TODO: Remove the access token from the browser's local storage
    localStorage.removeItem("user"); // remove user from localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isProcessing, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
