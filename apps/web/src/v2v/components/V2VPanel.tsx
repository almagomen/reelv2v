import React, { useEffect, useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Youtube, 
  Play, 
  Terminal
} from 'lucide-react';
import { useV2VProjectStore } from '../stores/v2v-project-store';
import { IconButton, Input, ScrollArea } from '@openreel/ui';
import { PipelinePanel } from './PipelinePanel';
import { SpeakerPanel } from './SpeakerPanel';

export const V2VPanel: React.FC = () => {
  const { 
    projects, 
    currentProject, 
    fetchProjects, 
    selectProject, 
    createProject, 
    deleteProject,
    processYoutube,
    logs,
    isLoading 
  } = useV2VProjectStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName);
      setNewProjectName('');
    }
  };

  const handleProcessYoutube = () => {
    if (youtubeUrl.trim() && currentProject) {
      processYoutube(youtubeUrl, {
        source_lang: 'es',
        target_lang: 'en',
        whisper_model: 'large-v3'
      });
      setYoutubeUrl('');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Nuevo proyecto..." 
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1 bg-background-tertiary text-xs h-9"
          />
          <IconButton icon={Plus} onClick={handleCreateProject} title="Crear" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5 pb-4 space-y-2">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => selectProject(project.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                currentProject?.id === project.id 
                ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                : 'bg-background-tertiary border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium ${currentProject?.id === project.id ? 'text-primary' : 'text-text-primary'}`}>
                  {project.name}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                  className="text-text-muted hover:text-red-400 p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">
                {project.status} - {Math.round(project.progress * 100)}%
              </div>
            </div>
          ))}
          {projects.length === 0 && !isLoading && (
            <div className="text-center py-10 text-text-muted text-xs">
              No hay proyectos creados.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pipeline Config & Logs */}
      {currentProject && (
        <div className="p-5 border-t border-border bg-background-tertiary/50 space-y-6">
          <PipelinePanel />
          <SpeakerPanel />

          <div>
            <h3 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2 uppercase tracking-widest">
              <Youtube size={14} className="text-red-500" />
              Descarga de YouTube
            </h3>
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="URL de YouTube..." 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 bg-background-secondary text-[10px] h-8"
              />
              <IconButton icon={Play} onClick={handleProcessYoutube} title="Procesar" className="bg-primary/20 text-primary" />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-[10px] font-bold text-text-muted mb-2 flex items-center gap-2 uppercase tracking-widest">
              <Terminal size={12} />
              Consola de Logs
            </h3>
            <div className="bg-black/40 rounded border border-border p-2 h-32 overflow-hidden flex flex-col-reverse">
              <div className="font-mono text-[9px] text-green-500/80 leading-tight">
                {logs.length > 0 ? (
                  logs.slice().reverse().map((log, i) => (
                    <div key={i} className="mb-1">{`> ${log}`}</div>
                  ))
                ) : (
                  <div className="text-text-muted italic opacity-50">Esperando eventos...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
