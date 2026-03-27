import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { login as apiLogin, register as apiRegister } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        // Set default auth header for all API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.log('✅ Auth header set on startup');
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await apiLogin({ username, password });
      console.log('✅ Login response:', response.data);
      
      const { access, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header for all future API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setToken(access);
      setUser(user);
      
      toast.success(`Welcome back, ${user.username || username}! 🎉`);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await apiRegister(userData);
      console.log('✅ Registration response:', response.data);
      
      const { access, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header for all future API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setToken(access);
      setUser(user);
      
      toast.success('Account created successfully! Welcome aboard! 🎉');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear state
    setToken(null);
    setUser(null);
    
    toast.success('Logged out successfully 👋');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};