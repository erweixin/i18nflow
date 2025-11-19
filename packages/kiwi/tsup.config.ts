import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'plugin-rspack': 'src/plugin-rspack.ts',
    'plugin-rsbuild': 'src/plugin-rsbuild.ts',
    'plugin-vite': 'src/plugin-vite.ts',
    'runtime/debug-ui-injector': 'src/runtime/debug-ui-injector.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  external: [
    '@babel/core',
    '@babel/parser',
    '@babel/traverse',
    '@babel/generator',
    '@babel/types',
    'babel-loader',
    'react',
    'react-dom',
    'react-dom/client',
    'vite',
    'fs',
    'path',
    'http',
  ],
  // runtime/debug-ui-injector 需要将 @i18nflow/ui-vanilla 打包进去
  // 因为它在浏览器端运行，用户项目可能没有直接安装 ui-vanilla
  noExternal: ['@i18nflow/ui-vanilla', '@i18nflow/core', '@i18nflow/shared'],
});
