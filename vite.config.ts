import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Points at the application root, not `src`, so the shadcn/ReUI
      // convention (`@/components/...`, `@/lib/utils`) resolves to the real
      // tree at src/tenant. Kept in step with `paths` in tsconfig.json —
      // Vite resolves the bundle, TypeScript resolves the type-check, and a
      // disagreement between the two builds but fails `npm run typecheck`.
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
