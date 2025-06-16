import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { DatabaseManager } from './database';
import { AIService } from './ai-service';
import { FileService } from './file-service';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private databaseManager: DatabaseManager;
  private aiService: AIService;
  private fileService: FileService;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.aiService = new AIService();
    this.fileService = new FileService();
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
        preload: join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'default',
      show: false,
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
    ipcMain.handle('ai:generateCase', async (_, input, provider, model, apiKey) => {
      return this.aiService.generateCaseStudy(input, provider, model, apiKey);
    });

    ipcMain.handle('ai:regenerateSection', async (_, section, context) => {
      return this.aiService.regenerateSection(section, context);
    });

    ipcMain.handle('ai:testConnection', async (_, provider, apiKey, endpoint) => {
      return this.aiService.testConnection(provider, apiKey, endpoint);
    });

    ipcMain.handle('ai:getOllamaModels', async (_, endpoint) => {
      return this.aiService.getOllamaModels(endpoint);
    });

    ipcMain.handle('ai:setOllamaEndpoint', async (_, endpoint) => {
      return this.aiService.setOllamaEndpoint(endpoint);
    });

    // File operations
    ipcMain.handle('file:export', async (_, caseData, format) => {
      return this.fileService.exportCase(caseData, format);
    });

    ipcMain.handle('file:import', async (_, filePath) => {
      return this.fileService.importCase(filePath);
    });

    ipcMain.handle('file:importFromURL', async (_, url) => {
      return this.fileService.importCaseFromURL(url);
    });

    ipcMain.handle('file:exportBulk', async (_, caseStudies, format) => {
      return this.fileService.exportBulkCases(caseStudies, format);
    });
  }

  private async initialize(): Promise<void> {
    await this.databaseManager.initialize();
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