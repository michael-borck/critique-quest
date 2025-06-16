#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CritiqueQuest MVP...\n');

// Start the renderer (Vite dev server)
console.log('📱 Starting React development server...');
const renderer = spawn('npm', ['run', 'dev:renderer'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for Vite to start, then build and start main process
setTimeout(() => {
  console.log('\n⚡ Building and starting Electron...');
  
  // Build main process
  const build = spawn('npm', ['run', 'build:main'], {
    stdio: 'inherit',
    shell: true
  });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Main process built successfully');
      
      // Start Electron
      const main = spawn('npx', ['electron', 'dist/main.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      main.on('close', () => {
        console.log('👋 Application closed');
        renderer.kill();
        process.exit(0);
      });
    } else {
      console.error('❌ Build failed');
      renderer.kill();
      process.exit(1);
    }
  });
}, 3000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  renderer.kill();
  process.exit(0);
});