import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Signup from './pages/Signup';
import NotFound from './components/NotFound';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const location = useLocation();

  useEffect(() => {
    if (['/', '/signin', '/signup'].includes(location.pathname)) {
      localStorage.removeItem('token');
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<Signup />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
