# 🤖 Ollama Integration - Local AI for ScenarioForge

## What is Ollama?

Ollama allows you to run large language models locally on your machine, providing:
- **Complete Privacy** - No data sent to external services
- **Offline Operation** - Works without internet connection
- **No API Costs** - Free to use once installed
- **Fast Generation** - Local processing (depending on your hardware)

## Installation & Setup

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

### 2. Install Models

**Popular models for case study generation:**

```bash
# Llama 2 (7B) - Good balance of quality and speed
ollama pull llama2

# Llama 2 13B - Better quality, slower
ollama pull llama2:13b

# Code Llama - Specialized for technical content
ollama pull codellama

# Mistral - Fast and efficient
ollama pull mistral

# Phi-2 - Lightweight, good for basic tasks
ollama pull phi
```

### 3. Start Ollama Service

```bash
ollama serve
```
Keep this running in a terminal.

### 4. Configure in ScenarioForge

1. **Open ScenarioForge**
2. **Go to Settings** → **AI Configuration**
3. **Expand "Ollama Configuration (Local AI)"**
4. **Test Connection** - should show ✅ if Ollama is running
5. **Load Models** - discovers all installed models
6. **Select Default Model** from the dropdown
7. **Save Settings**

### 5. Set as Primary Provider (Optional)

In Settings → AI Configuration:
- Set **Primary AI Provider** to "Ollama (Local AI)"
- This makes Ollama the default for all generation

## Usage

### Generate with Ollama
1. **Configure Ollama** as above
2. **Go to Generate tab**
3. **You'll see "Using: Ollama (Local)" chip**
4. **Fill in case study details**
5. **Click Generate** - processing happens locally!

### Switch Between Providers
- Change **Primary AI Provider** in Settings
- Or manually select provider per generation (future feature)

## Performance Tips

### Hardware Requirements
- **Minimum**: 8GB RAM for 7B models
- **Recommended**: 16GB+ RAM for 13B models
- **GPU**: NVIDIA GPU with CUDA support (optional but faster)

### Model Recommendations

| Model | Size | Quality | Speed | Best For |
|-------|------|---------|-------|----------|
| `phi` | 1.3GB | Good | Very Fast | Simple case studies |
| `llama2` | 3.8GB | Excellent | Fast | General use |
| `mistral` | 4.1GB | Excellent | Fast | Business scenarios |
| `llama2:13b` | 7.3GB | Outstanding | Slower | Complex academic content |
| `codellama` | 3.8GB | Good | Fast | Technical/IT scenarios |

### Optimize Performance
```bash
# Use GPU acceleration (if available)
ollama run llama2 --gpu

# Check model info
ollama show llama2

# Update models
ollama pull llama2
```

## Configuration Options

### Custom Endpoint
If running Ollama on different port/server:
```
Default: http://localhost:11434
Custom: http://your-server:11434
```

### Model Parameters
Ollama uses optimized parameters, but you can customize:
- **Temperature**: 0.7 (creativity level)
- **Top P**: 0.9 (response diversity)
- **Top K**: 40 (token selection)

## Troubleshooting

### "Cannot connect to Ollama"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve

# Check firewall/port access
```

### "No models available"
```bash
# Install a model
ollama pull llama2

# List installed models
ollama list

# Refresh models in ScenarioForge settings
```

### Slow Performance
1. **Use smaller models** (phi, llama2 vs llama2:13b)
2. **Close other applications** to free RAM
3. **Use GPU acceleration** if available
4. **Increase system RAM** if possible

### Out of Memory
```bash
# Use smaller model
ollama pull phi

# Or add swap space (Linux/macOS)
sudo swapon --show
```

## Privacy & Security

### Local Processing
- ✅ All data stays on your machine
- ✅ No internet required after setup
- ✅ No API keys or accounts needed
- ✅ Complete control over your data

### Data Storage
- Models stored in: `~/.ollama/models/`
- No conversation history kept
- Case studies only saved in ScenarioForge database

## Advanced Usage

### Custom Models
```bash
# Import custom model
ollama create my-model -f Modelfile

# Use custom model in ScenarioForge
# (select from model dropdown)
```

### Docker Deployment
```bash
# Run Ollama in container
docker run -d -v ollama:/root/.ollama -p 11434:11434 ollama/ollama

# Use container endpoint in ScenarioForge
# http://localhost:11434
```

### Multiple Instances
Run different models on different ports:
```bash
# Terminal 1
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Terminal 2  
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

## Comparison: Ollama vs Cloud AI

| Feature | Ollama (Local) | OpenAI/Cloud |
|---------|---------------|--------------|
| Privacy | ✅ Complete | ❌ Data shared |
| Cost | ✅ Free | ❌ Pay per use |
| Internet | ✅ Offline | ❌ Required |
| Speed | 🔄 Depends on HW | ✅ Consistent |
| Quality | 🔄 Model dependent | ✅ Very high |
| Setup | ❌ Complex | ✅ Simple |

## Getting Help

### Ollama Resources
- **Documentation**: https://ollama.ai/docs
- **GitHub**: https://github.com/jmorganca/ollama
- **Models**: https://ollama.ai/library

### ScenarioForge Support
- Test connection in Settings
- Check console for error messages
- Ensure models are loaded
- Verify endpoint configuration

## Quick Start Checklist

- [ ] Install Ollama
- [ ] Pull a model: `ollama pull llama2`
- [ ] Start service: `ollama serve`
- [ ] Configure in ScenarioForge Settings
- [ ] Test connection ✅
- [ ] Load models
- [ ] Generate your first local case study! 🎉

Enjoy private, local AI-powered case study generation! 🚀