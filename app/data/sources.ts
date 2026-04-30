// app/data/sources.ts

export type SourceCategory =
  | 'academique'    // Tufts, McKinsey, universités
  | 'banque'        // Goldman Sachs
  | 'institution'   // WEF, OCDE
  | 'plateforme'    // LinkedIn, PayScope
  | 'media'         // BDM, Visual Capitalist, etc.

export interface Source {
  id: number
  title: string
  author: string
  year: number
  url: string
  context: string       // ≤ 120 chars
  category: SourceCategory
}

export const SOURCES: Source[] = [
  // ── Études académiques ─────────────────────────────────
  {
    id: 1,
    title: 'American AI Jobs Risk Index',
    author: 'Fletcher School, Tufts University',
    year: 2026,
    url: 'https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts',
    context: 'Index quantifiant le risque IA sur 784 métiers américains. 9,3M emplois menacés à 2-5 ans.',
    category: 'academique',
  },
  {
    id: 2,
    title: 'How Will Jobs Be Affected by AI Where You Live and Work?',
    author: 'Tufts University, Digital Planet',
    year: 2026,
    url: 'https://digitalplanet.tufts.edu/how-will-jobs-be-affected-by-ai-where-you-live-and-work/',
    context: 'Cartographie géographique du risque IA aux États-Unis (Wired Belts vs Rust Belts).',
    category: 'academique',
  },
  {
    id: 3,
    title: 'AI Job Exposure by Occupation: 800 Roles Ranked for 2026',
    author: 'PayScope',
    year: 2026,
    url: 'https://www.payscope.ai/blog/ai-job-exposure-by-occupation-2026',
    context: 'Mesure d\'exposition observée à l\'IA sur 800 professions, intégrant l\'écart capacité-déploiement.',
    category: 'academique',
  },
  {
    id: 4,
    title: 'Agents, Robots and Us: Skill Partnerships in the Age of AI',
    author: 'McKinsey Global Institute',
    year: 2026,
    url: 'https://www.mckinsey.com/mgi/our-research/agents-robots-and-us-skill-partnerships-in-the-age-of-ai',
    context: 'Analyse du paradigme "agentique" : 57% des heures de travail US potentiellement automatisables.',
    category: 'academique',
  },
  {
    id: 5,
    title: 'A US Productivity Unlock: Investing in Frontline Workers\' AI Skills',
    author: 'McKinsey & Company',
    year: 2026,
    url: 'https://www.mckinsey.com/capabilities/operations/our-insights/a-us-productivity-unlock-investing-in-frontline-workers-ai-skills',
    context: 'Étude sur la requalification massive des travailleurs face à l\'IA.',
    category: 'academique',
  },
  {
    id: 6,
    title: 'Replaced by Robot — Highest AI Risk & Safest Jobs',
    author: 'Replaced by Robot',
    year: 2026,
    url: 'https://www.replacedbyrobot.info/ranking',
    context: 'Base de données de 57 000 professions classées par risque de remplacement.',
    category: 'academique',
  },

  // ── Banques d'investissement ───────────────────────────
  {
    id: 7,
    title: 'How Will AI Affect the US Labor Market?',
    author: 'Goldman Sachs',
    year: 2026,
    url: 'https://www.goldmansachs.com/insights/articles/how-will-ai-affect-the-us-labor-market',
    context: 'Modèle macroéconomique : 300M emplois à temps plein exposés à l\'automatisation IA.',
    category: 'banque',
  },
  {
    id: 8,
    title: 'The Jobs AI Is Likely to Boost — and Those It May Disrupt',
    author: 'Goldman Sachs',
    year: 2026,
    url: 'https://www.goldmansachs.com/insights/articles/the-jobs-ai-is-likely-to-boost-and-those-it-may-disrupt',
    context: 'Liste sectorielle des métiers boostés vs disruptés par l\'IA générative.',
    category: 'banque',
  },

  // ── Institutions / WEF / OCDE ──────────────────────────
  {
    id: 9,
    title: 'Future of Jobs Report 2025 — Fastest Growing and Declining Jobs',
    author: 'World Economic Forum',
    year: 2025,
    url: 'https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/',
    context: '92M emplois détruits, 170M créés d\'ici 2030. Solde net : +78M emplois.',
    category: 'institution',
  },
  {
    id: 10,
    title: 'Future of Jobs Report 2025 — Skills of the Future',
    author: 'World Economic Forum',
    year: 2025,
    url: 'https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-jobs-of-the-future-and-the-skills-you-need-to-get-them/',
    context: '39% des compétences fondamentales devront être mises à jour d\'ici 2030.',
    category: 'institution',
  },
  {
    id: 11,
    title: 'AI Has Already Added 1.3 Million Jobs (LinkedIn data)',
    author: 'World Economic Forum',
    year: 2026,
    url: 'https://www.weforum.org/stories/2026/01/ai-has-already-added-1-3-million-new-jobs-according-to-linkedin-data/',
    context: 'Décompte 2026 : 1,3M nouveaux postes IA + 600k postes infrastructure data centers.',
    category: 'institution',
  },

  // ── Plateformes professionnelles ───────────────────────
  {
    id: 12,
    title: 'Labor Market Report — Building a Future of Work That Works',
    author: 'LinkedIn Economic Graph',
    year: 2026,
    url: 'https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/linkedIn-labor-market-report-building-a-future-of-work-that-works-jan-2026.pdf',
    context: 'Rapport LinkedIn sur l\'émergence du recrutement basé sur les compétences (skills-based hiring).',
    category: 'plateforme',
  },
  {
    id: 13,
    title: 'Skills on the Rise: The Fastest-Growing Skills in 2026',
    author: 'LinkedIn Pressroom',
    year: 2026,
    url: 'https://news.linkedin.com/2026/Skills-on-the-rise-2026',
    context: 'Top des compétences en croissance : alphabétisation IA, résilience, pensée systémique.',
    category: 'plateforme',
  },
  {
    id: 14,
    title: 'AI-Related Jobs Top LinkedIn\'s Fastest-Growing Roles List for 2026',
    author: 'Dice — LinkedIn Career Advice',
    year: 2026,
    url: 'https://www.dice.com/career-advice/ai-related-jobs-top-linkedins-fastest-growing-roles-list-for-2026',
    context: 'Synthèse des rôles IA pragmatiques en plus forte croissance : intégrateurs, MLOps, FDE.',
    category: 'plateforme',
  },

  // ── Médias / synthèses ─────────────────────────────────
  {
    id: 15,
    title: 'Métiers menacés par l\'IA : rédacteurs, développeurs, designers',
    author: 'Blog du Modérateur',
    year: 2025,
    url: 'https://www.blogdumoderateur.com/metiers-menaces-ia-redacteurs-developpeurs-designers/',
    context: 'Synthèse francophone des données Tufts et INSEE sur les métiers à risque.',
    category: 'media',
  },
  {
    id: 16,
    title: 'Métiers menacés par l\'IA — Analyse française',
    author: 'Bradroit Solutions',
    year: 2026,
    url: 'https://bradroit-solutions.fr/blog/metiers_menaces_par_IA',
    context: 'Décryptage francophone du paradigme "agentique" et de l\'écart capacité-déploiement.',
    category: 'media',
  },
  {
    id: 17,
    title: 'Tufts Study Shows Content Professionals Among Most at Risk from AI',
    author: 'Writtenly Hub',
    year: 2026,
    url: 'https://www.writtenlyhub.com/news/ai-jobs-risk-tufts-index-writers-programmers',
    context: 'Couverture média de l\'index Tufts focalisée sur les rédacteurs et programmeurs.',
    category: 'media',
  },
  {
    id: 18,
    title: 'New AI Jobs Index Ranks 784 Occupations By Loss Risk',
    author: 'Search Engine Journal',
    year: 2026,
    url: 'https://www.searchenginejournal.com/new-ai-jobs-index-ranks-784-occupations-by-loss-risk/570867/',
    context: 'Couverture média de l\'index Tufts avec focus sur les pertes de revenu absolues.',
    category: 'media',
  },
  {
    id: 19,
    title: 'Ranked: The Jobs Most Exposed to Generative AI (Microsoft)',
    author: 'Visual Capitalist',
    year: 2025,
    url: 'https://www.visualcapitalist.com/ranked-the-jobs-most-exposed-to-generative-ai-according-to-microsoft/',
    context: 'Visualisation Microsoft des métiers les plus exposés à l\'IA générative.',
    category: 'media',
  },
  {
    id: 20,
    title: 'Your Job Could Be Next — The 2026 AI Stats Prove It',
    author: 'JobReplacementAI',
    year: 2026,
    url: 'https://jobreplacementai.com/blog/ai-job-replacement-statistics-2025',
    context: 'Compilation de statistiques 2026 sur le remplacement par l\'IA, métier par métier.',
    category: 'media',
  },
  {
    id: 21,
    title: '10 Jobs AI Can\'t Replace in 2025 — Future-Proof Career Guide',
    author: 'PrometAI',
    year: 2025,
    url: 'https://prometai.app/blog/10-jobs-ai-wont-replace-future-proof-careers-for-the-ai-era',
    context: 'Liste des métiers résilients à l\'IA : santé, métiers manuels, leadership empathique.',
    category: 'media',
  },
  {
    id: 22,
    title: '7 métiers qui ne vont pas disparaître à cause de l\'IA',
    author: 'CNFDI',
    year: 2026,
    url: 'https://www.cnfdi.com/le-blog/metiers-resisteront-a-l-ia-414.html',
    context: 'Liste francophone de métiers protégés : artisanat, soin, jugement moral.',
    category: 'media',
  },
]

export function findSourceById(id: number): Source | undefined {
  return SOURCES.find(s => s.id === id)
}

export function getSourcesByIds(ids: number[]): Source[] {
  return ids
    .map(id => findSourceById(id))
    .filter((s): s is Source => s !== undefined)
}

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  academique: 'Études académiques',
  banque: 'Banques d\'investissement',
  institution: 'Institutions internationales',
  plateforme: 'Plateformes professionnelles',
  media: 'Médias & synthèses',
}

const CATEGORY_ORDER: SourceCategory[] = [
  'academique', 'banque', 'institution', 'plateforme', 'media',
]

export function getSourcesByCategory(): Array<{ category: SourceCategory, label: string, sources: Source[] }> {
  return CATEGORY_ORDER.map(category => ({
    category,
    label: SOURCE_CATEGORY_LABELS[category],
    sources: SOURCES.filter(s => s.category === category),
  }))
}
