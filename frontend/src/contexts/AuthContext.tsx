import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginRequest, logout as logoutRequest, me, register as registerRequest } from '../api/auth';
import type { User } from '../types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem('orquestra_token');

    if (!token) {
      setLoading(false);
      return;
    }

    me()
      .then((currentUser) => {
        if (!ignore) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        localStorage.removeItem('orquestra_token');
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function login(payload: { email: string; password: string }) {
    const response = await loginRequest({ ...payload, device_name: 'react-web' });
    localStorage.setItem('orquestra_token', response.data.token);
    setUser(response.data.user);
  }

  async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await registerRequest(payload);
    localStorage.setItem('orquestra_token', response.data.token);
    setUser(response.data.user);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      localStorage.removeItem('orquestra_token');
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}