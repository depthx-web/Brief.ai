'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchMe,
  login as apiLogin,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
  deleteAccount as apiDeleteAccount,
  type AuthUser,
  type Segment,
} from './authApi';

const TOKEN_KEY = 'brief-ai-token';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, segment?: Segment) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; segment?: Segment }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    fetchMe(stored)
      .then((u) => {
        setUser(u);
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token: newToken, user: newUser } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function signup(email: string, password: string, name?: string, segment?: Segment) {
    const { token: newToken, user: newUser } = await apiSignup(email, password, name, segment);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function updateProfile(data: { name?: string; segment?: Segment }) {
    if (!token) return;
    setUser(await apiUpdateProfile(token, data));
  }

  async function deleteAccount() {
    if (!token) return;
    await apiDeleteAccount(token);
    logout();
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, signup, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
