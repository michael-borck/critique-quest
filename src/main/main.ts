import { app, BrowserWindow, ipcMain, session, shell } from 'electron';
import { join } from 'path';
import { DatabaseManager, AIService, FileService } from '../core';
import { ElectronSecretBox } from './secret-box';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private databaseManager: DatabaseManager;
  private aiService: AIService;
  private fileService: FileService;

  constructor() {
    const dataDir = app.getPath('userData');
    this.databaseManager = new DatabaseManager({ dataDir, secretBox: new ElectronSecretBox() });
    this.aiService = new AIService();
    this.fileService = new FileService({ dataDir });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'default',
      show: false,
    });

    // Open links that try to spawn new windows in the user's default browser
    // instead of inside the app, and never allow in-app navigation away from
    // the bundled renderer.
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https://') || url.startsWith('http://')) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      const isDev = process.env.NODE_ENV === 'development';
      const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
      const allowed = isDev ? url.startsWith(devUrl) : url.startsWith('file://');
      if (!allowed) {
        event.preventDefault();
        if (url.startsWith('https://') || url.startsWith('http://')) {
          shell.openExternal(url);
        }
      }
    });

    if (process.env.NODE_ENV === 'development') {
      // Try different ports that Vite might use
      const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
      this.mainWindow.loadURL(devUrl);
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupContentSecurityPolicy(): void {
    const isDev = process.env.NODE_ENV === 'development';

    // All outbound network calls (OpenAI, Anthropic, Gemini, Ollama) happen in
    // the main process, so the renderer only needs to talk to itself. In dev,
    // Vite's HMR client needs 'unsafe-eval' and a websocket connection.
    const csp = isDev
      ? [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self' ws: http://localhost:* http://127.0.0.1:*",
        ].join('; ')
      : [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
        ].join('; ');

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp],
        },
      });
    });
  }

  private setupIpcHandlers(): void {
    // Database operations
    ipcMain.handle('db:getCases', async (_, filters) => {
      return this.databaseManager.getCases(filters);
    });

    ipcMain.handle('db:saveCase', async (_, caseData) => {
      return this.databaseManager.saveCase(caseData);
    });

    ipcMain.handle('db:deleteCase', async (_, id) => {
      return this.databaseManager.deleteCase(id);
    });

    ipcMain.handle('db:searchCases', async (_, query) => {
      return this.databaseManager.searchCases(query);
    });

    ipcMain.handle('db:getPreferences', async () => {
      return this.databaseManager.getPreferences();
    });

    ipcMain.handle('db:setPreference', async (_, key, value) => {
      return this.databaseManager.setPreference(key, value);
    });

    // AI operations
    ipcMain.handle('ai:generateCase', async (_, input, provider, model, apiKey, endpoint) => {
      return this.aiService.generateCaseStudy(input, provider, model, apiKey, endpoint);
    });

    ipcMain.handle('ai:regenerateSection', async (_, section, context, provider, model, apiKey, endpoint) => {
      return this.aiService.regenerateSection(section, context, provider, model, apiKey, endpoint);
    });

    ipcMain.handle('ai:suggestContext', async (_, domain, complexity, scenarioType, provider, model, apiKey, endpoint) => {
      return this.aiService.suggestContext(domain, complexity, scenarioType, provider, model, apiKey, endpoint);
    });

    ipcMain.handle('ai:testConnection', async (_, provider, apiKey, endpoint) => {
      return this.aiService.testConnection(provider, apiKey, endpoint);
    });

    ipcMain.handle('ai:getOllamaModels', async (_, endpoint, bearer) => {
      return this.aiService.getOllamaModels(endpoint, bearer);
    });

    ipcMain.handle('ai:setOllamaEndpoint', async (_, endpoint) => {
      return this.aiService.setOllamaEndpoint(endpoint);
    });

    ipcMain.handle('ai:analyzePracticeSession', async (_, practiceContext, provider, model, apiKey, endpoint) => {
      return this.aiService.analyzePracticeSession(practiceContext, provider, model, apiKey, endpoint);
    });

    // File operations
    ipcMain.handle('file:export', async (_, caseData, format) => {
      return this.fileService.exportCase(caseData, format);
    });

    ipcMain.handle('file:importFromURL', async (_, url) => {
      return this.fileService.importCaseFromURL(url);
    });

    ipcMain.handle('file:exportBulk', async (_, caseStudies, format) => {
      return this.fileService.exportBulkCases(caseStudies, format);
    });

    ipcMain.handle('file:importBulkFromURL', async (_, url) => {
      return this.fileService.importBulkCasesFromURL(url);
    });

    ipcMain.handle('file:importBulkFromFile', async (_, content) => {
      return this.fileService.importBulkCasesFromFile(content);
    });

    ipcMain.handle('file:exportBundle', async (_, collections, caseStudies, filename) => {
      return this.fileService.exportBundle(collections, caseStudies, filename);
    });

    // Collection operations
    ipcMain.handle('collection:getCollections', async () => {
      return this.databaseManager.getCollections();
    });

    ipcMain.handle('collection:saveCollection', async (_, collectionData) => {
      return this.databaseManager.saveCollection(collectionData);
    });

    ipcMain.handle('collection:deleteCollection', async (_, id) => {
      return this.databaseManager.deleteCollection(id);
    });

    ipcMain.handle('collection:addCaseToCollection', async (_, caseId, collectionId) => {
      return this.databaseManager.addCaseToCollection(caseId, collectionId);
    });

    ipcMain.handle('collection:removeCaseFromCollection', async (_, caseId, collectionId) => {
      return this.databaseManager.removeCaseFromCollection(caseId, collectionId);
    });

    ipcMain.handle('collection:getCasesByCollection', async (_, collectionId) => {
      return this.databaseManager.getCasesByCollection(collectionId);
    });

    ipcMain.handle('collection:getCollectionsByCase', async (_, caseId) => {
      return this.databaseManager.getCollectionsByCase(caseId);
    });

    // Usage statistics operations
    ipcMain.handle('usage:getStats', async () => {
      return this.databaseManager.getUsageStats();
    });

    ipcMain.handle('usage:trackAI', async (_, usage) => {
      return this.databaseManager.trackAIUsage(usage);
    });

    // Practice session operations
    ipcMain.handle('practice:saveSession', async (_, session) => {
      return this.databaseManager.savePracticeSession(session);
    });

    ipcMain.handle('practice:getSessions', async (_, caseId) => {
      return this.databaseManager.getPracticeSessions(caseId);
    });
  }

  private async initialize(): Promise<void> {
    await this.databaseManager.initialize();
    this.setupContentSecurityPolicy();
    this.setupIpcHandlers();
  }

  public async start(): Promise<void> {
    await app.whenReady();
    await this.initialize();
    this.createWindow();

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }
}

const application = new Application();
application.start().catch(console.error);