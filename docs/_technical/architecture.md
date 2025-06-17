---
layout: default
title: "System Architecture"
description: "Technical overview of CritiqueQuest's architecture, components, and design decisions"
nav_order: 1
parent: Technical Documentation
---

# System Architecture
{: .no_toc }

Comprehensive technical overview of CritiqueQuest's design and implementation.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Architectural Overview

CritiqueQuest is built as a modern desktop application using Electron, combining the flexibility of web technologies with native desktop capabilities. The architecture emphasizes educational requirements: offline functionality, data privacy, and reliable performance.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CritiqueQuest Desktop App               │
├─────────────────────────────────────────────────────────────┤
│  Renderer Process (React + TypeScript)                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │  UI Components  │ │  State Management│ │  Contexts     │ │
│  │  - Material-UI  │ │  - Zustand Store │ │  - Theme      │ │
│  │  - Custom Views │ │  - Persistence   │ │  - Settings   │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Inter-Process Communication (IPC)                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Secure API Bridge - Preload Script                    │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Main Process (Node.js + TypeScript)                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │  AI Service     │ │  Database       │ │  File Service │ │
│  │  - Multi-provider│ │  - JSON storage │ │  - Export/Import│ │
│  │  - Local/Cloud  │ │  - Collections  │ │  - Document gen│ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │  Cloud AI APIs  │ │  Local AI       │ │  File System  │ │
│  │  - OpenAI       │ │  - Ollama       │ │  - User data  │ │
│  │  - Google       │ │  - Local models │ │  - Exports    │ │
│  │  - Anthropic    │ │                 │ │               │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Technology Stack

### Frontend Architecture (Renderer Process)

**React 18 + TypeScript**
- **Component-based UI**: Modular, reusable educational interface components
- **Type Safety**: Comprehensive TypeScript coverage for development reliability
- **Modern React**: Hooks, functional components, and concurrent rendering

**Material-UI (MUI) Design System**
- **Consistent Interface**: Professional, accessible educational application design
- **Theme System**: Dark/light mode support with educational branding
- **Responsive Components**: Adaptive layouts for different screen sizes

**State Management (Zustand)**
```typescript
// Simplified store architecture
interface AppStore {
  // Case Study Management
  cases: CaseStudy[];
  currentCase: CaseStudy | null;
  
  // Collections & Organization
  collections: Collection[];
  selectedCollectionId: string | null;
  
  // User Interface State
  selectedView: ViewType;
  searchQuery: string;
  filters: FilterState;
  
  // AI & Generation
  isGenerating: boolean;
  preferences: UserPreferences;
  
  // Practice & Progress
  practiceSession: PracticeSession | null;
  progressData: ProgressMetrics[];
}
```

### Backend Architecture (Main Process)

**Electron Main Process**
- **System Integration**: Native desktop features and file system access
- **Security Management**: Secure IPC and external service communication
- **Process Coordination**: Renderer/main process communication orchestration

**Service Layer Architecture**

```typescript
// Core service interfaces
interface AIService {
  generateCaseStudy(input: GenerationInput): Promise<CaseStudy>;
  suggestContext(domain: string, complexity: string): Promise<string>;
  analyzePracticeSession(session: PracticeData): Promise<AnalysisResult>;
}

interface DatabaseService {
  saveCaseStudy(caseStudy: CaseStudy): Promise<void>;
  getCaseStudies(filters?: FilterOptions): Promise<CaseStudy[]>;
  saveCollection(collection: Collection): Promise<void>;
  savePracticeSession(session: PracticeSession): Promise<void>;
}

interface FileService {
  exportCaseStudy(caseStudy: CaseStudy, format: ExportFormat): Promise<string>;
  importCaseStudies(filePath: string): Promise<CaseStudy[]>;
  generatePDF(content: string, options: PDFOptions): Promise<Buffer>;
}
```

## Data Architecture

### Local Data Storage

**JSON Database (node-json-db)**
```
User Data Directory/
├── critiquequest/
│   ├── database.json          # Main application data
│   ├── preferences.json       # User settings and configuration
│   ├── collections/          # Case study collections
│   │   ├── collection-1.json
│   │   └── collection-2.json
│   ├── practice-sessions/    # Practice and progress data
│   │   ├── session-1.json
│   │   └── session-2.json
│   └── exports/             # Generated export files
│       ├── case-study-1.pdf
│       └── collection-export.zip
```

**Data Models**

