import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'plugin-next': 'src/plugin-next.ts',
    'plugin-vite': 'src/plugin-vite.ts',
    'babel-plugin': 'src/transform/babel-plugin.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'i18next', 'react-i18next', 'next'],
  treeshake: true,
  minify: false,
});
