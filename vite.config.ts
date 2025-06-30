import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/admin/, to: '/index.html' },
        { from: /^\/save-the-date/, to: '/index.html' },
        { from: /^\/confirm/, to: '/index.html' },
        { from: /^\/raffle/, to: '/index.html' },
        { from: /^\/padrinhos/, to: '/index.html' },
        { from: /^\/login/, to: '/index.html' },
        { from: /^\/party-gallery/, to: '/index.html' },
      ]
    },
    proxy: {
      '/storage': {
        target: 'https://firebasestorage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storage/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
