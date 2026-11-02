// nuxt.config.ts
// NanoFeed — Nuxt 4 Configuration
// Nuxt 4 requires future.compatibilityVersion: 4 for the new app/ directory layout

import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // ── Nuxt 4 Compatibility ──────────────────────────────────────────────────
  future: {
    compatibilityVersion: 4,
  },

  // ── Compatibility Date ────────────────────────────────────────────────────
  // Pins the behavior of Nuxt to a specific date to avoid breaking changes
  compatibilityDate: '2025-01-01',

  // ── Build ─────────────────────────────────────────────────────────────────
  build: {
    transpile: ['shared'],
  },

  // ── Dev Tools ─────────────────────────────────────────────────────────────
  devtools: { enabled: true },

  // ── Modules ───────────────────────────────────────────────────────────────
  modules: ['@nuxt/image', '@vueuse/nuxt', '@nuxt/eslint'],

  // ── CSS ───────────────────────────────────────────────────────────────────
  css: ['~/assets/scss/main.scss'],

  vue: { compilerOptions: { isCustomElement: (tag) => tag === 'rootcap-widget' } },

  // ── SCSS Preprocessing ────────────────────────────────────────────────────
  // Inject SCSS variables and mixins globally into every Vue component
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/scss/_variables.scss" as *;
            @use "~/assets/scss/_mixins.scss" as *;
          `,
        },
      },
    },
  },

  // ── Nitro (Server) ────────────────────────────────────────────────────────
  nitro: {
    // Use Vercel preset for serverless deployment
    preset: process.env.NITRO_PRESET || 'node-server',
    externals: {
      inline: ['#shared', '~~/shared', /[\\/]shared[\\/]/],
    },
  },

  // ── Runtime Config ────────────────────────────────────────────────────────
  // Private keys are only available server-side
  // Public keys are exposed to the client
  runtimeConfig: {
    // Server-only secrets

    // Public config (available on client)
    public: {
      appUrl:
        process.env.NUXT_PUBLIC_APP_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://nanofeed.vercel.app'
          : 'http://localhost:3000'),
      appName: 'NanoFeed',
      appDescription: 'A minimal developer micro social network',
    },
  },

  // ── TypeScript ────────────────────────────────────────────────────────────
  typescript: {
    strict: true,
    typeCheck: false, // handled separately via `nuxt typecheck`
  },

  // ── App Metadata ──────────────────────────────────────────────────────────
  app: {
    head: {
      title: 'NanoFeed',
      titleTemplate: '%s · NanoFeed',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content: 'A minimal, text-based developer micro social network.',
        },
        { name: 'theme-color', content: '#0a0a0a' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
})
