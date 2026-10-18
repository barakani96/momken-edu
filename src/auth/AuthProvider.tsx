import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, UserRole } from './auth.types';
import { mockUser } from './auth.mock';

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  login: (userOverride?: User) => void;
  logout: () => void;
  tokenExpiresAt: number | null;
  extendSession: (additionalMinutes?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SESSION_MINUTES = 15;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // Fallback
      }
    }
    return mockUser;
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const storedRole = localStorage.getItem('active_role') as UserRole;
    if (
      storedRole === 'admin' ||
      storedRole === 'sis' ||
      storedRole === 'instructor' ||
      storedRole === 'student' ||
      storedRole === 'guardian'
    ) {
      return storedRole;
    }
    const path = window.location.pathname;
    if (path.startsWith('/sis') || path.startsWith('/students')) return 'sis';
    if (path.startsWith('/student')) return 'student';
    if (path.startsWith('/instructor')) return 'instructor';
    if (path.startsWith('/guardian')) return 'guardian';
    return 'admin';
  });

  const setActiveRole = useCallback((role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem('active_role', role);
  }, []);

  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(() => {
    const storedExpiry = localStorage.getItem('auth_token_expires_at');
    if (storedExpiry) {
      const exp = parseInt(storedExpiry, 10);
      if (exp > Date.now()) return exp;
    }
    return Date.now() + DEFAULT_SESSION_MINUTES * 60 * 1000;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
      if (!localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', 'mock-admin-jwt-token-educore-2026');
      }
    } else {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_expires_at');
    }
  }, [currentUser]);

  const login = useCallback((userOverride?: User) => {
    const user = userOverride || mockUser;
    const expires = Date.now() + DEFAULT_SESSION_MINUTES * 60 * 1000;
    setCurrentUser(user);
    setTokenExpiresAt(expires);
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'mock-admin-jwt-token-educore-2026');
    localStorage.setItem('auth_token_expires_at', expires.toString());
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setTokenExpiresAt(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expires_at');
    localStorage.removeItem('active_role');
  }, []);

  const extendSession = useCallback((additionalMinutes = DEFAULT_SESSION_MINUTES) => {
    const newExpiry = Date.now() + additionalMinutes * 60 * 1000;
    setTokenExpiresAt(newExpiry);
    localStorage.setItem('auth_token_expires_at', newExpiry.toString());
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    activeRole,
    setActiveRole,
    login,
    logout,
    tokenExpiresAt,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
