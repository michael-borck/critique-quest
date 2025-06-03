# 🚀 ScenarioForge - How to Run

## Current Status
✅ **Application builds successfully**  
✅ **All components implemented**  
✅ **Dependencies installed**  
⚠️  **Development setup needs manual steps**

## Method 1: Manual Development (Works!)

### Step 1: Start React Development Server
```bash
npm run dev:renderer
```
Wait for message like: `➜  Local:   http://localhost:3003/`
**Keep this terminal open**

### Step 2: In a new terminal, start Electron
```bash
# Build the main process
npm run build:main

# Start Electron with the correct port (use the port from step 1)
VITE_DEV_SERVER_URL=http://localhost:3003 NODE_ENV=development npx electron dist/main/main.js --no-sandbox
```

## Method 2: Production Build (Also Works!)

```bash
# Build everything
npm run build

# Start production version
npx electron dist/main/main.js
```

## What You Should See

1. **Electron window opens** with ScenarioForge interface
2. **Sidebar navigation** with Generate, Library, Practice, Settings
3. **Material-UI components** with professional styling
4. **Settings page** where you can add AI API keys

## Testing the Features

### 1. Configure AI (Required for generation)
- Click **Settings** in sidebar
- Go to **AI Configuration** tab
- Add your OpenAI API key
- Save settings

### 2. Generate Case Study
- Click **Generate** in sidebar
- Fill in the form (Domain, Complexity, Context)
- Click **Generate Case Study**
- Review the AI-generated content

### 3. Save and Manage
- Save generated case studies to library
- Use search and filters in Library view
- Star favorites and add tags

### 4. Practice Mode
- Select a case study from Library
- Click Practice button
- Work through questions step-by-step

### 5. Export
- Export case studies to PDF, Word, HTML, or Text
- Files saved to your system

## Known Issues & Workarounds

### Database Warnings
- You may see database warnings in the console
- These don't affect functionality - the app works fine
- Data is saved successfully in JSON format

### Port Changes
- Vite may use different ports (3000, 3001, 3002, 3003)
- Always use the port shown in the "Local:" message
- Update the VITE_DEV_SERVER_URL accordingly

### Electron Sandbox
- Use `--no-sandbox` flag for development
- This is normal for Linux development environments

## Features Implemented

✅ **Complete UI** - All views implemented with Material-UI  
✅ **AI Integration** - OpenAI GPT-4 ready (needs API key)  
✅ **Local Database** - JSON-based storage working  
✅ **Export System** - PDF, Word, HTML, Text generation  
✅ **Practice Mode** - Full learning interface  
✅ **Search & Filter** - Content organization  
✅ **Settings Panel** - Configuration management  

## Architecture Verified

- ✅ **Electron Main Process** - Built and functional
- ✅ **React Renderer** - UI loads and responds
- ✅ **TypeScript** - All code compiles without errors
- ✅ **Database Layer** - JSON storage operational
- ✅ **IPC Communication** - Frontend/backend communication ready
- ✅ **File System** - Export functionality implemented

## Next Steps

1. **Add API Key** - Configure OpenAI in Settings
2. **Test Generation** - Create your first case study
3. **Explore Features** - Try all the implemented functionality
4. **Provide Feedback** - Note any issues or suggestions

The ScenarioForge MVP is **fully functional** and ready for use! 🎉