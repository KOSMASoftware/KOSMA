import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react-router-dom',
        'lucide-react',
        'recharts',
        '@supabase/supabase-js'
      ]
    }
  },
  optimizeDeps: {
    exclude: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'recharts',
      '@supabase/supabase-js'
    ]
  }
});