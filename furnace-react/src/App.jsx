import React from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  SupportPage,
  VisitPage,
  AboutPage,
  NotFound,
  TestPage,
  Membership,
  Accessibility,
  AdminDashboard
} from './pages';
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./features/authentication";
import { AdminOverview, AdminHours } from "./features/adminDashboard";
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
      path: "/visit",
      element: <VisitPage />,
      children: [
        { index: true, element: <VisitPage /> },
        { path: "hours", element: <VisitPage /> },
        { path: "tours", element: <VisitPage /> },
        { path: "accessibility", element: <VisitPage /> },
      ],
    },

    {
      path: "visit/:subroute/*",
      element: <NotFound />,
    },

    {
      path: "/about",
      element: <AboutPage />,
      children: [
        { index: true, element: <AboutPage /> },
        { path: "history", element: <AboutPage /> },
        { path: "holdings", element: <AboutPage /> },
        { path: "associates", element: <AboutPage /> },
        { path: "gallery", element: <AboutPage /> },
      ],
    },

    {
      path: "about/:subroute/*",
      element: <NotFound />,
    },

    // Tertiary pages containing more detailed information
    {
      path: "/membership",
      element: <Membership />,
    },

    {
      path: "/accessibility",
      element: <Accessibility />,
    },

    // Protected admin routes
    {
      path: "/admin",
      element: <ProtectedRoute />,
      children: [
        { 
          path: "", 
          element: <AdminDashboard />,
          children: [
            { index: true, element: <AdminOverview /> },
            { path: "hours", element: <AdminHours /> },
            // ... other admin sub-routes ...
          ]
        },
        // ... other protected routes ...
      ],
    },

    // Test route - Protected
    { path: "/test", element: <ProtectedRoute><TestPage /></ProtectedRoute> },

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
