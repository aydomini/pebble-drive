import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'public',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'js/*',  // Relative to root (public)
          dest: 'js'
        }
      ]
    }),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // 替换环境变量占位符
        return html
          .replace(/%VITE_API_BASE_URL%/g, process.env.VITE_API_BASE_URL || '')
          .replace(/%VITE_TURNSTILE_SITE_KEY%/g, process.env.VITE_TURNSTILE_SITE_KEY || '');
      }
    }
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './public/index.html'
      }
    }
  },
  server: {
    port: 3000,
    hmr: {
      overlay: false  // 禁用 Vite 的错误覆盖层和 HMR 消息
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true
      }
    }
  },
  define: {
    '__VITE_API_BASE_URL__': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    '__VITE_TURNSTILE_SITE_KEY__': JSON.stringify(process.env.VITE_TURNSTILE_SITE_KEY || '')
  }
});
