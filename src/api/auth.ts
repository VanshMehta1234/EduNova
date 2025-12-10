import { apiClient } from './client';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile: {
    full_name: string;
  };
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: Required<AuthTokens>;
  message: string;
}

const withUsername = (email: string) => ({
  username: email,
  email,
});

export const authApi = {
  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    // Backend expects username; use email as username for login.
    return apiClient.post<AuthResponse>('/auth/login/', {
      username: email,
      password,
    });
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const payload = {
      ...withUsername(data.email),
      password: data.password,
      full_name: data.full_name,
    };
    return apiClient.post<AuthResponse>('/auth/register/', payload);
  },

  async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/auth/me/');
  },
};

