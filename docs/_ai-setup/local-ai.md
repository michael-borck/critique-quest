---
layout: default
title: "Local AI Setup (Ollama)"
description: "Complete guide to setting up local AI with Ollama for privacy-focused case study generation"
nav_order: 2
parent: AI Setup
---

# Local AI Setup with Ollama
{: .no_toc }

Complete privacy and security with local AI model execution.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Why Choose Local AI?

Local AI with Ollama provides several key advantages for educational institutions and privacy-conscious users:

**🔒 Complete Privacy**
- No data sent to external servers
- Full control over sensitive educational content
- Compliance with institutional data policies
- GDPR and FERPA compliance by design

**💰 Cost Effective**
- No per-request API costs
- Unlimited case study generation
- One-time setup, ongoing savings
- Perfect for budget-conscious institutions

**🌐 Offline Capability**
- Works without internet connection
- Reliable operation in any environment
- No dependency on external service availability
- Ideal for secure or isolated networks

**⚖️ Educational Control**
- Full oversight of AI model behavior
- Customizable model selection
- Educational content stays internal
- Institutional policy compliance

## Ollama Installation

### System Requirements

**Minimum Requirements:**
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space for models
- **CPU**: Modern multi-core processor
- **OS**: Windows 10+, macOS 10.15+, or Linux

**Recommended for Best Performance:**
- **RAM**: 16-32GB for larger models
- **GPU**: NVIDIA RTX series with 8GB+ VRAM (optional but faster)
- **Storage**: SSD for faster model loading
- **Network**: Good internet for initial model downloads

### Installation by Operating System

#### Windows Installation

1. **Download Ollama**
   ```
   Visit: https://ollama.ai/download
   Download: OllamaSetup.exe
   ```

2. **Install and Setup**
   - Run the installer as Administrator
   - Follow installation wizard
   - Ollama will start automatically as a Windows service

3. **Verify Installation**
   ```cmd
   # Open Command Prompt or PowerShell
   ollama --version
   
   # Should output: ollama version 0.x.x
   ```

#### macOS Installation

1. **Using Direct Download**
   ```bash
   # Download from website
   # Visit: https://ollama.ai/download
   # Download: Ollama-darwin.zip
   ```

2. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if needed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Ollama
   brew install ollama
   ```

3. **Using curl (Alternative)**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

#### Linux Installation

1. **Universal Install Script**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Manual Installation (Ubuntu/Debian)**
   ```bash
   # Add Ollama repository
   curl -fsSL https://ollama.ai/gpg | sudo gpg --dearmor -o /usr/share/keyrings/ollama-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/ollama-keyring.gpg] https://ollama.ai/packages/deb stable main" | sudo tee /etc/apt/sources.list.d/ollama.list
   
   # Update and install
   sudo apt update
   sudo apt install ollama
   ```

3. **Start Ollama Service**
   ```bash
   # Start service
   sudo systemctl start ollama
   
   # Enable auto-start
   sudo systemctl enable ollama
   ```

## Model Selection and Download

### Recommended Models for Education

| Model | Size | Best For | Performance | Educational Use |
|-------|------|----------|-------------|-----------------|
| **llama2:7b** | 3.8GB | General use, beginner | Fast | ✅ Recommended starter |
| **llama2:13b** | 7.3GB | Balanced quality/speed | Medium | ✅ Best balance |
| **mistral:7b** | 4.1GB | Efficient, focused | Fast | ✅ Quick responses |
| **llama2:70b** | 39GB | Highest quality | Slow | 🎯 Advanced institutions |
| **codellama:7b** | 3.8GB | Programming cases | Fast | 💻 Technical subjects |

### Downloading Models

**Start Ollama Service First**
```bash
# Ensure Ollama is running
ollama serve

# In a new terminal, download models
```

**Download Recommended Models**
```bash
# Essential starter model (fast, good quality)
ollama pull llama2:7b

# Higher quality model (if you have resources)
ollama pull llama2:13b

# Specialized for coding/technical content
ollama pull codellama:7b

# Efficient alternative
ollama pull mistral:7b
```

**Check Available Models**
```bash
# List downloaded models
ollama list

# View model information
ollama show llama2:7b
```

### Model Performance Tuning

**Memory Optimization**
```bash
# Set model memory usage (Linux/macOS)
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1

