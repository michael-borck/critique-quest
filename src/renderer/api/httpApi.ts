// HTTP implementation of the electronAPI surface for the self-hosted web build.
// Each method posts to the server's /api/rpc endpoint, which dispatches to the
// same core services the Electron IPC handlers use. Assigned to
// window.electronAPI by the web entry point so components are transport-agnostic.

async function rpc<T = unknown>(method: string, ...args: unknown[]): Promise<T> {
  const res = await fetch('/api/rpc', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, args }),
  });
  if (res.status === 401) {
    window.dispatchEvent(new Event('cq-unauthorized'));
    throw new Error('Not authenticated');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Request failed');
  return (data as { result: T }).result;
}

// Exports are generated server-side and streamed back; trigger a browser
// download and report the filename (mirroring the desktop's "saved to..." path).
async function downloadExport(payload: Record<string, unknown>): Promise<string> {
  const res = await fetch('/api/export', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Export failed');
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition') || '';
  const name = /filename="?([^"]+)"?/.exec(cd)?.[1] || 'critiquequest-export';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return name;
}

export const httpApi: typeof window.electronAPI = {
  getCases: (filters) => rpc('getCases', filters),
  saveCase: (caseData) => rpc('saveCase', caseData),
  deleteCase: (id) => rpc('deleteCase', id),
  searchCases: (query) => rpc('searchCases', query),
  getPreferences: () => rpc('getPreferences'),
  setPreference: (key, value) => rpc('setPreference', key, value),

  generateCase: (input, provider, model, apiKey, endpoint) =>
    rpc('generateCase', input, provider, model, apiKey, endpoint),
  regenerateSection: (section, context, provider, model, apiKey, endpoint) =>
    rpc('regenerateSection', section, context, provider, model, apiKey, endpoint),
  suggestContext: (domain, complexity, scenarioType, provider, model, apiKey, endpoint) =>
    rpc('suggestContext', domain, complexity, scenarioType, provider, model, apiKey, endpoint),
  testConnection: (provider, apiKey, endpoint) => rpc('testConnection', provider, apiKey, endpoint),
  getOllamaModels: (endpoint, bearer) => rpc('getOllamaModels', endpoint, bearer),
  setOllamaEndpoint: (endpoint) => rpc('setOllamaEndpoint', endpoint),
  analyzePracticeSession: (practiceContext, provider, model, apiKey, endpoint) =>
    rpc('analyzePracticeSession', practiceContext, provider, model, apiKey, endpoint),

  exportCase: (caseData, format) => downloadExport({ kind: 'case', caseData, format }),
  importCaseFromURL: (url) => rpc('importCaseFromURL', url),
  exportBulkCases: (caseStudies, format) => downloadExport({ kind: 'bulk', caseStudies, format }),
  exportBundle: (collections, caseStudies, filename) => downloadExport({ kind: 'bundle', collections, caseStudies, filename }),
  importBulkCasesFromURL: (url) => rpc('importBulkCasesFromURL', url),
  importBulkCasesFromFile: (content) => rpc('importBulkCasesFromFile', content),

  getCollections: () => rpc('getCollections'),
  saveCollection: (collectionData) => rpc('saveCollection', collectionData),
  deleteCollection: (id) => rpc('deleteCollection', id),
  addCaseToCollection: (caseId, collectionId) => rpc('addCaseToCollection', caseId, collectionId),
  removeCaseFromCollection: (caseId, collectionId) => rpc('removeCaseFromCollection', caseId, collectionId),
  getCasesByCollection: (collectionId) => rpc('getCasesByCollection', collectionId),
  getCollectionsByCase: (caseId) => rpc('getCollectionsByCase', caseId),

  getUsageStats: () => rpc('getUsageStats'),
  trackAIUsage: (usage) => rpc('trackAIUsage', usage),

  savePracticeSession: (session) => rpc('savePracticeSession', session),
  getPracticeSessions: (caseId) => rpc('getPracticeSessions', caseId),
};
