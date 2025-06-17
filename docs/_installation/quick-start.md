---
layout: default
title: "Quick Start Guide"
description: "Get CritiqueQuest running in under 10 minutes"
nav_order: 1
parent: Installation
---

# Quick Start Guide
{: .no_toc }

Get CritiqueQuest up and running in under 10 minutes.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** package manager (included with Node.js)
- **4GB RAM** minimum (8GB recommended)
- **500MB** free disk space

## Step 1: Download & Install

### Option A: Download Release (Recommended)
1. Visit [CritiqueQuest Releases](https://github.com/michael-borck/critquie-quest/releases)
2. Download the latest version for your operating system:
   - **Windows**: `CritiqueQuest-Setup-x.x.x.exe`
   - **macOS**: `CritiqueQuest-x.x.x.dmg`
   - **Linux**: `CritiqueQuest-x.x.x.AppImage`
3. Install and launch the application

### Option B: Build from Source
```bash
# Clone the repository
git clone https://github.com/michael-borck/critquie-quest.git
cd critquie-quest

# Install dependencies
npm install

# Start development mode
npm run dev
```

## Step 2: Choose Your AI Provider

CritiqueQuest supports multiple AI providers. Choose the option that best fits your needs:

### 🌐 Cloud AI (Easiest Setup)

**For OpenAI (Recommended for beginners):**
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In CritiqueQuest: Settings → AI Configuration
3. Select "OpenAI" as provider
4. Enter your API key
5. Choose model (GPT-4 recommended)

**For Other Cloud Providers:**
- **Google Gemini**: Get key from [Google AI Studio](https://ai.google.dev/)
- **Anthropic Claude**: Get key from [Anthropic Console](https://console.anthropic.com/)

### 🔒 Local AI (Privacy-Focused)

**Setup Ollama for local AI:**
```bash
# Install Ollama (Linux/macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download

# Pull a model (choose one)
ollama pull llama2          # Good balance of speed/quality
ollama pull mistral         # Faster, good for simple cases
ollama pull llama2:13b      # Higher quality, slower

# Start Ollama service
ollama serve
```

**Configure in CritiqueQuest:**
1. Settings → AI Configuration
2. Select "Ollama" as provider
3. Model: Enter the model you pulled (e.g., "llama2")
4. Endpoint: Use default `http://localhost:11434`

## Step 3: Create Your First Case Study

### Quick Tutorial
1. **Click "Generate"** in the sidebar
2. **Configure your case study:**
   - **Category**: Choose "Business & Management"
   - **Discipline**: Select "Entrepreneurship" (optional)
   - **Complexity**: "Intermediate"
   - **Scenario Type**: "Problem-solving"
   - **Context**: "A startup facing a critical funding decision"

3. **Click "Generate Case Study"**
4. **Review the generated content**
5. **Save to your library** with tags like "startup" and "funding"

### Try "I'm Feeling Lucky"
For instant results, click **"I'm Feeling Lucky"** to automatically:
- Select random educational parameters
- Generate AI context suggestions
- Create a complete case study
- Perfect for exploring CritiqueQuest's capabilities!

## Step 4: Explore Practice Mode

1. **Go to Library** to see your saved case study
2. **Click "Practice"** on any case study
3. **Experience the guided analysis:**
   - Work through structured questions
   - Take notes with the built-in editor
   - Optional timer for focused sessions
   - Compare with AI-generated insights

## Step 5: Organize Your Content

### Library Management
- **Search** across all case studies
- **Filter** by category, complexity, or favorites
- **Add tags** for better organization
- **Star favorites** for quick access

### Collections
- **Create collections** for specific courses or topics
- **Drag and drop** to organize content
- **Share collections** via export features

## Verification Checklist

✅ **CritiqueQuest launches successfully**  
✅ **AI provider configured and working**  
✅ **Generated at least one case study**  
✅ **Saved content to library**  
✅ **Tested practice mode**  
✅ **Explored library organization features**

## Common Quick Start Issues

### Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Reinstall dependencies
npm install

# Try building first
npm run build
npm run dev
```

### AI Generation Fails
- **Cloud AI**: Verify API key is correct and has credits
- **Local AI**: Ensure Ollama is running (`ollama serve`)
- **Network**: Check internet connection for cloud providers

### Permission Errors (Linux/macOS)
```bash
# Make sure you have write permissions
chmod +x critiquequest.AppImage  # For Linux AppImage
```

## Next Steps

Now that CritiqueQuest is working:

1. **📚 [Read the Student Guide](/guides/students/)** - Learn effective practice strategies
2. **👨‍🏫 [Explore Educator Features](/guides/educators/)** - Integrate into your curriculum  
3. **⚙️ [Configure Advanced Settings](/technical/configuration/)** - Customize for your needs
4. **🎯 [Learn Best Practices](/workflows/)** - Maximize educational value

## Getting Help

- **📖 [Detailed Setup Guide](/installation/detailed-setup/)** - Comprehensive installation instructions
- **🔧 [Troubleshooting](/installation/troubleshooting/)** - Common issues and solutions
- **💬 [Community Support](https://github.com/michael-borck/critquie-quest/discussions)** - Ask questions and share tips
- **🐛 [Report Issues](https://github.com/michael-borck/critquie-quest/issues)** - Bug reports and feature requests

---

**🎉 Congratulations!** You're now ready to transform learning concepts into engaging case studies. Every case study is a new discovery waiting to happen!