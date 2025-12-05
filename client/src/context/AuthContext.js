import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AuthProvider iniciando...');
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('Token no localStorage:', token ? 'Presente' : 'Ausente');
    console.log('User no localStorage:', userData ? 'Presente' : 'Ausente');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Usuário restaurado:', parsedUser.email);
        setUser(parsedUser);
        authService.setAuthToken(token);
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
        logout();
      }
    } else {
      console.log('Sem token ou usuário no localStorage');
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Tentando login para:', email);
    try {
      setError('');
      const response = await authService.login(email, password);
      console.log('Login bem-sucedido:', response.data.user.email);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      authService.setAuthToken(response.data.token);
      
      console.log('Token salvo no localStorage');
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao fazer login';
      console.error('Erro no login:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      const response = await authService.register(userData);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      authService.setAuthToken(response.token);
      
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao registrar';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    authService.setAuthToken(null);
    setError('');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      }
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        authService.setAuthToken(response.token);
      }
      
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar perfil';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isAuthenticated: !!user,
    clearError: () => setError('')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};