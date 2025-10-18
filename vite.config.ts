import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// 🚀 Чистая конфигурация без Lovable
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});