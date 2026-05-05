// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: {
    brevoApiKey: '',
    brevoListId: '',
    public: {
      posthogKey: '',
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
  ],
  fonts: {
    defaults: { display: 'swap' },
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 700, 900], global: true },
      { name: 'Playfair Display', provider: 'google', weights: [400, 500, 800], styles: ['normal', 'italic'], global: true },
    ],
  },
  ogImage: {
    defaults: {
      component: 'Default',
      renderer: 'satori',
      width: 1200,
      height: 630,
    },
    fonts: ['Space+Mono:400', 'Space+Mono:700', 'Inter:400', 'Inter:700', 'Playfair+Display:ital,wght@1,400'],
  },
  sitemap: {
    autoLastmod: true,
    defaults: { changefreq: 'monthly', priority: 0.6 },
  },
  routeRules: {
    '/': { sitemap: { priority: 1.0, changefreq: 'weekly' } },
    '/scanner': { sitemap: { priority: 0.9, changefreq: 'monthly' } },
    '/rapports': { sitemap: { priority: 0.9, changefreq: 'weekly' } },
    '/rapports/**': { sitemap: { priority: 0.7, changefreq: 'monthly' } },
    '/frequence': { sitemap: { priority: 0.8, changefreq: 'monthly' } },
    '/identite': { sitemap: { priority: 0.6, changefreq: 'yearly' } },
    '/_ph/static/**': { proxy: 'https://eu-assets.i.posthog.com/static/**' },
    '/_ph/**':        { proxy: 'https://eu.i.posthog.com/**' },
    '/confidentialite': { sitemap: false },
  },
  content: {
    highlight: { theme: 'github-dark' },
  },
  site: {
    url: 'https://survivant-ia.ch',
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'application/rss+xml', title: "Survivant-IA — RSS", href: 'https://survivant-ia.ch/rss.xml' },
        { rel: 'alternate', hreflang: 'fr-CH', href: 'https://survivant-ia.ch/' },
        { rel: 'alternate', hreflang: 'fr', href: 'https://survivant-ia.ch/' },
        { rel: 'alternate', hreflang: 'x-default', href: 'https://survivant-ia.ch/' },
      ],
      meta: [
        { name: 'theme-color', content: '#0F0F0E' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'author', content: 'Mathieu Rerat' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
        { property: 'og:site_name', content: 'Survivant-IA' },
        { property: 'og:locale', content: 'fr_CH' },
        { property: 'og:type', content: 'website' },
      ],
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/rss.xml', '/scanner', '/rapports', '/frequence', '/identite', '/confidentialite'],
    },
  },
  vite: {
    build: {
      target: 'es2022',
    },
  },
})
