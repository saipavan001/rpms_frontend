import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchCurrentUser,
  logoutApi,
} from '../../modules/auth/services/auth.service';
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
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Clear client state even if server logout fails
    } finally {
      setUserState(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await fetchCurrentUser();
    setUser(profile);
  }, [setUser]);

  useEffect(() => {
    const init = async () => {
      try {
        await refreshUser();
      } catch {
        setUserState(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [refreshUser]);

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
