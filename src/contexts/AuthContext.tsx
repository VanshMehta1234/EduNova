import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi, type AuthTokens, type UserProfile } from '../api/auth';

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

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const persistTokens = (tokens: AuthTokens) => {
    if (tokens.access) {
      setAccessToken(tokens.access);
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    }
    if (tokens.refresh) {
      setRefreshToken(tokens.refresh);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    }
  };

  const loadCurrentUser = useCallback(async () => {
      try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch (error) {
      console.error('Failed to load current user:', error);
      clearSession();
    }
  }, []);

  const initialize = useCallback(async () => {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

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
          localStorage.removeItem(USER_KEY);
          await loadCurrentUser();
        }
      } else {
        await loadCurrentUser();
      }
    } else {
      clearSession();
    }

    setIsInitializing(false);
  }, [loadCurrentUser]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = async (tokens: AuthTokens, userFromResponse?: UserProfile) => {
    persistTokens(tokens);

    if (userFromResponse) {
      setUser(userFromResponse);
      localStorage.setItem(USER_KEY, JSON.stringify(userFromResponse));
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

