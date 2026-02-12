import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [ vue(), tailwindcss() ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@phone-input-kz/index.ts': resolve(__dirname, '../../dist/index.es'),
      '@phone-input-kz': resolve(__dirname, '../../dist'),
    },
  },
});
