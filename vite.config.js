import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss()],
  server:{
    port:3000,
  },
  // Set base to your GitHub repository name when deploying to GitHub Pages.
  // Example: base: '/frontend-internship-2025/'
  base: '/frontend-internship-2025/'
})
