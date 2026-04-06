import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginRequest, logout as logoutRequest, me, register as registerRequest } from '../api/auth';
import { authStorage } from '../api/axios';
import type { User } from '../types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const token = authStorage.getToken();

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
        authStorage.clearToken();
        if (!ignore) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    const handleUnauthorized = () => {
      authStorage.clearToken();
      setUser(null);
    };

    window.addEventListener('orquestra:unauthorized', handleUnauthorized);

    return () => {
      ignore = true;
      window.removeEventListener('orquestra:unauthorized', handleUnauthorized);
    };
  }, []);

  async function login(payload: { email: string; password: string }) {
    const response = await loginRequest({
      ...payload,
      device_name: 'react-web',
    });

    authStorage.setToken(response.data.token);
    setUser(response.data.user);
  }

  async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await registerRequest(payload);

    authStorage.setToken(response.data.token);
    setUser(response.data.user);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      authStorage.clearToken();
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