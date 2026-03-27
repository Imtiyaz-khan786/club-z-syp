import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole) {
    // Admin can access everything
    if (user?.role === 'admin') {
      return children;
    }
    
    // Check if user has the required role
    if (user?.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Authenticated and passes all checks
  return children;
};

export default PrivateRoute;