import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  external: ['react', 'antd', '@ant-design/icons'],
  // 在打包文件顶部添加 'use client' 指令，用于 Next.js App Router
  banner: {
    js: "'use client';",
  },
});
