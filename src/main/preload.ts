import { contextBridge, ipcRenderer } from 'electron';
import type { CaseStudy, GenerationInput, UserPreferences } from '../shared/types';

const electronAPI = {
  // Database operations
  getCases: (filters?: any) => ipcRenderer.invoke('db:getCases', filters),
  saveCase: (caseData: CaseStudy) => ipcRenderer.invoke('db:saveCase', caseData),
  deleteCase: (id: number) => ipcRenderer.invoke('db:deleteCase', id),
  searchCases: (query: string) => ipcRenderer.invoke('db:searchCases', query),
  getPreferences: () => ipcRenderer.invoke('db:getPreferences'),
  setPreference: (key: string, value: any) => ipcRenderer.invoke('db:setPreference', key, value),

  // AI operations
  generateCase: (input: GenerationInput, provider?: string, model?: string, apiKey?: string) => 
    ipcRenderer.invoke('ai:generateCase', input, provider, model, apiKey),
  regenerateSection: (section: string, context: any) => ipcRenderer.invoke('ai:regenerateSection', section, context),
  testConnection: (provider: string, apiKey?: string, endpoint?: string) => 
    ipcRenderer.invoke('ai:testConnection', provider, apiKey, endpoint),
  getOllamaModels: (endpoint?: string) => ipcRenderer.invoke('ai:getOllamaModels', endpoint),
  setOllamaEndpoint: (endpoint: string) => ipcRenderer.invoke('ai:setOllamaEndpoint', endpoint),

  // File operations
  exportCase: (caseData: CaseStudy, format: string) => ipcRenderer.invoke('file:export', caseData, format),
  importCase: (filePath: string) => ipcRenderer.invoke('file:import', filePath),
  importCaseFromURL: (url: string) => ipcRenderer.invoke('file:importFromURL', url),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}