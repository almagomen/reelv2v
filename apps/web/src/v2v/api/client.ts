import axios from 'axios';

const API_BASE_URL = 'http://localhost:7860';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const mediaUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/media/${path}`;
};
