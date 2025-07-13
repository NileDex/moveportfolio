import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    proxy: {
      // Movement Network GraphQL API
      '/api/graphql': {
        target: 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/graphql/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('GraphQL proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending GraphQL Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received GraphQL Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Movement Network RPC API
      '/api/rpc': {
        target: 'https://mainnet.movementnetwork.xyz/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rpc/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('RPC proxy error', err);
          });
        },
      },
      // CoinGecko API
      '/api/coingecko': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('CoinGecko proxy error', err);
          });
        },
      },
    },
  },
  define: {
    'process.env': {},
    // Optional: If you want to access env vars via import.meta.env
    'import.meta.env': JSON.stringify(process.env)
  },
  worker: {
    format: 'es',
  },
});