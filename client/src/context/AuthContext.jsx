import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate active login status on refresh
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/verify');
        if (data.success) {
          setUser(data.user);
        } else {
          await forceLogoutCleanup();
        }
      } catch (err) {
        console.warn('Authentication validation failed:', err.message);
        await forceLogoutCleanup();
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe });
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error during login.';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error during registration.';
      return { success: false, message: msg };
    }
  };

  const enterAsGuest = async () => {
    try {
      const { data } = await api.post('/auth/guest-login');
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Guest access failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error during guest login.';
      return { success: false, message: msg };
    }
  };

  const initForgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request reset verification details.';
      return { success: false, message: msg };
    }
  };

  const completeResetPassword = async (email, token, newPassword) => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, token, newPassword });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete password reset.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Fail silently since credentials might already be expired
    }
    await forceLogoutCleanup();
  };

  const forceLogoutCleanup = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const registerDeviceToken = async (fcmToken) => {
    try {
      const { data } = await api.post('/auth/device-token', { token: fcmToken });
      return data.success;
    } catch (err) {
      console.error('FCM device registration error:', err.message);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      enterAsGuest, 
      forgotPassword: initForgotPassword, 
      resetPassword: completeResetPassword, 
      logout, 
      registerDeviceToken,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
