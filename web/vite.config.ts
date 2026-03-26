import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDocker = env.DOCKER_ENV === 'true' || process.env.DOCKER_ENV === 'true'
  const apiUrl = env.API_URL || process.env.API_URL || 'http://localhost:3001'
  
  // Permitir puerto alternativo desde variable de entorno
  const port = parseInt(process.env.VITE_PORT || '4173')

  return {
    plugins: [react()],
    publicDir: 'public',
    server: {
      host: '0.0.0.0',
      port: port,
      strictPort: false, // Cambiado a false para permitir puertos alternativos
      // Deshabilitar HMR en Docker para evitar problemas
      hmr: isDocker ? false : {
        host: 'localhost',
        port: port,
        protocol: 'http'
      },
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          ws: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy) => {
            proxy.on('error', (err, req, res: any) => {
              console.error('Proxy error:', err);
              res.writeHead(502, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({
                error: 'Error conectando con el servidor API',
                message: err.message
              }));
            });
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            });
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})