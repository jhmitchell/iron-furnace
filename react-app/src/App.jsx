import React from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";
import Membership from "./pages/Membership";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./features/authentication";
import "./App.css";

/**
 * RoutesComponent is responsible for defining the routes. If a route
 * cannot be matched, the NotFound component is rendered.
 *
 * @returns {React.Element} - The rendered JSX element
 */
const RoutesComponent = () => {
  // Define your routes here
  const routes = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },

    // Secondary pages
    {
      path: "/support",
      element: <SupportPage />,
      children: [
        { index: true, element: <SupportPage /> },
        { path: "membership", element: <SupportPage /> },
        { path: "donate", element: <SupportPage /> },
        { path: "volunteer", element: <SupportPage /> },
        { path: "sponsorship", element: <SupportPage /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    // Don't match undefined subroutes
    {
      path: "support/:subroute/*",
      element: <NotFound />,
    },

    {
      path: "/membership",
      element: <Membership />,
    },

    // Protected routes
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [{ path: "test", element: <TestPage /> }],
    },

    // All other routes should show 404
    { path: "*", element: <NotFound /> },
  ]);

  return routes;
};

/**
 * App is responsible for managing and rendering the application routes.
 *
 * @returns {React.Element} - The rendered JSX element
 */
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <RoutesComponent />
      </Router>
    </AuthProvider>
  );
};

export default App;
