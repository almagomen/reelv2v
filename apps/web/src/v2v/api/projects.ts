import { apiClient } from './client';
import type { Project } from '../types';

export const projectsApi = {
  list: () => apiClient.get<Project[]>('/projects').then(res => res.data),
  get: (id: string) => apiClient.get<Project>(`/projects/${id}`).then(res => res.data),
  create: (name: string) => apiClient.post<Project>('/projects', { name }).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`).then(res => res.data),
  
  processYoutube: (id: string, url: string, params: any) => 
    apiClient.post(`/projects/${id}/youtube`, { url, ...params }).then(res => res.data),
  
  export: (id: string, data: { segments: any[], video_clips: any[] }) => 
    apiClient.post<{ output_url: string }>(`/projects/${id}/export`, data).then(res => res.data),
};
