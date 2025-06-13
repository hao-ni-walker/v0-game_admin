#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始静态构建（GitHub Pages 版本）...');

try {
  // 清理之前的构建
  const outDir = path.join(__dirname, '../out');
  if (fs.existsSync(outDir)) {
    console.log('🧹 清理输出目录...');
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  // 使用环境变量控制静态导出
  console.log('🔨 执行静态构建...');
  execSync('STATIC_EXPORT=true NODE_ENV=production next build', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ 静态构建完成！');
  console.log('📁 静态文件位于 out/ 目录');
  console.log('🌐 可以部署到 GitHub Pages 或其他静态托管服务');

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  console.log('\n💡 提示：静态构建会跳过 API 路由，这是正常的');
  console.log('   如果需要完整功能，请使用 pnpm build 进行常规构建');
  process.exit(1);
}

console.log('🎉 静态部署版本构建完成！'); 