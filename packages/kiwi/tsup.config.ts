import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'plugin-rspack': 'src/plugin-rspack.ts',
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
    'fs',
    'path',
    'http',
  ],
});
