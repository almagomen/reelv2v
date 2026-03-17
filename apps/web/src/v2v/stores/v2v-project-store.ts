import { create } from 'zustand';
import axios from 'axios';
import { projectsApi } from '../api/projects';
import { mediaUrl } from '../api/client';
import type { Project } from '../types';
import { useProjectStore } from '../../stores/project-store';

interface V2VProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  logs: string[];
  
  // Actions
  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  createProject: (name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Sync with OpenReel
  syncToOpenReel: () => Promise<void>;
  
  // Processing
  processYoutube: (url: string, params: any) => Promise<void>;
  exportProject: () => Promise<string | null>;
  addLog: (log: string) => void;
  clearLogs: () => void;
}

export const useV2VProjectStore = create<V2VProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  logs: [],

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await projectsApi.list();
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch projects', error);
      set({ isLoading: false });
    }
  },

  selectProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const project = await projectsApi.get(id);
      set({ currentProject: project });
      await get().syncToOpenReel();
    } catch (error) {
      console.error('Failed to select project', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (name: string) => {
    try {
      const newProject = await projectsApi.create(name);
      set((state) => ({ projects: [...state.projects, newProject] }));
    } catch (error) {
      console.error('Failed to create project', error);
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectsApi.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  },

  syncToOpenReel: async () => {
    const { currentProject } = get();
    if (!currentProject) return;

    const { createNewProject, importMedia, addTrack, addClip } = useProjectStore.getState();
    
    // 1. Inicializar un proyecto limpio en OpenReel
    createNewProject(currentProject.name);

    try {
      const trackMapping: Record<string, string> = {};

      // 2. Crear las pistas correspondientes
      for (const v2vTrack of currentProject.tracks) {
        const result = await addTrack(v2vTrack.type === 'video' ? 'video' : 'audio');
        if (result.success && result.actionId) {
          trackMapping[v2vTrack.id] = result.actionId;
        }
      }

      // Si no hay tracks (caso raro), crear uno por defecto
      if (Object.keys(trackMapping).length === 0) {
        const result = await addTrack('audio');
        if (result.success && result.actionId) {
          trackMapping['default'] = result.actionId;
        }
      }

      // 3. Importar video original si existe
      if (currentProject.video_path) {
        try {
          const url = mediaUrl(currentProject.video_path);
          const response = await axios.get(url, { responseType: 'blob' });
          const file = new File([response.data], 'original_video.mp4', { type: 'video/mp4' });
          const importResult = await importMedia(file);
          
          if (importResult.success && importResult.actionId) {
            // Buscar una pista de video para poner el clip original
            const videoTrackId = Object.values(trackMapping).find(id => {
              const track = useProjectStore.getState().getTrack(id);
              return track?.type === 'video';
            });
            
            if (videoTrackId) {
              await addClip(videoTrackId, importResult.actionId, 0);
            }
          }
        } catch (e) {
          console.error('Error importando video original:', e);
        }
      }

      // 4. Importar segmentos de audio secuencialmente
      for (const segment of currentProject.segments) {
        if (!segment.audio_path) continue;
        
        try {
          const url = mediaUrl(segment.audio_path);
          const response = await axios.get(url, { responseType: 'blob' });
          const file = new File([response.data], `seg_${segment.id}.mp3`, { type: 'audio/mpeg' });
          
          const importResult = await importMedia(file);
          if (importResult.success && importResult.actionId) {
            const openReelTrackId = trackMapping[segment.trackId] || Object.values(trackMapping)[0];
            if (openReelTrackId) {
              await addClip(openReelTrackId, importResult.actionId, segment.start);
            }
          }
        } catch (e) {
          console.error(`Error sincronizando segmento ${segment.id}:`, e);
        }
      }
    } catch (error) {
      console.error('Error en la sincronización con OpenReel:', error);
    }
  },

  processYoutube: async (url: string, params: any) => {
    const { currentProject } = get();
    if (!currentProject) return;
    try {
      await projectsApi.processYoutube(currentProject.id, url, params);
      // El progreso vendrá por WS
    } catch (error) {
      console.error('Failed to start youtube processing', error);
    }
  },

  exportProject: async () => {
    const { currentProject } = get();
    if (!currentProject) return null;

    const { project } = useProjectStore.getState();
    
    const v2vSegments: any[] = [];
    const v2vVideoClips: any[] = [];

    // Recorrer pistas y clips de OpenReel
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (track.type === 'video') {
          v2vVideoClips.push({
            id: clip.id,
            start: clip.startTime,
            end: clip.startTime + clip.duration,
            source_offset: clip.sourceStartTime || 0
          });
        } else if (track.type === 'audio') {
          const media = project.mediaLibrary.items.find(m => m.id === clip.mediaId);
          if (media && media.name.startsWith('seg_')) {
            const segmentId = media.name.replace('seg_', '').replace('.mp3', '');
            v2vSegments.push({
              id: segmentId,
              start: clip.startTime,
              end: clip.startTime + clip.duration,
              text: '', // El backend ya tiene el texto
              speaker_id: '' // El backend ya tiene el speaker
            });
          }
        }
      }
    }

    try {
      const result = await projectsApi.export(currentProject.id, {
        segments: v2vSegments,
        video_clips: v2vVideoClips
      });
      return result.output_url;
    } catch (error) {
      console.error('Failed to export project', error);
      return null;
    }
  },

  addLog: (log: string) => set((state) => ({ logs: [...state.logs, log].slice(-100) })),
  clearLogs: () => set({ logs: [] }),
}));

