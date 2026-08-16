'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchMe,
  login as apiLogin,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  changeEmail as apiChangeEmail,
  deleteAccount as apiDeleteAccount,
  type AuthUser,
  type Segment,
} from './authApi';
import { getStoredReferralCode } from '@/components/ReferralCapture';

const TOKEN_KEY = 'brief-ai-token';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (newToken: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, segment?: Segment) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; segment?: Segment }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
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

  async function loginWithToken(newToken: string) {
    const authedUser = await fetchMe(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(authedUser);
  }

  async function signup(email: string, password: string, name?: string, segment?: Segment) {
    const { token: newToken, user: newUser } = await apiSignup(email, password, name, segment, getStoredReferralCode());
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

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!token) return;
    await apiChangePassword(token, currentPassword, newPassword);
  }

  async function changeEmail(newEmail: string, currentPassword: string) {
    if (!token) return;
    setUser(await apiChangeEmail(token, newEmail, currentPassword));
  }

  async function deleteAccount() {
    if (!token) return;
    await apiDeleteAccount(token);
    logout();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithToken,
        signup,
        logout,
        updateProfile,
        changePassword,
        changeEmail,
        deleteAccount,
      }}
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
