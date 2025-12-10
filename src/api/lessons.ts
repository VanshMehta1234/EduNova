import { apiClient } from './client';

export interface LessonInput {
  topic: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
}

export interface LessonContent extends LessonInput {
  description: string;
  activities: string[];
  questions: string[];
  summary: string;
  image_urls: string[];
  video_links: { title: string; url: string }[];
}

export interface LessonCreatePayload extends LessonContent {
  is_public?: boolean;
}

export interface LessonResponse extends LessonContent {
  id: number;
  slug: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  creator_email?: string; // for public listing
}

export const lessonsApi = {
  list(search?: string): Promise<LessonResponse[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    // Ensure proper URL format: /lessons/ with trailing slash, params before slash
    const url = params ? `/lessons/${params}` : '/lessons/';
    return apiClient.get<LessonResponse[]>(url);
  },

  retrieve(id: number | string): Promise<LessonResponse> {
    return apiClient.get<LessonResponse>(`/lessons/${id}/`);
  },

  retrievePublic(slug: string): Promise<LessonResponse> {
    return apiClient.get<LessonResponse>(`/lessons/public/${slug}/`);
  },

  listPublic(search?: string): Promise<LessonResponse[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<LessonResponse[]>(`/lessons/public/${params}`);
  },

  generate(payload: LessonInput): Promise<LessonContent> {
    return apiClient.post<LessonContent>('/lessons/generate/', payload);
  },

  create(payload: LessonCreatePayload): Promise<LessonResponse> {
    return apiClient.post<LessonResponse>('/lessons/', payload);
  },

  update(id: number | string, payload: Partial<LessonCreatePayload>): Promise<LessonResponse> {
    return apiClient.patch<LessonResponse>(`/lessons/${id}/`, payload);
  },

  delete(id: number | string): Promise<void> {
    return apiClient.delete<void>(`/lessons/${id}/`);
  },

  async toggleVisibility(id: number | string): Promise<LessonResponse> {
    const data = await apiClient.patch<any>(`/lessons/${id}/visibility/`, {});
    // Backend returns { message, lesson }; fall back to data if shape differs.
    return (data?.lesson as LessonResponse) ?? (data as LessonResponse);
  },

  async downloadPdf(id: number | string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/lessons/${id}/pdf/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      let message = 'Failed to download PDF';
      try {
        const err = await response.json();
        message = err.detail || err.error || message;
      } catch {
        message = `Failed to download PDF (HTTP ${response.status})`;
      }
      throw new Error(message);
    }
    return response.blob();
  },
};


