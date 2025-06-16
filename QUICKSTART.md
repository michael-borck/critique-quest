# 🚀 CritiqueQuest - Quick Start Guide

*Every case, a new discovery*

## Prerequisites

- **Node.js 18+** installed on your system
- **npm** package manager

## Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd critiquequest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

## Running the Application

### Option 1: Simple Development Mode (Recommended)
```bash
npm run dev
```

This will:
- Start the React development server (Vite)
- Build the Electron main process
- Launch the desktop application with sandbox disabled

### Option 2: Manual Steps (If Option 1 fails)

1. **Start the frontend server:**
   ```bash
   npm run dev:renderer
   ```
   Wait for "Local: http://localhost:3000/" message

2. **In a new terminal, build and start Electron:**
   ```bash
   npm run build:main
   npx electron dist/main.js
   ```

### Option 3: Production Build
```bash
npm run build
npm run dist
```

## First Time Setup

1. **Launch the application** using one of the methods above
2. **Go to Settings** (gear icon in sidebar)
3. **Choose your AI approach:**

### Option A: Cloud AI (Quick Start)
   - **OpenAI**: Get API key from https://platform.openai.com/api-keys
   - **Google**: Get API key from https://ai.google.dev/
   - **Anthropic**: Get API key from https://console.anthropic.com/
   - Enter your chosen API key in Settings → AI Configuration

### Option B: Local AI (Privacy-First)
   - Install [Ollama](https://ollama.ai) on your system
   - Pull a model: `ollama pull llama2` (or `mistral`, `codellama`)
   - Start Ollama service: `ollama serve`
   - In CritiqueQuest Settings, select "Ollama" as provider

4. **Configure default settings** (optional)

## Using CritiqueQuest

### 📚 For Educators: Create Your First Case Study

1. Click **"Generate"** in the sidebar
2. Configure your educational scenario:
   - **Domain**: Choose your subject area (Business, Healthcare, Technology, etc.)
   - **Complexity**: Select appropriate difficulty for your students
   - **Scenario Type**: Problem-solving, Decision-making, Ethical dilemma
   - **Context**: Describe the learning objectives and scenario setting
3. Click **"Generate Case Study"**
4. Review the generated content for educational quality
5. Save to your library with appropriate tags
6. Export for course materials (PDF, Word, HTML)

### 🎓 For Students: Begin Your Discovery Journey

1. **Access Content**: 
   - Import case studies from your instructor, or
   - Generate your own practice scenarios
2. **Organize**: Use the Library to manage your learning materials
3. **Practice**: Click "Practice" on any case study to begin self-assessment
4. **Learn**: Work through guided questions and compare with model answers
5. **Track Progress**: Review your analytical development over time

## Your First Discovery Session

### Quick Tutorial: Generate a Sample Case Study

1. **Navigate to Generate** 
2. **Try these sample settings:**
   - Domain: "Business Ethics"
   - Complexity: "Intermediate" 
   - Context: "A mid-sized tech company facing a privacy dilemma"
3. **Generate and explore** the structured case study
4. **Save to Library** and add tags like "ethics" and "technology"
5. **Enter Practice Mode** to experience the self-assessment flow

### Organize Your Learning Library

1. Click **"Library"** to view your saved case studies
2. **Search and filter** to find content quickly
3. **Star favorites** for easy access
4. **Add custom tags** for better organization
5. **Export collections** in your preferred format

### Experience Practice Mode

1. Select any case study from your library
2. Click **"Practice"** to start your analytical journey
3. **Work through questions** step-by-step with optional timer
4. **Take notes** using the built-in editor
5. **Compare insights** with AI-generated model answers
6. **Track your progress** and reflection over time

## Troubleshooting

### Common Issues

**Application won't start:**
- Ensure Node.js 18+ is installed: `node --version`
- Try `npm install` again to refresh dependencies
- Check terminal for specific error messages

**AI generation fails:**
- **Cloud AI**: Verify API key is correctly entered in Settings
- **Local AI**: Ensure Ollama is running (`ollama serve`) and model is pulled
- Check internet connection for cloud providers
- Verify you have API credits/quota remaining

**Build errors:**
- Run `npm run build` to check for TypeScript errors
- Try deleting `node_modules` and running `npm install` again
- Ensure all dependencies are compatible

### Getting Help

1. **Check console output** for detailed error messages
2. **Verify AI configuration** in Settings panel
3. **Test with different AI providers** if one fails
4. **Review documentation** in the `/docs` folder

## Development Commands

```bash
# Development mode (hot reload)
npm run dev

# Build application for production
npm run build

# Type checking only
npm run typecheck

# Code linting
npm run lint

# Create distribution packages
npm run dist
```

## Advanced Setup

### For Educational Institutions

- **Privacy Considerations**: Use local AI (Ollama) for sensitive content
- **Batch Deployment**: Configure default settings in institution package
- **Content Sharing**: Set up shared network drives for case study libraries
- **Assessment Integration**: Export to formats compatible with your LMS

### For Individual Learners

- **Study Groups**: Share case studies via export/import
- **Exam Preparation**: Create subject-specific practice libraries  
- **Skill Development**: Track progress across different domains
- **Portfolio Building**: Export your best analytical work

## Next Steps - Begin Your Quest

1. **🎯 Set Learning Goals**: Identify subjects or skills you want to develop
2. **📚 Build Your Library**: Generate or import relevant case studies
3. **🏃‍♂️ Start Practicing**: Use Practice Mode for regular skill development
4. **📈 Track Progress**: Monitor your analytical growth over time
5. **🤝 Share Discoveries**: Export and discuss insights with peers or students

## Features Overview

✅ **AI-Powered Generation** - Create case studies with GPT-4, Gemini, Claude, or local models  
✅ **Privacy Options** - Choose between cloud convenience or local privacy  
✅ **Educational Focus** - Designed for both teaching and learning  
✅ **Practice Mode** - Self-assessment with guided analysis  
✅ **Export Flexibility** - PDF, Word, HTML, Text formats  
✅ **Quality Control** - Automated validation for educational content  
✅ **Progress Tracking** - Monitor learning journey and development  

## Quick Reference: AI Provider Setup

| Provider | Setup Steps | Best For |
|----------|-------------|----------|
| **OpenAI** | Get API key → Enter in Settings | General educational content |
| **Google Gemini** | Get API key → Configure in Settings | Research-heavy scenarios |
| **Anthropic Claude** | Get API key → Add to Settings | Ethical reasoning, analysis |
| **Ollama (Local)** | Install → Pull model → Start service | Privacy-sensitive content |

---

**Ready to embark on your analytical journey?** Every case study awaits as a new discovery! 🎓✨