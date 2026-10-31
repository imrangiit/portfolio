import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';
import { generateSeoHtml } from './seo-plugin.js';

const START_PAGE_PATHS = new Set(['/start', '/start/']);

function rewriteStartPage(req, _res, next) {
  const [pathname, query = ''] = req.url.split('?');

  if (START_PAGE_PATHS.has(pathname)) {
    req.url = `/start/index.html${query ? `?${query}` : ''}`;
  }

  next();
}

function serveStaticStartPage() {
  return {
    name: 'serve-static-start-page',
    configureServer(server) {
      server.middlewares.use(rewriteStartPage);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteStartPage);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [serveStaticStartPage(), react(), viteCompression(), generateSeoHtml()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
          if (id.endsWith('/three/build/three.core.js')) return 'three-core';
          if (id.endsWith('/three/build/three.module.js')) return 'three-renderer';
          if (id.includes('/node_modules/three/examples/')) return 'three-extras';
          if (id.includes('/node_modules/three/')) return 'three-vendor';
          if (/node_modules\/@react-three\/(fiber|drei|postprocessing)\//.test(id)) return 'r3f-vendor';
          if (id.includes('/node_modules/gsap/')) return 'animation-vendor';
          if (/node_modules\/@sanity\//.test(id)) return 'sanity-vendor';
        }
      }
    }
  },
  server: {
    proxy: {
      '/sanity-cdn': {
        target: 'https://cdn.sanity.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sanity-cdn/, '')
      }
    }
  }
})
