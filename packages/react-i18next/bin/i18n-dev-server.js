#!/usr/bin/env node

/**
 * React-i18next Dev Server CLI
 */

const path = require('path');
const fs = require('fs');

// 尝试加载编译后的文件
const distFile = path.join(__dirname, '../dist/server/dev-server.js');
const srcFile = path.join(__dirname, '../src/server/dev-server.ts');

if (fs.existsSync(distFile)) {
  // 使用编译后的文件
  require(distFile);
} else if (fs.existsSync(srcFile)) {
  // 在 monorepo workspace 中，使用 tsx 或 ts-node 运行源文件
  console.log('ℹ️  Running from source (development mode)...');
  try {
    require('tsx/cli');
    require(srcFile);
  } catch {
    try {
      require('ts-node/register');
      require(srcFile);
    } catch {
      console.error('❌ Cannot run TypeScript file. Please build the package first:');
      console.error('   cd packages/react-i18next && npm run build');
      console.error('');
      console.error('   Or install tsx: npm install -g tsx');
      console.error('   Then run: tsx ' + srcFile);
      process.exit(1);
    }
  }
} else {
  console.error('❌ Server file not found. Please build the package:');
  console.error('   cd packages/react-i18next && npm run build');
  process.exit(1);
}
