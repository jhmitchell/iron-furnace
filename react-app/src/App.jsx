import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './features/authentication';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import LoginPage from './pages/LoginPage';
import SupportPage from './pages/SupportPage';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/test" element={<TestPage />} />
            {/* More protected routes can be nested here */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
