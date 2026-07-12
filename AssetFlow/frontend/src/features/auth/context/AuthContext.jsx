import React, { createContext, useState, useEffect } from 'react';
import { getProfile, login as loginRequest, register as registerRequest } from '../api/authApi';

export const AuthContext = createContext();

const DEMO_TOKEN = 'assetflow-demo-token';
const DEMO_USER_KEY = 'assetflow-demo-user';

const getDemoUser = (email = 'demo@assetflow.local', role = 'employee', department = '') => ({
  id: 'demo-user',
  name: email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Demo User',
  email,
  role,
  department: department ? { id: `demo-${department.toLowerCase().replace(/\s+/g, '-')}`, name: department } : null,
});

const isNetworkError = (error) => error?.isNetworkError || error?.code === 'ERR_NETWORK' || !error?.response;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedDemoUser = localStorage.getItem(DEMO_USER_KEY);

      if (token === DEMO_TOKEN && storedDemoUser) {
        try {
          setUser(JSON.parse(storedDemoUser));
        } catch {
          const demoUser = getDemoUser();
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
          setUser(demoUser);
        }
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const res = await getProfile();
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load profile', error);
          localStorage.removeItem('token');
          localStorage.removeItem(DEMO_USER_KEY);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await loginRequest(credentials);
      localStorage.setItem('token', data.token);
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(data.user);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        const demoUser = getDemoUser(credentials.email);
        localStorage.setItem('token', DEMO_TOKEN);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return { token: DEMO_TOKEN, user: demoUser, demo: true };
      }

      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const data = await registerRequest(userData);

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.removeItem(DEMO_USER_KEY);
      } else {
        localStorage.setItem('token', DEMO_TOKEN);
      }

      const user = data?.user || data;
      setUser(user);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        const demoUser = getDemoUser(userData.email, userData.role || 'employee', userData.department || '');
        localStorage.setItem('token', DEMO_TOKEN);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return { token: DEMO_TOKEN, user: demoUser, demo: true };
      }

      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
