import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nimos_token') || sessionStorage.getItem('nimos_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: get token from whichever storage has it
  const getStoredToken = useCallback(() => {
    return localStorage.getItem('nimos_token') || sessionStorage.getItem('nimos_token');
  }, []);

  // Helper: clear token from both storages
  const clearStoredToken = useCallback(() => {
    localStorage.removeItem('nimos_token');
    sessionStorage.removeItem('nimos_token');
  }, []);

  // Helper: make authenticated requests
  const authFetch = useCallback(async (url, options = {}) => {
    const currentToken = getStoredToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      ...options.headers,
    };
    let res;
    try {
      res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } catch {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (!res.ok) {
      // Clear auth state on 401
      if (res.status === 401) {
        clearStoredToken();
        setToken(null);
        setUser(null);
      }
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || body.error || `Request failed (${res.status})`);
    }
    return res.json();
  }, [getStoredToken, clearStoredToken]);

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const stored = getStoredToken();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const data = await authFetch('/auth/me');
        setUser(data.user || data);
        setToken(stored);
      } catch {
        // Token invalid or expired — clear it
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [authFetch]);

  const login = async (email, password, rememberMe = true) => {
    setError(null);
    try {
      const data = await authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      clearStoredToken();
      if (rememberMe) {
        localStorage.setItem('nimos_token', data.token);
      } else {
        sessionStorage.setItem('nimos_token', data.token);
      }
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, phone, password) => {
    setError(null);
    try {
      const data = await authFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password }),
      });
      localStorage.setItem('nimos_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = async (data) => {
    setError(null);
    try {
      const updated = await authFetch('/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setUser(updated.user || updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    authFetch,
    clearError,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
