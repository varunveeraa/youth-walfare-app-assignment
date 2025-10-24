#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Fix paths in index.html for static hosting
const indexPath = join(process.cwd(), 'dist', 'index.html');

try {
  let content = readFileSync(indexPath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');
  
  // Update title
  content = content.replace(/<title>.*<\/title>/, '<title>MindBridge - Youth Wellness Platform</title>');
  
  writeFileSync(indexPath, content);
  console.log('✅ Fixed paths in index.html for static hosting');
} catch (error) {
  console.error('❌ Error fixing paths:', error.message);
  process.exit(1);
}
