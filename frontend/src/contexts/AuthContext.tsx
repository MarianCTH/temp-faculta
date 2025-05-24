import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface User {
  id: number;
  email: string;
  two_factor_enabled: boolean;
}

interface LoginResponse {
  user?: User;
  token?: string;
  requiresTwoFactor?: boolean;
  userId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (twoFactorCode: string) => Promise<void>;
  verifyLogin2FA: (userId: number, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch user profile if token exists on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
          } else {
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          setUser(null);
          setToken(null);
        }
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    if (data.requiresTwoFactor) {
      return data;
    }

    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const setup2FA = async () => {
    const response = await fetch(`${API_URL}/auth/setup-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  };

  const verify2FA = async (twoFactorCode: string) => {
    const response = await fetch(`${API_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token: twoFactorCode }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // Fetch updated user profile
    if (token) {
      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (meRes.ok) setUser(meData.user);
    }
  };

  const verifyLogin2FA = async (userId: number, token: string) => {
    const response = await fetch(`${API_URL}/auth/verify-login-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    setUser(data.user);
    setToken(data.token);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      setup2FA,
      verify2FA,
      verifyLogin2FA,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 