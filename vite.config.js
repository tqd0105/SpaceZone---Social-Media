import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // 📌 Hỗ trợ BrowserRouter
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
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
  base: process.env.NODE_ENV === 'production' ? '/SpaceZone---Social-Media/' : '/',
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
