import React from 'react';
import { Navigate } from 'react-router-dom';

function RequireAuth({ children, isAuthenticated }) {

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;