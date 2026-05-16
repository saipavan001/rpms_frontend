import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { fetchCurrentUser } from '../../modules/auth/services/auth.service';
import {
  canAccessErpModules,
  canManageUsers,
  canWrite,
  isEmployeePortalUser,
  type AuthUser,
} from '../auth/permissions';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  canWrite: boolean;
  canManageUsers: boolean;
  canAccessErpModules: boolean;
  isEmployeePortalUser: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_USER_KEY = 'authUser';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    if (next) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem(AUTH_USER_KEY);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      return;
    }

    const profile = await fetchCurrentUser();
    setUser(profile);
  }, [setUser]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [logout, refreshUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      canWrite: user ? canWrite(user.roles) : false,
      canManageUsers: user ? canManageUsers(user.roles) : false,
      canAccessErpModules: user ? canAccessErpModules(user.roles) : false,
      isEmployeePortalUser: user ? isEmployeePortalUser(user.roles) : false,
      refreshUser,
      setUser,
      logout,
    }),
    [user, loading, refreshUser, setUser, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
