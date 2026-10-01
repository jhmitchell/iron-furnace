import React, { createContext, useState, useEffect, useCallback } from "react";
import { loginService, logoutService, refreshTokenService, validateTokenService } from "../services/authService";

export const AuthContext = createContext();

// Access tokens live for 30 minutes; refresh well before that while signed in.
const REFRESH_INTERVAL_MS = 20 * 60 * 1000;

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

  const clearSession = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Use the HttpOnly refresh cookie to obtain a fresh access token.
  // Throws if the cookie is missing, expired, revoked, or the account is disabled.
  const refreshSession = useCallback(async (username) => {
    const accessToken = await refreshTokenService();
    const refreshed = { username, accessToken };
    localStorage.setItem("user", JSON.stringify(refreshed));
    setUser(refreshed);
    return refreshed;
  }, []);

  // On load: validate the stored access token; if it is expired or rejected,
  // try to refresh it before giving up and signing the user out.
  useEffect(() => {
    const initAndValidateUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (error) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const validation = await validateTokenService(parsedUser.accessToken);
        if (validation && validation.member_id) {
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      } catch (error) {
        // Fall through and attempt a refresh
      }

      try {
        await refreshSession(parsedUser.username);
      } catch (error) {
        clearSession();
      }
      setLoading(false);
    };

    initAndValidateUser();
  }, [clearSession, refreshSession]);

  // Keep the session alive while signed in; sign out if the refresh is rejected.
  useEffect(() => {
    if (!user) return undefined;

    const intervalId = setInterval(() => {
      refreshSession(user.username).catch(() => clearSession());
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user, refreshSession, clearSession]);

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
    // Revoke the refresh token server-side (fire and forget), then clear local state
    logoutService();
    clearSession();
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
