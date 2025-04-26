import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCase",
      scopeBehavior: "local",
    },
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "@/assets/styles/abstracts/variables.scss";`
      },
    },
  },
  base: '/SpaceZone---Social-Media/',
  define: {
    "process.env": {},
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
});
