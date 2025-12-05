import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('ProtectedRoute verificado:', {
    path: window.location.pathname,
    user: user?.email,
    isAuthenticated,
    loading,
    requireAdmin
  });

  if (loading) {
    console.log('ProtectedRoute: Carregando...');
    return <div className="loading">Verificando autenticação...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Não autenticado, redirecionando para login');
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    console.log('ProtectedRoute: Não é admin, redirecionando para home');
    return <Navigate to="/" />;
  }

  console.log('ProtectedRoute: Acesso permitido');
  return children;
};

export default ProtectedRoute;