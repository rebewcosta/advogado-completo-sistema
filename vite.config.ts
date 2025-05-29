import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa' // <<< 1. IMPORTAR O PLUGIN

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // <<< 2. ADICIONAR E CONFIGURAR O PLUGIN
      registerType: 'autoUpdate', // Atualiza o PWA automaticamente quando um novo conteúdo estiver disponível
      injectRegister: 'auto', // Ou 'script' ou null. 'auto' geralmente funciona bem.
      devOptions: {
        enabled: true, // Habilita o PWA em modo de desenvolvimento para testes
        type: 'module',
      },
      manifest: {
        name: 'JusGestão',
        short_name: 'JusGestão',
        description: 'Sistema de gestão para advogados e escritórios de advocacia.',
        theme_color: '#0D47A1', // Cor principal do tema do seu app (ex: azul escuro da sua logo)
        background_color: '#FFFFFF', // Cor de fundo para a tela de splash
        display: 'standalone', // Faz o PWA parecer mais com um app nativo
        scope: '/',
        start_url: '/', // Página inicial do seu PWA
        icons: [
          {
            src: '/icons/icon-192x192.png', // Caminho para o ícone 192x192
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png', // Caminho para o ícone 512x512
            sizes: '512x512',
            type: 'image/png'
          },
          { // Ícone "any maskable" é bom para adaptabilidade em diferentes formatos de ícone no Android
            src: '/icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      // Configuração do Service Worker (estratégia de cache)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'], // Arquivos para fazer cache
        runtimeCaching: [ // Cache dinâmico para APIs ou outros recursos
          {
            urlPattern: /^https:\/\/lqprcsquknlegzmzdoct\.supabase\.co\/.*/i, // URL da sua API Supabase
            handler: 'NetworkFirst', // Tenta a rede primeiro, se falhar, usa o cache
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,        // Máximo de 100 requisições cacheadas
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 dias
              },
              cacheableResponse: {
                statuses: [0, 200] // Cacheia respostas de sucesso
              }
            }
          },
          { // Cache para fontes do Google Fonts, se você usar
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})