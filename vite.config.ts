import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Points at the module root, not `src`, so shadcn/ReUI's own
      // `@/components/ui/...` and `@/lib/utils` imports resolve to the
      // folders this app already keeps them in.
      '@': fileURLToPath(new URL('./src/tenant', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy third-party layers so a screen change never
        // re-downloads the chart engine or the primitives.
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], charts: ['recharts'], icons: ['lucide-react'] },
      },
    },
  },
  server: { port: 5173 },
});
