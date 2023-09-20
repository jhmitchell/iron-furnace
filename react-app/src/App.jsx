import React, { useEffect, useState } from "react";
import {
  useLocation,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./features/authentication";
import "./App.css";

/**
 * AppRoutes is responsible for managing and rendering the application routes.
 * It includes logic to determine whether to display a 404 Not Found page
 * based on the current location.
 * 
 * NB: All routes are passed to React through apache.
 *
 * @returns {React.Element} - The rendered JSX element
 */
const AppRoutes = () => {
  const [isNotFound, setIsNotFound] = useState(false);
  const location = useLocation();

  /**
   * validSubRoutes contains a mapping of base routes to their valid sub-routes.
   * For example, /support/membership will be matched, but /support/invalid will not.
   */
  const validSubRoutes = {
    support: ["membership", "donate"],
  };

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const [baseRoute, subRoute] = pathParts;

    if (validSubRoutes[baseRoute]) {
      setIsNotFound(subRoute && !validSubRoutes[baseRoute].includes(subRoute));
    } else {
      setIsNotFound(false);
    }
  }, [location]);

  return isNotFound ? (
    <NotFound />
  ) : (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/support/*" element={<SupportPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/test" element={<TestPage />} />
        {/* More protected routes can be added here */}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
