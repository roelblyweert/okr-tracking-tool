import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` MUST match the GitHub Pages project path so assets resolve correctly
// when served from https://roelblyweert.github.io/claude-code-101/.
// Do not change this without updating the deploy target. See CLAUDE.md.
export default defineConfig({
  plugins: [react()],
  base: '/claude-code-101/',
});
