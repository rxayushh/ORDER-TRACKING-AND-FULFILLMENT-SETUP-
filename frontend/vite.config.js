import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react';
          if (/\/(recharts|d3-[^/]+|victory-vendor)\//.test(id)) return 'vendor-charts';
          if (id.includes('/lucide-react/')) return 'vendor-icons';
          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true
  }
});
