import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match your GitHub repo name exactly for GitHub Pages
  // project sites (https://username.github.io/reponame/).
  base: '/recipehub-frontend/',
});
