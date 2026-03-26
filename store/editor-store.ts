import { create } from 'zustand';

export interface Component {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  children?: Component[];
  styles?: Record<string, string>;
}

interface EditorState {
  // Project state
  projectId: string | null;
  projectName: string;
  prompt: string;
  generatedCode: string | null;
  
  // Components state
  components: Component[];
  selectedComponentId: string | null;
  
  // UI state
  isGenerating: boolean;
  isSaving: boolean;
  showSidebar: boolean;
  showProperties: boolean;
  
  // Actions
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setPrompt: (prompt: string) => void;
  setGeneratedCode: (code: string | null) => void;
  setComponents: (components: Component[]) => void;
  addComponent: (component: Component) => void;
  updateComponent: (id: string, data: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  toggleSidebar: () => void;
  toggleProperties: () => void;
  reset: () => void;
}

const initialState = {
  projectId: null,
  projectName: 'Untitled Project',
  prompt: '',
  generatedCode: null,
  components: [],
  selectedComponentId: null,
  isGenerating: false,
  isSaving: false,
  showSidebar: true,
  showProperties: false,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,
  
  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setPrompt: (prompt) => set({ prompt }),
  setGeneratedCode: (code) => set({ generatedCode: code }),
  
  setComponents: (components) => set({ components }),
  
  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
    })),
    
  updateComponent: (id, data) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
    
  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
    })),
    
  selectComponent: (id) => set({ 
    selectedComponentId: id,
    showProperties: id !== null,
  }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIsSaving: (isSaving) => set({ isSaving }),
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  toggleProperties: () => set((state) => ({ showProperties: !state.showProperties })),
  
  reset: () => set(initialState),
}));
