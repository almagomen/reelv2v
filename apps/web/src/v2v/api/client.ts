import axios from 'axios';

const API_BASE_URL = window.location.origin;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const mediaUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  // Usar ruta relativa para que pase por el proxy de Vite
  return `/media/${path}`;
};
