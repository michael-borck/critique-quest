// Portable application core, free of Electron. Both the desktop (Electron) and
// the self-hosted (HTTP server) adapters depend only on this module.
export { DatabaseManager } from './database';
export type { DatabaseOptions } from './database';
export { AIService } from './ai-service';
export { FileService } from './file-service';
export type { FileServiceOptions } from './file-service';
export type { SecretBox } from './secret-box';
export { isPrivateAddress, assertPublicUrl } from './url-guard';
