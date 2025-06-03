# ScenarioForge

Desktop application for generating AI-powered educational case studies with support for OpenAI, Anthropic, Google Gemini, and local Ollama models.

![Electron](https://img.shields.io/badge/Electron-26.2.1-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🎯 Overview

ScenarioForge empowers educators and learners to create high-quality, AI-generated case studies for educational purposes. With support for both cloud-based AI services and local models through Ollama, it offers flexibility between convenience and complete privacy.

### ✨ Key Features

- **🤖 Multi-Provider AI Support** - OpenAI GPT-4, Google Gemini, Anthropic Claude, and Ollama (local)
- **🔒 Privacy-First Option** - Run AI models locally with Ollama for complete data privacy
- **📚 Local Content Library** - Organize, search, and manage your case studies
- **🎮 Practice Mode** - Interactive self-assessment with timers and note-taking
- **📄 Multiple Export Formats** - PDF, Word, HTML, and plain text
- **🎨 Intuitive Interface** - Material-UI components with professional design
- **💾 Offline-First** - Works without internet (with local AI models)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) [Ollama](https://ollama.ai) for local AI models

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scenario-forge.git
cd scenario-forge

# Install dependencies
npm install

# Start development mode
npm run dev
```

### First-Time Setup

1. **Launch the application**
2. **Navigate to Settings** → AI Configuration
3. **Choose your AI provider:**
   - **Cloud AI**: Add API key for OpenAI/Google/Anthropic
   - **Local AI**: Install Ollama and pull a model (e.g., `ollama pull llama2`)
4. **Start generating** case studies!

## 📖 Usage

### Generating Case Studies

1. Click **Generate** in the sidebar
2. Configure your case study:
   - **Domain**: Business, Technology, Healthcare, etc.
   - **Complexity**: Beginner, Intermediate, or Advanced
   - **Scenario Type**: Problem-solving, Decision-making, etc.
   - **Context**: Describe the scenario setting
3. Click **Generate Case Study**
4. Review and save the generated content

### Managing Your Library

- **Search** across all case studies
- **Filter** by domain, complexity, or favorites
- **Tag** content for better organization
- **Export** in multiple formats

### Practice Mode

1. Select a case study from your library
2. Click **Practice** to start self-assessment
3. Work through questions step-by-step
4. Compare with AI-generated model answers
5. Track your progress with session notes

## 🔧 Configuration

### Using Cloud AI (OpenAI, etc.)

```javascript
// Settings → AI Configuration
{
  "provider": "openai",
  "apiKey": "your-api-key-here",
  "model": "gpt-4"
}
```

### Using Local AI (Ollama)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Start Ollama service
ollama serve

# Configure in ScenarioForge Settings
```

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed instructions.

## 🏗️ Architecture

```
scenario-forge/
├── src/
│   ├── main/           # Electron main process
│   │   ├── database.ts # Local JSON database
│   │   ├── ai-service.ts # AI provider integrations
│   │   └── file-service.ts # Export functionality
│   ├── renderer/       # React UI
│   │   ├── components/ # UI components
│   │   └── store/     # State management (Zustand)
│   └── shared/        # Shared types and utilities
├── dist/              # Build output
└── release/          # Distribution packages
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development mode
npm run build        # Build for production
npm run dist         # Create distribution packages
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Electron + Node.js
- **State Management**: Zustand
- **Database**: JSON-based local storage
- **Build Tools**: Vite + electron-builder

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain type safety throughout
- Write clear commit messages
- Update documentation as needed
- Test with both cloud and local AI providers

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://reactjs.org/) - UI library
- [Material-UI](https://mui.com/) - Component library
- [Ollama](https://ollama.ai/) - Local AI model support
- [OpenAI](https://openai.com/) - GPT models
- All contributors and users of ScenarioForge

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/scenario-forge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/scenario-forge/discussions)

---

**Transform learning concepts into engaging case studies in minutes!** 🚀