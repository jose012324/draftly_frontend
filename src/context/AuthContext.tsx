import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { UNAUTHORIZED_EVENT, tokenStorage } from '../services/api';
import { authService } from '../services/authService';
import type { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextValue {
  /** The signed in user, or null when nobody is signed in. */
  user: User | null;
  isAuthenticated: boolean;
  /** True while the stored token is being validated on first render. */
  isBootstrapping: boolean;
  /** Signs in and returns the user that signed in. */
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { push } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const userRef = useRef<User | null>(null);
  userRef.current = user;

  /* Restore an existing session on first load. ------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStorage.get()) {
        if (!cancelled) setIsBootstrapping(false);
        return;
      }

      try {
        const currentUser = await authService.me();
        if (!cancelled) setUser(currentUser);
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  /* The API client broadcasts this event when the server answers 401. --- */
  useEffect(() => {
    function handleUnauthorized() {
      // Only mention it when there was a session in the first place — a
      // stale token on the login page should stay silent.
      const wasSignedIn = Boolean(userRef.current);
      setUser(null);

      if (wasSignedIn) {
        push('Your session has expired — please sign in again.', 'info');
      }
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [push]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: signedInUser } = await authService.login(email, password);
    setUser(signedInUser);
    return signedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await authService.me());
    } catch {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      refreshUser,
    }),
    [user, isBootstrapping, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the current session. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}
