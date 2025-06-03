import { create } from 'zustand';
import type { CaseStudy, GenerationInput, UserPreferences } from '../../shared/types';

interface AppState {
  // Cases
  cases: CaseStudy[];
  currentCase: CaseStudy | null;
  isGenerating: boolean;
  
  // UI State
  selectedView: string;
  searchQuery: string;
  filters: {
    domain?: string;
    complexity?: string;
    favorite?: boolean;
  };
  
  // AI Status
  aiStatus: 'connected' | 'disconnected' | 'error';
  
  // Preferences
  preferences: UserPreferences | null;
  
  // Actions
  setCases: (cases: CaseStudy[]) => void;
  setCurrentCase: (caseStudy: CaseStudy | null) => void;
  addCase: (caseStudy: CaseStudy) => void;
  updateCase: (caseStudy: CaseStudy) => void;
  deleteCase: (id: number) => void;
  setIsGenerating: (generating: boolean) => void;
  setSelectedView: (view: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: any) => void;
  setAiStatus: (status: 'connected' | 'disconnected' | 'error') => void;
  setPreferences: (preferences: UserPreferences) => void;
  
  // Async actions
  loadCases: () => Promise<void>;
  saveCase: (caseStudy: CaseStudy) => Promise<void>;
  generateCase: (input: GenerationInput) => Promise<void>;
  searchCases: (query: string) => Promise<void>;
  loadPreferences: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  cases: [],
  currentCase: null,
  isGenerating: false,
  selectedView: 'generation',
  searchQuery: '',
  filters: {},
  aiStatus: 'disconnected',
  preferences: null,
  
  // Synchronous actions
  setCases: (cases) => set({ cases }),
  setCurrentCase: (currentCase) => set({ currentCase }),
  addCase: (caseStudy) => set((state) => ({ cases: [caseStudy, ...state.cases] })),
  updateCase: (caseStudy) => set((state) => ({
    cases: state.cases.map(c => c.id === caseStudy.id ? caseStudy : c),
    currentCase: state.currentCase?.id === caseStudy.id ? caseStudy : state.currentCase
  })),
  deleteCase: (id) => set((state) => ({
    cases: state.cases.filter(c => c.id !== id),
    currentCase: state.currentCase?.id === id ? null : state.currentCase
  })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setSelectedView: (selectedView) => set({ selectedView }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set({ filters }),
  setAiStatus: (aiStatus) => set({ aiStatus }),
  setPreferences: (preferences) => set({ preferences }),
  
  // Async actions
  loadCases: async () => {
    try {
      const cases = await window.electronAPI.getCases();
      set({ cases });
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  },
  
  saveCase: async (caseStudy) => {
    try {
      const id = await window.electronAPI.saveCase(caseStudy);
      const savedCase = { ...caseStudy, id };
      
      if (caseStudy.id) {
        get().updateCase(savedCase);
      } else {
        get().addCase(savedCase);
      }
    } catch (error) {
      console.error('Failed to save case:', error);
      throw error;
    }
  },
  
  generateCase: async (input, provider = 'openai', model = 'gpt-4') => {
    set({ isGenerating: true });
    try {
      const preferences = get().preferences;
      console.log('Generation attempt:', { provider, model, preferences });
      
      let apiKey;
      
      if (provider !== 'ollama' && preferences?.api_keys) {
        apiKey = preferences.api_keys[provider];
        console.log('Using API key for provider:', provider, !!apiKey);
      }
      
      if (provider === 'ollama') {
        console.log('Using Ollama with model:', model);
      }
      
      const result = await window.electronAPI.generateCase(input, provider, model, apiKey);
      const newCase: CaseStudy = {
        title: result.title || 'Untitled Case Study',
        domain: input.domain,
        complexity: input.complexity,
        scenario_type: input.scenario_type,
        content: result.content,
        questions: result.questions,
        answers: result.answers,
        tags: result.tags || [],
        is_favorite: false,
        word_count: result.content.split(' ').length,
        usage_count: 0
      };
      
      await get().saveCase(newCase);
      set({ currentCase: newCase });
    } catch (error) {
      console.error('Failed to generate case:', error);
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },
  
  searchCases: async (query) => {
    try {
      const cases = await window.electronAPI.searchCases(query);
      set({ cases, searchQuery: query });
    } catch (error) {
      console.error('Failed to search cases:', error);
    }
  },
  
  loadPreferences: async () => {
    try {
      const preferences = await window.electronAPI.getPreferences();
      set({ preferences });
      
      // Check AI connection status
      if (preferences.default_ai_provider === 'ollama' || 
          (preferences.api_keys && Object.keys(preferences.api_keys).length > 0)) {
        set({ aiStatus: 'connected' });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }
}));