```typescript
// Core domain models
interface CaseStudy {
  id: number;
  title: string;
  domain: string;           // Category from framework
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  scenario_type: string;
  content: string;          // Main case study text
  questions: string;        // Analysis questions
  answers?: string;         // Model answers (optional)
  word_count: number;
  created_date: string;
  modified_date: string;
  tags: string[];
  is_favorite: boolean;
  usage_count: number;
  concepts: string[];       // Applied frameworks/theories
}

interface Collection {
  id: number;
  name: string;
  description: string;
  color: string;
  case_ids: number[];
  created_date: string;
  is_shared: boolean;
}

interface PracticeSession {
  id: number;
  case_id: number;
  start_time: string;
  end_time: string;
  notes: string;
  answers: string[];
  analysis?: PracticeAnalysis;
  completion_status: 'completed' | 'partial' | 'abandoned';
}

interface GenerationInput {
  domain: string;           // Selected category
  complexity: string;
  scenario_type: string;
  context_setting: string;
  key_concepts: string;     // Selected frameworks/theories
  length_preference: string;
  custom_prompt: string;
  include_elements: ContentElements;
}
```

### Framework Database Structure

**Hierarchical Knowledge Framework**
```typescript
// Two-level educational framework
interface CategoryStructure {
  [category: string]: {
    disciplines: string[];
    concepts: {
      [discipline: string]: string[];
    };
  };
}

// Example structure
const frameworkStructure: CategoryStructure = {
  'Business & Management': {
    disciplines: ['Entrepreneurship', 'Marketing', 'Finance', 'Strategy & Leadership'],
    concepts: {
      'Entrepreneurship': ['Lean Startup Methodology', 'Business Model Canvas', 'Effectuation Theory'],
      'Marketing': ['4Ps Marketing Mix', 'Customer Lifetime Value', 'Brand Equity Theory'],
      // ... additional concepts
    }
  },
  // ... additional categories
};
```

## AI Integration Architecture

### Multi-Provider AI System

**Provider Abstraction Layer**
```typescript
// Unified AI interface
abstract class AIProvider {
  abstract generateCaseStudy(input: GenerationInput): Promise<string>;
  abstract suggestContext(prompt: string): Promise<string>;
  abstract analyzePractice(session: PracticeData): Promise<AnalysisResult>;
}

// Concrete implementations
class OpenAIProvider extends AIProvider {
  constructor(apiKey: string, model: string) { /* ... */ }
}

class OllamaProvider extends AIProvider {
  constructor(endpoint: string, model: string) { /* ... */ }
}

class AnthropicProvider extends AIProvider {
  constructor(apiKey: string, model: string) { /* ... */ }
}
```

**AI Service Architecture**
```typescript
class AIService {
  private providers: Map<string, AIProvider> = new Map();
  
  constructor() {
    this.initializeProviders();
  }
  
  async generateCaseStudy(
    input: GenerationInput,
    provider: string,
    model: string
  ): Promise<CaseStudy> {
    const aiProvider = this.getProvider(provider);
    const rawContent = await aiProvider.generateCaseStudy(input);
    return this.parseAndValidate(rawContent, input);
  }
  
  private parseAndValidate(content: string, input: GenerationInput): CaseStudy {
    // Content parsing and educational validation logic
  }
}
```

### Content Generation Pipeline

**Case Study Generation Flow**
```
User Input → Input Validation → Prompt Engineering → AI Generation → Content Parsing → Educational Validation → Database Storage
```

**Prompt Engineering Strategy**
```typescript
class PromptBuilder {
  buildCaseStudyPrompt(input: GenerationInput): string {
    return `
      Create an educational case study with the following requirements:
      
      Domain: ${input.domain}
      Complexity: ${input.complexity}
      Scenario Type: ${input.scenario_type}
      Context: ${input.context_setting}
      Key Concepts: ${input.key_concepts}
      
      Include these elements:
      ${this.formatIncludeElements(input.include_elements)}
      
      Educational Requirements:
      - Clear learning objectives
      - Realistic scenario details
      - Multiple stakeholder perspectives
      - Analysis questions that promote critical thinking
      - Word count: ${this.getTargetWordCount(input.length_preference)}
      
      Format the response as structured educational content...
    `;
  }
}
```

## Security and Privacy Architecture

### Data Protection Strategies

**Local-First Design**
- All user data stored locally by default
- No mandatory cloud services or external dependencies
- User controls all data transmission and sharing

**Secure IPC Communication**
```typescript
// Preload script security
const electronAPI = {
  // Exposed safe APIs only
  generateCase: (input: GenerationInput) => ipcRenderer.invoke('generate-case', input),
  saveCase: (caseStudy: CaseStudy) => ipcRenderer.invoke('save-case', caseStudy),
  // No direct file system or process access
};

// Main process validation
ipcMain.handle('generate-case', async (event, input: GenerationInput) => {
  // Input validation and sanitization
  const validatedInput = validateGenerationInput(input);
  return await aiService.generateCaseStudy(validatedInput);
});
```

