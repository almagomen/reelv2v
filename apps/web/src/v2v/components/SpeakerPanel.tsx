import React, { useState } from 'react';
import { Mic2, UserCircle, Save } from 'lucide-react';
import { useV2VProjectStore } from '../stores/v2v-project-store';
import { IconButton, Input, ScrollArea } from '@openreel/ui';

interface SpeakerInfo {
  id: string;
  name: string;
  voice: string;
}

export const SpeakerPanel: React.FC = () => {
  const { currentProject } = useV2VProjectStore();
  const [speakers, setSpeakers] = useState<SpeakerInfo[]>([
    { id: 'SPEAKER_00', name: 'Narrador', voice: 'lily' },
    { id: 'SPEAKER_01', name: 'Invitado 1', voice: 'daniel' },
  ]);

  if (!currentProject) return null;

  return (
    <div className="flex flex-col gap-4 p-5 bg-background-tertiary/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-widest">
        <UserCircle size={14} className="text-primary" />
        Gestión de Voces (VOZ IA)
      </div>

      <ScrollArea className="max-h-60">
        <div className="space-y-3 pr-2">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="p-3 bg-background-secondary rounded border border-border flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary">{speaker.id}</span>
                <IconButton icon={Mic2} title="Probar voz" size="sm" className="h-6 w-6" />
              </div>
              
              <div className="space-y-1">
                <Input 
                  value={speaker.name}
                  onChange={(e) => {
                    const newSpeakers = [...speakers];
                    const idx = newSpeakers.findIndex(s => s.id === speaker.id);
                    newSpeakers[idx].name = e.target.value;
                    setSpeakers(newSpeakers);
                  }}
                  className="h-7 text-[10px]"
                  placeholder="Nombre del personaje..."
                />
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={speaker.voice}
                  className="flex-1 bg-background-tertiary border border-border rounded px-2 py-1 text-[9px] text-text-primary outline-none focus:border-primary/50"
                >
                  <option value="lily">LMNT - Lily (Female)</option>
                  <option value="daniel">LMNT - Daniel (Male)</option>
                  <option value="custom">Custom Voice...</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <button className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-bold rounded flex items-center justify-center gap-2 transition-all">
        <Save size={12} />
        GUARDAR CAMBIOS
      </button>
    </div>
  );
};