# Windows PowerShell
$env:OLLAMA_NUM_PARALLEL=1
$env:OLLAMA_MAX_LOADED_MODELS=1
```

**GPU Acceleration (NVIDIA)**
```bash
# Enable GPU support (automatically detected)
# Ensure NVIDIA drivers and CUDA are installed
nvidia-smi  # Verify GPU availability

# Ollama will automatically use GPU if available
ollama run llama2:7b
```

## CritiqueQuest Configuration

### Connecting to Ollama

1. **Start Ollama Service**
   ```bash
   # Ensure Ollama is running
   ollama serve
   
   # Should see: "Ollama is running on http://localhost:11434"
   ```

2. **Configure CritiqueQuest**
   - Open CritiqueQuest
   - Go to Settings → AI Configuration
   - Select "Ollama" as AI Provider
   - Configure settings:

   ```
   Provider: Ollama
   Model: llama2:7b (or your preferred model)
   Endpoint: http://localhost:11434
   API Key: (leave blank for local Ollama)
   ```

3. **Test Configuration**
   - Try generating a simple case study
   - Verify AI responses are working
   - Check response quality and speed

### Model Switching

**Change Active Model**
```bash
# Switch to different model
ollama run llama2:13b

# Or load specific model
ollama pull mistral:latest
```

**In CritiqueQuest Settings**
- Update Model field to match your active Ollama model
- Test generation to ensure compatibility
- Save configuration for future use

## Troubleshooting Common Issues

### Ollama Service Issues

**Service Not Starting**
```bash
# Check if Ollama is running
ps aux | grep ollama  # Linux/macOS
tasklist | findstr ollama  # Windows

# Restart Ollama service
# Linux:
sudo systemctl restart ollama

# macOS/Windows:
ollama serve
```

**Port Conflicts**
```bash
# Check what's using port 11434
lsof -i :11434  # Linux/macOS
netstat -ano | findstr 11434  # Windows

# Change Ollama port if needed
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

### Model Download Problems

**Slow Download Speeds**
```bash
# Resume interrupted downloads
ollama pull llama2:7b  # Will resume if partially downloaded

# Check available disk space
df -h  # Linux/macOS
dir  # Windows
```

**Out of Memory Errors**
```bash
# Check system memory
free -h  # Linux
top  # macOS
wmic OS get TotalVisibleMemorySize /value  # Windows

# Use smaller model if needed
ollama pull llama2:7b  # Instead of 13b or 70b
```

### Performance Optimization

**Slow Generation Speed**
1. **Use Smaller Models**
   - Switch from 13b to 7b model
   - Try mistral:7b for faster responses
   - Consider model-specific trade-offs

2. **System Optimization**
   ```bash
   # Close unnecessary applications
   # Ensure adequate RAM available
   # Use SSD storage for models
   # Enable GPU acceleration if available
   ```

3. **Model Configuration**
   ```bash
   # Optimize for speed over quality
   ollama run llama2:7b --temperature 0.7 --top_p 0.9
   ```

### Network and Connectivity

**Cannot Connect to Ollama**
1. **Verify Service Status**
   ```bash
   # Check if service is running
   curl http://localhost:11434/api/version
   
   # Should return version information
   ```

2. **Firewall Configuration**
   - Ensure port 11434 is accessible
   - Add Ollama to firewall exceptions
   - Check corporate network restrictions

3. **CritiqueQuest Configuration**
   - Verify endpoint URL in settings
   - Ensure model name matches exactly
   - Test with simple generation request

## Educational Institution Deployment

### Institutional Setup Strategies

**🏫 Centralized Server Deployment**

**Benefits:**
- Shared computational resources
- Centralized management and updates
- Consistent model availability
- Better resource utilization

**Setup Process:**
1. **Server Configuration**
   ```bash
   # Install on dedicated server
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Configure for network access
   OLLAMA_HOST=0.0.0.0:11434 ollama serve
   
   # Download institutional models
   ollama pull llama2:13b
   ollama pull mistral:7b
   ```

2. **Client Configuration**
   - Configure CritiqueQuest on each workstation
   - Point to central server IP address
   - Test connectivity and performance

**🖥️ Distributed Deployment**

**Benefits:**
- Local processing power utilization
- No network dependency
- Individual customization possible
- Reduced server load

**Setup Process:**
1. **Standard Installation** on each machine
2. **Automated Configuration** using deployment scripts
3. **Model Standardization** across institution
4. **Support Documentation** for users

