'use client';

import { useAuth } from '@/lib/AuthContext';

export default function HeaderAuthLinks() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <a href="/login" className="text-sm font-medium text-navy hover:text-emerald transition-colors">
          Log in
        </a>
        <a href="/signup" className="text-sm font-medium text-navy hover:text-emerald transition-colors">
          Sign up
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <a href="/library" className="text-sm font-medium text-navy hover:text-emerald transition-colors">
        My Library
      </a>
      <span className="text-sm text-gray-400">{user.email}</span>
      <button onClick={logout} className="text-sm font-medium text-navy hover:text-emerald transition-colors">
        Log out
      </button>
    </div>
  );
}
