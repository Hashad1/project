import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    }
  },
  resolve: {
    alias: {
      'pdfjs-dist': 'pdfjs-dist/build/pdf'
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
    cors: true,
    force: true,
    hmr: {
      clientPort: 3000
    }
  }
});
