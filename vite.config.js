import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    headers: {
      "X-Content-Type-Options": "nosniff"
    }
  },
  preview: {
    headers: {
      "X-Content-Type-Options": "nosniff"
    }
  }
});
