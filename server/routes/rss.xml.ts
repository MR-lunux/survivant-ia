// server/routes/rss.xml.ts
import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const articles = await queryCollection(event, 'rapports')
    .order('date', 'DESC')
    .all()

  const siteUrl = 'https://survivant-ia.fr'

  const items = articles.map((article) => {
    const slug = article.path?.split('/').pop() ?? ''
    const pubDate = new Date(article.date).toUTCString()
    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.description ?? ''}]]></description>
      <link>${siteUrl}/rapports/${slug}</link>
      <guid>${siteUrl}/rapports/${slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${article.category}</category>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mathieu le Survivant de l'IA</title>
    <description>Rapports de survie hebdomadaires : soft skills, comprendre l'IA, cas pratiques.</description>
    <link>${siteUrl}</link>
    <language>fr</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return rss
})
