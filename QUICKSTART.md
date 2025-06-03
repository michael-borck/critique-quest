# 🚀 ScenarioForge - Quick Start Guide

## Prerequisites

- **Node.js 18+** installed on your system
- **npm** package manager

## Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd scenario-forge
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
3. **Add your AI API key:**
   - OpenAI: Get from https://platform.openai.com/api-keys
   - Google: Get from https://ai.google.dev/
   - Anthropic: Get from https://console.anthropic.com/
4. **Configure default settings** (optional)

## Using ScenarioForge

### Generate Your First Case Study
1. Click **"Generate"** in the sidebar
2. Fill in the form:
   - **Domain**: Choose your subject area
   - **Complexity**: Select difficulty level
   - **Context**: Describe the scenario setting
3. Click **"Generate Case Study"**
4. Review and save the result

### Organize Your Library
1. Click **"Library"** to view saved case studies
2. Use search and filters to find content
3. Star favorites and add tags
4. Export to PDF, Word, or other formats

### Practice with Case Studies
1. Select a case study from your library
2. Click **"Practice"** 
3. Work through questions step-by-step
4. Compare with model answers
5. Track your progress

## Troubleshooting

### Common Issues

**Application won't start:**
- Ensure Node.js 18+ is installed
- Try `npm install` again
- Check for error messages in terminal

**AI generation fails:**
- Verify API key is correctly entered in Settings
- Check internet connection
- Ensure you have API credits/quota

**Build errors:**
- Run `npm run build` to check for TypeScript errors
- Try deleting `node_modules` and running `npm install` again

### Getting Help

1. Check the console output for error messages
2. Verify all dependencies installed correctly
3. Ensure your API keys are valid and have quota

## Development Commands

```bash
# Development mode
npm run dev

# Build application
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Create distribution
npm run dist
```

## Next Steps

1. **Generate sample content** to test the system
2. **Explore export options** for sharing
3. **Use practice mode** for self-assessment
4. **Customize settings** for your workflow

## Features Overview

✅ **AI-Powered Generation** - Create case studies with GPT-4, Gemini, or Claude  
✅ **Local Storage** - All data stays on your device  
✅ **Search & Filter** - Find content quickly  
✅ **Practice Mode** - Self-assessment with timers  
✅ **Export Options** - PDF, Word, HTML, Text  
✅ **Quality Control** - Automated validation  

Ready to transform learning concepts into engaging scenarios! 🎓