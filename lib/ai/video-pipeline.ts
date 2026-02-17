export type VideoPipelineStep = {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed';
  description: string;
};

export const getFutureVideoPipeline = (): VideoPipelineStep[] => [
  {
    id: 'tts',
    name: 'TTS Synthesis',
    status: 'pending',
    description: 'Convert narration text into voice tracks (Azure Speech, ElevenLabs, or provider abstraction).'
  },
  {
    id: 'scene_generation',
    name: 'Scene Generation',
    status: 'pending',
    description: 'Generate visual scenes from lesson video prompts and timing maps.'
  },
  {
    id: 'timeline_composition',
    name: 'Timeline Composition',
    status: 'pending',
    description: 'Compose audio + scenes + lower-thirds into exportable timeline metadata.'
  },
  {
    id: 'render_export',
    name: 'Render & Export',
    status: 'pending',
    description: 'Render MP4/WebM assets and attach to course lessons for publishing.'
  }
];
