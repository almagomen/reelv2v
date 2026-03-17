import { apiClient } from './client';
import type { Segment } from '../types';

export const segmentsApi = {
  update: (id: string, changes: Partial<Segment>) => 
    apiClient.patch<Segment>(`/segments/${id}`, changes).then(res => res.data),
  
  delete: (id: string) => apiClient.delete(`/segments/${id}`).then(res => res.data),
  
  split: (id: string, atTime: number) => 
    apiClient.post<Segment[]>(`/segments/${id}/split`, { at_time: atTime }).then(res => res.data),
    
  regenerateAudio: (id: string) => 
    apiClient.post(`/segments/${id}/regenerate`).then(res => res.data),
};
