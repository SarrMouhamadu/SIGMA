import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set auth token header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const res = await axios.get('http://localhost:5000/api/auth/profile');
          
          setUser(res.data.user);
        }
      } catch (error) {
        // Clear token if invalid
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue lors de la connexion'
      };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      };
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', userData);
      
      setUser(res.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
