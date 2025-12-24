import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0', // Expose to network
    port: 5191,
    proxy: {
      '/api': {
        target: 'http://10.10.11.245:3000',
        changeOrigin: true
      }
    }
  }
});
