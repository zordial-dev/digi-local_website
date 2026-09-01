import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.VITE_API_BASE_URL || 'https://digi-local-backend.onrender.com/api';
  const proxyTarget = rawTarget.replace(/\/api\/?$/, '') || 'https://digi-local-backend.onrender.com';

  return {
    base: '/',
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
