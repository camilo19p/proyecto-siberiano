import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDocker = env.DOCKER_ENV === 'true' || process.env.DOCKER_ENV === 'true'
  const apiUrl = env.API_URL || process.env.API_URL || 'http://localhost:3001'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      // Deshabilitar HMR en Docker para evitar problemas
      hmr: isDocker ? false : true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          ws: true,
        }
      }
    }
  }
})