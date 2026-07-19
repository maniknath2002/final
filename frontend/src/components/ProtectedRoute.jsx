import React from 'react';
import { Navigate } from 'react-router-dom';

// Wraps a page and redirects to /login if not authenticated,
// or blocks access if the user's role isn't in allowedRoles.
export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
