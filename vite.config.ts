import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    // Optimize build output
    minify: 'terser',
    sourcemap: false, // Set to 'hidden' in production for error tracking
    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term caching and smaller initial load
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['motion', 'lucide-react'],
        },
      },
    },
  },
});
