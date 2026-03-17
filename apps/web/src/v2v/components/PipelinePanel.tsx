import React, { useState } from 'react';
import { Settings, BrainCircuit } from 'lucide-react';
import { useV2VProjectStore } from '../stores/v2v-project-store';
import { Input } from '@openreel/ui';

export const PipelinePanel: React.FC = () => {
  const { currentProject } = useV2VProjectStore();
  
  const [sourceLang, setSourceLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');
  const [whisperModel, setWhisperModel] = useState('large-v3');

  if (!currentProject) return null;

  return (
    <div className="flex flex-col gap-4 p-5 bg-background-tertiary/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-widest">
        <Settings size={14} className="text-primary" />
        Configuración del Pipeline
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-text-muted font-medium uppercase">Origen</label>
            <Input 
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="h-8 text-[10px] bg-background-secondary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-text-muted font-medium uppercase">Destino</label>
            <Input 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="h-8 text-[10px] bg-background-secondary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-text-muted font-medium uppercase">Modelo de Transcripción</label>
          <div className="flex items-center gap-2">
            <BrainCircuit size={12} className="text-text-muted" />
            <select 
              value={whisperModel}
              onChange={(e) => setWhisperModel(e.target.value)}
              className="flex-1 bg-background-secondary border border-border rounded px-2 py-1 text-[10px] text-text-primary outline-none focus:border-primary/50"
            >
              <option value="base">Whisper Base (Fast)</option>
              <option value="small">Whisper Small</option>
              <option value="medium">Whisper Medium</option>
              <option value="large-v3">Whisper Large v3 (Best)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
