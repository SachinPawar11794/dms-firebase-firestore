import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from './services/authService';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Productions from './pages/Productions';
import Employees from './pages/Employees';
import Maintenance from './pages/Maintenance';
import Users from './pages/Users';
import Plants from './pages/Plants';
import Layout from './components/Layout';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { PlantProvider } from './contexts/PlantContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let previousUser: User | null = null;
    
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      // If user logged out (previous user existed but current is null)
      if (previousUser && !currentUser) {
        // Cancel all ongoing queries
        queryClient.cancelQueries();
        // Clear all React Query cache on logout
        queryClient.clear();
        // Remove all query observers
        queryClient.removeQueries();
        // Clear localStorage items
        localStorage.removeItem('dms_selected_plant');
        console.log('✅ Cache cleared on logout');
      }
      
      // If user changed (different user logged in)
      if (previousUser && currentUser && previousUser.uid !== currentUser.uid) {
        // Cancel all ongoing queries
        queryClient.cancelQueries();
        // Clear cache when switching users
        queryClient.clear();
        // Remove all query observers
        queryClient.removeQueries();
        localStorage.removeItem('dms_selected_plant');
        console.log('✅ Cache cleared on user switch');
      }
      
      previousUser = currentUser;
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <PlantProvider>
        <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={user ? <Navigate to="/dashboard" /> : <ResetPassword />}
        />
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<ErrorBoundary moduleName="Dashboard"><Dashboard /></ErrorBoundary>} />
          <Route path="tasks" element={<ErrorBoundary moduleName="Tasks"><Tasks /></ErrorBoundary>} />
          <Route path="productions" element={<ErrorBoundary moduleName="Productions"><Productions /></ErrorBoundary>} />
          <Route path="employees" element={<ErrorBoundary moduleName="Employees"><Employees /></ErrorBoundary>} />
          <Route path="maintenance" element={<ErrorBoundary moduleName="Maintenance"><Maintenance /></ErrorBoundary>} />
          <Route
            path="users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="plants"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Plants />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      </PlantProvider>
    </BrowserRouter>
  );
}

export default App;