### Security and Privacy Considerations

**🔒 Data Protection**

**Local Processing Benefits:**
- Educational content never leaves institutional network
- Student data remains completely private
- Compliance with educational data protection laws
- No external vendor data sharing agreements needed

**Network Security:**
```bash
# Restrict Ollama to local network only
OLLAMA_HOST=127.0.0.1:11434 ollama serve

# Or allow specific network range
OLLAMA_HOST=192.168.1.0/24:11434 ollama serve
```

**📋 Policy Compliance**

**FERPA Compliance:**
- Student educational records remain on-premises
- No third-party data processing agreements required
- Full institutional control over AI interactions
- Audit trail available for all AI usage

**GDPR Compliance:**
- No personal data transmitted externally
- Local processing ensures data locality
- Right to erasure easily implemented
- Data processing transparency maintained

### Resource Planning

**💻 Hardware Sizing Guide**

**Small Institution (50-100 users):**
- **Server**: 32GB RAM, 8-core CPU, 1TB SSD
- **Model**: llama2:7b or mistral:7b
- **Expected Performance**: 2-5 second responses

**Medium Institution (100-500 users):**
- **Server**: 64GB RAM, 16-core CPU, 2TB SSD, GPU
- **Model**: llama2:13b
- **Expected Performance**: 3-8 second responses

**Large Institution (500+ users):**
- **Multiple Servers**: Load balancing with Ollama clusters
- **Models**: Mix of 7b and 13b models
- **Infrastructure**: Kubernetes deployment with auto-scaling

**📊 Usage Monitoring**

**Resource Monitoring Scripts:**
```bash
#!/bin/bash
# monitor-ollama.sh

# Check Ollama status
echo "Ollama Status:"
curl -s http://localhost:11434/api/version

# Monitor system resources
echo "Memory Usage:"
free -h

echo "CPU Usage:"
top -bn1 | grep "Cpu(s)"

echo "Disk Usage:"
df -h /var/lib/ollama
```

## Best Practices and Maintenance

### Model Management

**🔄 Regular Updates**
```bash
# Update Ollama software
# Linux:
sudo apt update && sudo apt upgrade ollama

# macOS:
brew upgrade ollama

# Update models
ollama pull llama2:7b
ollama pull mistral:latest
```

**🧹 Storage Management**
```bash
# Remove unused models
ollama rm old-model:version

# Check model sizes
ollama list

# Clean up temporary files
docker system prune  # If using Docker installation
```

### Performance Monitoring

**📈 Usage Analytics**

**System Performance Tracking:**
```bash
# Monitor Ollama logs
tail -f ~/.ollama/logs/server.log

# Track response times
time ollama run llama2:7b "Generate a short business case study"

# Monitor system resources during peak usage
htop  # Interactive process viewer
```

**Educational Metrics:**
- Case study generation frequency
- Average response times by model
- User satisfaction with AI quality
- Educational outcome improvements

### Backup and Recovery

**💾 Data Protection**

**Model Backup:**
```bash
# Backup downloaded models
cp -r ~/.ollama /backup/ollama-models/

# Or create archive
tar -czf ollama-backup.tar.gz ~/.ollama
```

**Configuration Backup:**
- Save CritiqueQuest AI configuration settings
- Document institutional deployment settings
- Maintain model selection documentation
- Keep troubleshooting procedures updated

---

## Conclusion: Educational AI Independence

Local AI with Ollama represents a significant step toward educational technology independence. By hosting AI capabilities on-premises, institutions gain:

- **🔐 Complete data sovereignty** over educational content
- **💰 Long-term cost sustainability** without per-use fees  
- **🚀 Scalable infrastructure** that grows with institutional needs
- **🎯 Educational focus** without external commercial interests

**🎓 Getting Started Recommendations:**

1. **Start Small**: Begin with one course or department
2. **Choose Appropriate Models**: Balance quality with available resources
3. **Monitor Performance**: Track both technical and educational metrics
4. **Plan for Growth**: Design infrastructure that can scale
5. **Maintain Documentation**: Keep setup and troubleshooting guides current

**🔄 Continuous Improvement:**
- Regular model updates and testing
- User feedback collection and analysis
- Performance optimization based on usage patterns
- Security review and compliance verification

With local AI properly configured, CritiqueQuest becomes a powerful, private, and cost-effective tool for transforming case-based education while maintaining complete institutional control over sensitive educational data.