**AI Provider Security**
```typescript
class SecureAIProvider {
  private sanitizeInput(input: string): string {
    // Remove potential injection patterns
    // Validate educational content appropriateness
    // Apply institutional content policies
  }
  
  private validateResponse(response: string): boolean {
    // Check for inappropriate content
    // Verify educational value
    // Ensure response completeness
  }
}
```

### Privacy Configuration Options

**Local AI Option (Ollama)**
- Complete data privacy with local processing
- No external network requests for AI functionality
- Institutional control over AI models and behavior

**Cloud AI with Privacy Controls**
- API key management and encryption
- Request/response logging controls
- Data retention policy compliance

## Performance Architecture

### Optimization Strategies

**Efficient State Management**
```typescript
// Optimized Zustand store with selective subscriptions
const useCaseStudies = () => useAppStore(state => state.cases);
const useCurrentCase = () => useAppStore(state => state.currentCase);

// Computed state for expensive operations
const useFilteredCases = (filters: FilterState) => useMemo(() => {
  return useAppStore.getState().cases.filter(applyFilters(filters));
}, [filters, useAppStore(state => state.cases)]);
```

**Lazy Loading and Code Splitting**
```typescript
// Component-level code splitting
const GenerationView = lazy(() => import('./components/GenerationView'));
const PracticeView = lazy(() => import('./components/PracticeView'));

// Feature-based splitting for optional components
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'));
```

**Database Performance**
```typescript
// Efficient JSON database operations
class DatabaseService {
  private cache: Map<string, any> = new Map();
  
  async getCaseStudies(filters?: FilterOptions): Promise<CaseStudy[]> {
    const cacheKey = JSON.stringify(filters);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const results = await this.queryDatabase(filters);
    this.cache.set(cacheKey, results);
    return results;
  }
}
```

### Scalability Considerations

**Resource Management**
- Efficient memory usage for large case study libraries
- Background processing for AI generation
- Optimized rendering for complex markdown content

**Data Growth Handling**
- Pagination for large case study collections
- Incremental search and filtering
- Archive/backup strategies for long-term usage

## Development and Build Architecture

### Build Pipeline

**Development Workflow**
```bash
# Concurrent development processes
npm run dev:renderer  # Vite dev server with HMR
npm run dev:main      # TypeScript compilation + Electron launch
```

**Production Build**
```bash
# Multi-step production build
npm run build:renderer  # Optimized React bundle
npm run build:main      # Compiled Node.js main process
npm run dist           # Platform-specific distribution packages
```

**Build Configuration (Vite)**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      external: ['electron'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@mui/material'],
          ai: ['openai', 'axios'],
          utils: ['zustand', 'react-markdown']
        }
      }
    }
  }
});
```

### Quality Assurance

**TypeScript Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Code Quality Tools**
- **ESLint**: Comprehensive JavaScript/TypeScript linting
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit quality checks

## Deployment Architecture

### Distribution Strategy

**Multi-Platform Support**
```javascript
// electron-builder configuration
{
  "appId": "com.critiquequest.app",
  "directories": { "output": "release" },
  "files": ["dist/**/*", "assets/**/*"],
  "mac": { "category": "public.app-category.education" },
  "win": { "target": "nsis" },
  "linux": { "target": "AppImage" }
}
```

**Update Mechanism**
- Automatic update checking and notification
- Incremental updates for performance
- Rollback capability for stability

### Educational Institution Deployment

**Institutional Configuration**
```typescript
// Configurable institutional defaults
interface InstitutionalConfig {
  defaultAIProvider: 'ollama' | 'openai' | 'google';
  allowedAIProviders: string[];
  dataRetentionPolicy: number; // days
  privacyMode: 'strict' | 'balanced' | 'open';
  defaultCollections: Collection[];
  institutionalBranding: BrandingConfig;
}
```

---

## Architectural Principles

### Design Philosophy

**🎓 Education-First Design**
- Every architectural decision prioritizes educational value
- Performance optimized for teaching and learning workflows
- Privacy and security designed for educational environments

**🔧 Maintainable Modularity**
- Clear separation between UI, business logic, and external services
- Pluggable AI provider architecture for future extensibility
- Component-based design for easy feature addition

**🔒 Privacy by Design**
- Local-first data storage with optional cloud services
- Minimal data transmission with user control
- Transparent data handling and export capabilities

**⚡ Performance for Education**
- Responsive UI optimized for classroom use
- Efficient resource usage for institutional deployment
- Scalable architecture supporting growth

This architecture enables CritiqueQuest to serve as a robust, privacy-conscious, and educationally effective platform for case study generation and analysis, supporting both individual learners and institutional deployments while maintaining the flexibility to evolve with changing educational needs.