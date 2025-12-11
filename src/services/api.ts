import { STORAGE_KEYS } from '../constants/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

const buildHeaders = (token?: string, extraHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

async function request<T>(
  endpoint: string,
  { method = 'GET', body, headers }: { method?: HttpMethod; body?: unknown; headers?: HeadersInit } = {}
): Promise<T> {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || undefined;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: buildHeaders(token, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    let errorData: any = null;
    try {
      errorData = await response.json();
      // Handle Django REST Framework validation errors
      if (errorData.email || errorData.password || errorData.username || errorData.full_name) {
        // Extract field-specific errors
        const fieldErrors: string[] = [];
        if (errorData.email) {
          fieldErrors.push(...(Array.isArray(errorData.email) ? errorData.email : [errorData.email]));
        }
        if (errorData.password) {
          fieldErrors.push(...(Array.isArray(errorData.password) ? errorData.password : [errorData.password]));
        }
        if (errorData.username) {
          fieldErrors.push(...(Array.isArray(errorData.username) ? errorData.username : [errorData.username]));
        }
        if (errorData.full_name) {
          fieldErrors.push(...(Array.isArray(errorData.full_name) ? errorData.full_name : [errorData.full_name]));
        }
        errorMessage = fieldErrors.join('. ') || errorMessage;
      } else {
        // Handle other error formats
        errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    const error = new Error(errorMessage);
    (error as any).data = errorData;
    throw error;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response as unknown as T;
}

export const apiClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },
  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body });
  },
  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body });
  },
  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body });
  },
  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
};


