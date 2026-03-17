export interface Segment {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker_id: string;
  audio_path?: string;
  trackId: string;
  name: string;
}

export interface VideoClip {
  id: string;
  start: number;
  end: number;
  source_offset: number;
  trackId: string;
  name: string;
}

export interface Track {
  id: string;
  type: 'video' | 'audio';
  name: string;
}

export interface Project {
  id: string;
  name: string;
  video_path?: string;
  segments: Segment[];
  video_clips: VideoClip[];
  tracks: Track[];
  status: 'idle' | 'downloading' | 'processing' | 'done' | 'error';
  progress: number;
}

export interface Speaker {
  id: string;
  name: string;
}
