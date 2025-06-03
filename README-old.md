# ScenarioForge MVP

AI-Powered Case Study Generator for Educational Purposes

## Overview

ScenarioForge is a standalone desktop application that empowers educators and learners to generate high-quality, AI-powered case studies and scenarios. This MVP focuses on core functionality with local data storage and offline-first operation.

## Features

### Core Functionality
- **AI-Powered Generation**: Create case studies using OpenAI GPT-4, Google Gemini, Anthropic Claude, or **Ollama (Local AI)**
- **Structured Input System**: Configure domain, complexity, scenario type, and custom requirements
- **Local Content Library**: Store and organize case studies with search and filtering
- **Practice Mode**: Self-assessment mode with timer and note-taking capabilities
- **Multiple Export Formats**: PDF, Word, HTML, and plain text exports
- **Quality Control**: Automated content validation and improvement suggestions

### Key Benefits
- **Offline-First**: Works locally with optional AI connectivity (full offline with Ollama)
- **Privacy-Focused**: All data stored locally on your device
- **User-Friendly**: Intuitive interface requiring no tutorials
- **Customizable**: Flexible generation parameters and preferences
- **Local AI**: Run AI models on your machine with Ollama (no API costs, complete privacy)

## Technical Architecture

- **Frontend**: React 18+ with TypeScript and Material-UI
- **Backend**: Electron with Node.js
- **Database**: JSON-based local data storage
- **AI Integration**: OpenAI, Google Gemini, Anthropic Claude, Ollama (local)
- **Export Engine**: Custom PDF/Word generation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AI API key (OpenAI, Google, or Anthropic)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd scenario-forge
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```

3. **Build Application**
   ```bash
   npm run build
   npm run dist
   ```

### Configuration

#### Option 1: Cloud AI (OpenAI, etc.)
1. Launch the application
2. Go to Settings → AI Configuration
3. Add your API key for your preferred AI provider
4. Configure default generation settings

#### Option 2: Local AI with Ollama
1. Install Ollama: https://ollama.ai
2. Run `ollama pull llama2` to download a model
3. Start Ollama: `ollama serve`
4. In ScenarioForge Settings → AI Configuration → Ollama
5. Test connection and load models
6. Set as primary provider for complete privacy

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed instructions.

## Usage

### Generating Case Studies

1. **Navigate to Generate tab**
2. **Configure parameters**:
   - Domain (Business, Technology, Healthcare, etc.)
   - Complexity Level (Beginner, Intermediate, Advanced)
   - Scenario Type (Problem-solving, Decision-making, etc.)
   - Context Setting (describe the situation)
   - Key Concepts (theories/frameworks to include)

3. **Customize content elements**:
   - Executive Summary
   - Background/Context
   - Problem Statement
   - Analysis Questions
   - Learning Objectives

4. **Click Generate** and review the results

### Managing Your Library

- **Search**: Full-text search across all case studies
- **Filter**: By domain, complexity, or favorites
- **Tags**: Organize with custom tags
- **Export**: Multiple formats available
- **Practice**: Use cases for self-assessment

### Practice Mode

1. Select a case study from your library
2. Enable timer (optional)
3. Work through analysis questions step-by-step
4. Review model answers (if available)
5. Save notes and track progress

## File Structure

```
scenario-forge/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Application entry point
│   │   ├── database.ts # SQLite database management
│   │   ├── ai-service.ts # AI provider integration
│   │   └── file-service.ts # Export/import functionality
│   ├── renderer/       # React frontend
│   │   ├── components/ # UI components
│   │   ├── store/      # State management
│   │   └── App.tsx     # Main application component
│   └── shared/         # Shared types and utilities
├── dist/               # Built application
└── release/            # Distribution packages
```

## Data Storage

All data is stored locally in SQLite databases:

- **Case Studies**: Content, metadata, and usage tracking
- **Preferences**: User settings and API keys
- **Practice Sessions**: Learning progress and notes
- **AI Usage**: Token consumption and cost tracking

Default location: `~/AppData/ScenarioForge/` (Windows) or `~/Library/Application Support/ScenarioForge/` (macOS)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dist` - Create distribution packages
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checking

### Architecture Decisions

- **Electron**: Cross-platform desktop application
- **React + TypeScript**: Type-safe, modern frontend
- **SQLite**: Reliable local data storage
- **Zustand**: Lightweight state management
- **Material-UI**: Consistent, accessible UI components

## Security & Privacy

- **Local Storage**: No data sent to external servers
- **API Key Security**: Stored in system keychain
- **Data Encryption**: Optional SQLite encryption
- **Content Filtering**: Basic inappropriate content detection

## Troubleshooting

### Common Issues

1. **AI Generation Fails**
   - Check API key configuration
   - Verify internet connection
   - Check API provider status

2. **Export Not Working**
   - Ensure write permissions to exports folder
   - Check available disk space

3. **Database Errors**
   - Try restarting the application
   - Check database file permissions

### Support

For issues and feature requests, please check the documentation or contact support.

## Future Roadmap

### Version 2.0
- Enhanced AI features and local model support
- Advanced analytics and learning insights
- Content templates and industry-specific scenarios
- Basic collaboration tools

### Version 3.0+
- Multi-user support and team collaboration
- LMS integration capabilities
- Cloud synchronization options
- Advanced administrative features

## License

[License information would go here]

## Contributing

[Contributing guidelines would go here]

---

**ScenarioForge MVP** - Transform any learning concept into an engaging, realistic scenario in minutes, not hours.