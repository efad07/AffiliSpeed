
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Vercel/Node uses process.env, but browser doesn't. 
      // This polyfills process.env.API_KEY for the geminiService.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevents "process is not defined" crashes in some libraries
      'process.env': {}
    }
  };
});
