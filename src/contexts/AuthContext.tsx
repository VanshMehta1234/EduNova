import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type AuthTokens, type UserProfile } from '../api/auth';
import { STORAGE_KEYS } from '../constants/storage';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (tokens: AuthTokens, user?: UserProfile) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const persistTokens = (tokens: AuthTokens) => {
    if (tokens.access) {
      setAccessToken(tokens.access);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
    }
    if (tokens.refresh) {
      setRefreshToken(tokens.refresh);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    }
  };

  const loadCurrentUser = useCallback(async () => {
      try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      } catch (error) {
      console.error('Failed to load current user:', error);
      clearSession();
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const storedAccess = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedAccess) {
        setAccessToken(storedAccess);
      }
      if (storedRefresh) {
        setRefreshToken(storedRefresh);
      }

      if (storedAccess) {
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as UserProfile;
            setUser(parsed);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem(STORAGE_KEYS.USER);
            await loadCurrentUser();
          }
        } else {
          await loadCurrentUser();
        }
      } else {
        clearSession();
      }

      setIsInitializing(false);
    };

    initialize();
  }, [loadCurrentUser]);

  const login = async (tokens: AuthTokens, userFromResponse?: UserProfile) => {
    persistTokens(tokens);

    if (userFromResponse) {
      setUser(userFromResponse);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromResponse));
    }

    // Always refresh user from backend to ensure context is accurate
    await loadCurrentUser();
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken && !!user,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

