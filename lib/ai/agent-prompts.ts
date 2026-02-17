export {
  AGENT_SYSTEM_BASE,
  lessonScriptPrompt,
  narrationPrompt,
  orchestratorPrompt,
  outlinePrompt,
  qaPrompt,
  repairPrompt
} from '@/lib/ai/agent-architecture';

export type AgentPromptSpec = {
  name: 'orchestrator' | 'outline' | 'lesson_script' | 'narration' | 'qa' | 'repair';
  goal: string;
  systemPrompt: string;
};

export const agentPromptArchitecture: AgentPromptSpec[] = [
  {
    name: 'orchestrator',
    goal: 'Decide the next workflow stage based on current DB state and errors.',
    systemPrompt: 'Use orchestratorPrompt from lib/ai/agent-architecture.ts'
  },
  {
    name: 'outline',
    goal: 'Generate curriculum outline JSON with chapter/lesson progression and exercises.',
    systemPrompt: 'Use outlinePrompt from lib/ai/agent-architecture.ts'
  },
  {
    name: 'lesson_script',
    goal: 'Generate one lesson script JSON with beats, timing, and quiz.',
    systemPrompt: 'Use lessonScriptPrompt from lib/ai/agent-architecture.ts'
  },
  {
    name: 'narration',
    goal: 'Convert lesson script JSON to TTS-optimized narration JSON.',
    systemPrompt: 'Use narrationPrompt from lib/ai/agent-architecture.ts'
  },
  {
    name: 'qa',
    goal: 'Validate progression, duplicates, prerequisites, and consistency.',
    systemPrompt: 'Use qaPrompt from lib/ai/agent-architecture.ts'
  },
  {
    name: 'repair',
    goal: 'Repair malformed or schema-invalid JSON while preserving intent.',
    systemPrompt: 'Use repairPrompt from lib/ai/agent-architecture.ts'
  }
];
