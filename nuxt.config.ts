// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxtjs/sitemap',
  ],
  fonts: {
    families: [
      { name: 'Space Mono', provider: 'google', weights: [400, 700] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ],
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
        { rel: 'alternate', type: 'application/rss+xml', title: "Survivant de l'IA — RSS", href: 'https://survivant-ia.ch/rss.xml' },
      ],
      meta: [
        { name: 'theme-color', content: '#0D0D0D' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ['/rss.xml'],
    },
  },
})
