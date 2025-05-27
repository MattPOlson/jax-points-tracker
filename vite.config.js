import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	preview: {
    port: 8080,
    host: true,
    allowedHosts: ['*'] // or specifically your run.app domain
  }
	}); 