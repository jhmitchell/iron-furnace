import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  SupportPage,
  VisitPage,
  AboutPage,
  HistoryPage,
  HistoryStoryPage,
  SiteMapPage,
  NotFound,
  TestPage,
  Accessibility,
  AssociatesPage,
  EventsPage,
  EventDetailsPage,
  QRPDF,
  UpcomingFeatures,
  UnderConstruction,
} from './pages';
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./features/authentication";
import { trackPageView } from "./features/stats";
import "./App.css";

// The admin dashboard is only used by site admins, so it is split into its own file
// that the browser downloads only when someone opens /admin.
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const adminPage = (name) =>
  lazy(() => import("./features/adminDashboard").then((module) => ({ default: module[name] })));
const AdminOverview = adminPage("AdminOverview");
const AdminOperatingHours = adminPage("AdminOperatingHours");
const AdminEvents = adminPage("AdminEvents");
const AdminSponsors = adminPage("AdminSponsors");
const AdminBoard = adminPage("AdminBoard");
const AdminBanner = adminPage("AdminBanner");
const AdminStats = adminPage("AdminStats");

const AdminLoading = () => (
  <p role="status" style={{ padding: "4rem 1rem", textAlign: "center" }}>
    Loading…
  </p>
);

/**
 * RoutesComponent is responsible for defining the routes. If a route
 * cannot be matched, the NotFound component is rendered.
 *
 * @returns {React.Element} - The rendered JSX element
 */
const RoutesComponent = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [location]);

  // Count the page view once the page has rendered (so the 404 page can mark itself)
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

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

    {
      path: "/events",
      element: <EventsPage />,
    },

    {
      path: "/shop",
      element: <UnderConstruction />,
    },

    // Tertiary pages containing more detailed information
    {
      path: "/history",
      element: <HistoryPage />,
    },

    // The new history story, previewed here until it replaces /history.
    {
      path: "/history2",
      element: <HistoryStoryPage />,
    },

    {
      path: "/membership",
      //element: <Membership />,
      element: <UnderConstruction />,
    },

    {
      path: "/donate",
      element: <UnderConstruction />,
    },

    {
      path: "/associates",
      element: <AssociatesPage />,
    },

    {
      path: "/map",
      element: <SiteMapPage />,
    },

    {
      path: "/accessibility",
      element: <Accessibility />,
    },

    {
      path: "/new-website-announcement",
      element: <UpcomingFeatures />,
    },

    // Protected admin routes
    {
      path: "/admin",
      element: <ProtectedRoute />,
      children: [
        { 
          path: "", 
          element: (
            <Suspense fallback={<AdminLoading />}>
              <AdminDashboard />
            </Suspense>
          ),
          children: [
            { index: true, element: <AdminOverview /> },
            { path: "hours", element: <AdminOperatingHours /> },
            { path: "events", element: <AdminEvents /> },
            { path: "sponsors", element: <AdminSponsors /> },
            { path: "board", element: <AdminBoard /> },
            { path: "banner", element: <AdminBanner /> },
            { path: "stats", element: <AdminStats /> },
          ]
        },
        // ... other protected routes ...
      ],
    },

    // PDF routes
    { path: "/events/:id", element: <EventDetailsPage /> },
    { path: "/signs/:name", element: <QRPDF /> },

    // Test route - Protected
    { path: "/test", element: <ProtectedRoute><TestPage /></ProtectedRoute> },

    // Ignore /api and /auth routes
    { path: "/api/*", element: null },
    { path: "/auth/*", element: null },

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
