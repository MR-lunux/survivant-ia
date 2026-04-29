// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: {
    brevoApiKey: '',
    brevoListId: '',
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
  ],
  fonts: {
    families: [
      { name: 'Space Mono', provider: 'google', weights: [400, 700], global: true },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700], global: true },
    ],
  },
  ogImage: {
    defaults: {
      component: 'Default',
      renderer: 'satori',
      width: 1200,
      height: 630,
    },
    fonts: ['Space+Mono:400', 'Space+Mono:700', 'Inter:400', 'Inter:700'],
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
        { rel: 'alternate', type: 'application/rss+xml', title: "Survivant-IA — RSS", href: 'https://survivant-ia.ch/rss.xml' },
        { rel: 'alternate', hreflang: 'fr-CH', href: 'https://survivant-ia.ch/' },
        { rel: 'alternate', hreflang: 'fr', href: 'https://survivant-ia.ch/' },
        { rel: 'alternate', hreflang: 'x-default', href: 'https://survivant-ia.ch/' },
      ],
      meta: [
        { name: 'theme-color', content: '#0D0D0D' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
})
