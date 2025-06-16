import { contextBridge, ipcRenderer } from 'electron';
import type { CaseStudy, Collection, GenerationInput, UserPreferences } from '../shared/types';

const electronAPI = {
  // Database operations
  getCases: (filters?: any) => ipcRenderer.invoke('db:getCases', filters),
  saveCase: (caseData: CaseStudy) => ipcRenderer.invoke('db:saveCase', caseData),
  deleteCase: (id: number) => ipcRenderer.invoke('db:deleteCase', id),
  searchCases: (query: string) => ipcRenderer.invoke('db:searchCases', query),
  getPreferences: () => ipcRenderer.invoke('db:getPreferences'),
  setPreference: (key: string, value: any) => ipcRenderer.invoke('db:setPreference', key, value),

  // AI operations
  generateCase: (input: GenerationInput, provider?: string, model?: string, apiKey?: string, endpoint?: string) => 
    ipcRenderer.invoke('ai:generateCase', input, provider, model, apiKey, endpoint),
  regenerateSection: (section: string, context: any) => ipcRenderer.invoke('ai:regenerateSection', section, context),
  suggestContext: (domain: string, complexity: string, scenarioType: string, provider?: string, model?: string, apiKey?: string, endpoint?: string) => 
    ipcRenderer.invoke('ai:suggestContext', domain, complexity, scenarioType, provider, model, apiKey, endpoint),
  testConnection: (provider: string, apiKey?: string, endpoint?: string) => 
    ipcRenderer.invoke('ai:testConnection', provider, apiKey, endpoint),
  getOllamaModels: (endpoint?: string) => ipcRenderer.invoke('ai:getOllamaModels', endpoint),
  setOllamaEndpoint: (endpoint: string) => ipcRenderer.invoke('ai:setOllamaEndpoint', endpoint),

  // File operations
  exportCase: (caseData: CaseStudy, format: string) => ipcRenderer.invoke('file:export', caseData, format),
  importCase: (filePath: string) => ipcRenderer.invoke('file:import', filePath),
  importCaseFromURL: (url: string) => ipcRenderer.invoke('file:importFromURL', url),
  exportBulkCases: (caseStudies: CaseStudy[], format: string) => ipcRenderer.invoke('file:exportBulk', caseStudies, format),
  exportBundle: (collections: Collection[], caseStudies: CaseStudy[], filename: string) => ipcRenderer.invoke('file:exportBundle', collections, caseStudies, filename),
  importBulkCasesFromURL: (url: string) => ipcRenderer.invoke('file:importBulkFromURL', url),
  importBulkCasesFromFile: (content: string) => ipcRenderer.invoke('file:importBulkFromFile', content),

  // Collection operations
  getCollections: () => ipcRenderer.invoke('collection:getCollections'),
  saveCollection: (collectionData: Collection) => ipcRenderer.invoke('collection:saveCollection', collectionData),
  deleteCollection: (id: number) => ipcRenderer.invoke('collection:deleteCollection', id),
  addCaseToCollection: (caseId: number, collectionId: number) => ipcRenderer.invoke('collection:addCaseToCollection', caseId, collectionId),
  removeCaseFromCollection: (caseId: number, collectionId: number) => ipcRenderer.invoke('collection:removeCaseFromCollection', caseId, collectionId),
  getCasesByCollection: (collectionId: number) => ipcRenderer.invoke('collection:getCasesByCollection', collectionId),
  getCollectionsByCase: (caseId: number) => ipcRenderer.invoke('collection:getCollectionsByCase', caseId),

  // Usage statistics operations
  getUsageStats: () => ipcRenderer.invoke('usage:getStats'),
  trackAIUsage: (usage: any) => ipcRenderer.invoke('usage:trackAI', usage),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}