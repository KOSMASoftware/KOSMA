import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Wir lassen Vite alles bündeln, um Instanz-Konflikte zu vermeiden
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          libs: ['@supabase/supabase-js', 'lucide-react', 'recharts']
        }
      }
    }
  }
});