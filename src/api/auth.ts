import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    profile: {
      full_name: string;
    };
  };
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login/', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register/', data);
  },

  async getCurrentUser() {
    return apiClient.get('/auth/me/');
  },
};

