import { create } from 'zustand';
import type { CaseStudy, Collection, GenerationInput, UserPreferences } from '../../shared/types';

interface AppState {
  // Cases
  cases: CaseStudy[];
  currentCase: CaseStudy | null;
  isGenerating: boolean;
  
  // Collections
  collections: Collection[];
  selectedCollectionId: number | null;
  collectionViewMode: 'all' | 'organized' | 'unorganized';
  
  // UI State
  selectedView: string;
  searchQuery: string;
  filters: {
    domain?: string;
    complexity?: string;
    favorite?: boolean;
    collection_id?: number;
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
  
  // Collection actions
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (collection: Collection) => void;
  deleteCollectionById: (id: number) => void;
  setSelectedCollectionId: (id: number | null) => void;
  setCollectionViewMode: (mode: 'all' | 'organized' | 'unorganized') => void;
  
  // Async actions
  loadCases: () => Promise<void>;
  saveCase: (caseStudy: CaseStudy) => Promise<void>;
  generateCase: (input: GenerationInput) => Promise<void>;
  searchCases: (query: string) => Promise<void>;
  loadPreferences: () => Promise<void>;
  startPractice: (caseStudy: CaseStudy) => void;
  
  // Async collection actions
  loadCollections: () => Promise<void>;
  saveCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;
  addCaseToCollection: (caseId: number, collectionId: number) => Promise<void>;
  removeCaseFromCollection: (caseId: number, collectionId: number) => Promise<void>;
  getCasesByCollection: (collectionId: number) => Promise<CaseStudy[]>;
  getCollectionsByCase: (caseId: number) => Promise<Collection[]>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  cases: [],
  currentCase: null,
  isGenerating: false,
  collections: [],
  selectedCollectionId: null,
  collectionViewMode: 'all',
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
  
  // Collection synchronous actions
  setCollections: (collections) => set({ collections }),
  addCollection: (collection) => set((state) => ({ collections: [collection, ...state.collections] })),
  updateCollection: (collection) => set((state) => ({
    collections: state.collections.map(c => c.id === collection.id ? collection : c)
  })),
  deleteCollectionById: (id) => set((state) => ({
    collections: state.collections.filter(c => c.id !== id),
    selectedCollectionId: state.selectedCollectionId === id ? null : state.selectedCollectionId
  })),
  setSelectedCollectionId: (selectedCollectionId) => set({ selectedCollectionId }),
  setCollectionViewMode: (collectionViewMode) => set({ collectionViewMode }),
  
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
      
      let endpoint;
      if (provider === 'ollama' && preferences?.ollama_endpoint) {
        endpoint = preferences.ollama_endpoint;
      }
      
      const result = await window.electronAPI.generateCase(input, provider, model, apiKey, endpoint);
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
  },

  startPractice: (caseStudy) => {
    set({ currentCase: caseStudy, selectedView: 'practice' });
  },
  
  // Collection async actions
  loadCollections: async () => {
    try {
      const collections = await window.electronAPI.getCollections();
      set({ collections });
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  },
  
  saveCollection: async (collection) => {
    try {
      const id = await window.electronAPI.saveCollection(collection);
      const savedCollection = { ...collection, id };
      
      if (collection.id) {
        get().updateCollection(savedCollection);
      } else {
        get().addCollection(savedCollection);
      }
    } catch (error) {
      console.error('Failed to save collection:', error);
      throw error;
    }
  },
  
  deleteCollection: async (id) => {
    try {
      await window.electronAPI.deleteCollection(id);
      get().deleteCollectionById(id);
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  },
  
  addCaseToCollection: async (caseId, collectionId) => {
    try {
      await window.electronAPI.addCaseToCollection(caseId, collectionId);
      // Reload collections to update counts
      await get().loadCollections();
    } catch (error) {
      console.error('Failed to add case to collection:', error);
      throw error;
    }
  },
  
  removeCaseFromCollection: async (caseId, collectionId) => {
    try {
      await window.electronAPI.removeCaseFromCollection(caseId, collectionId);
      // Reload collections to update counts
      await get().loadCollections();
    } catch (error) {
      console.error('Failed to remove case from collection:', error);
      throw error;
    }
  },
  
  getCasesByCollection: async (collectionId) => {
    try {
      return await window.electronAPI.getCasesByCollection(collectionId);
    } catch (error) {
      console.error('Failed to get cases by collection:', error);
      return [];
    }
  },
  
  getCollectionsByCase: async (caseId) => {
    try {
      return await window.electronAPI.getCollectionsByCase(caseId);
    } catch (error) {
      console.error('Failed to get collections by case:', error);
      return [];
    }
  }
}));