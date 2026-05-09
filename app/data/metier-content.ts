// app/data/metier-content.ts
import type { JobQuadrant } from './jobs'

export interface MetierEditorialContent {
  contexte: string         // Angle 1 — Contexte sectoriel (markdown HTML autorisé)
  trajectoire: string      // Angle 2 — Trajectoire concrète
  anticipation: string     // Angle 3 — Anticipation 2026-2030
  faq: Array<{ question: string, answer: string }>
  dateModified: string
}

/**
 * Map slug → contenu éditorial spécifique. Rempli par les agents en Vague 2.
 * Si un slug n'a pas de contenu ici, la page utilise le fallback per-quadrant.
 */
export const METIER_CONTENT: Record<string, MetierEditorialContent> = {
  // Rempli par les agents en Vague 2
}

/**
 * Fallback générique par quadrant si un job n'a pas de contenu spécifique.
 */
export function getQuadrantFallbackContent(quadrant: JobQuadrant, dateModified: string): MetierEditorialContent {
  const TEMPLATES: Record<JobQuadrant, Pick<MetierEditorialContent, 'contexte' | 'trajectoire' | 'anticipation' | 'faq'>> = {
    mutes: {
      contexte: '<p>Ton métier est dans une zone de mutation forte. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey Global Institute, World Economic Forum) convergent : tes tâches préparatoires basculent dans l\'IA, mais la valeur de ton expertise se déplace vers la validation, l\'arbitrage et la responsabilité. Ceux qui pilotent l\'IA dans leur métier passent devant les autres.</p>',
      trajectoire: '<p>Le pattern qui marche : intégrer un outil IA dans une tâche que tu fais déjà 2-3 heures par semaine, mesurer le gain, le documenter publiquement. En 60 jours, tu deviens la référence interne de ton équipe sur la question.</p>',
      anticipation: '<p>D\'ici 2030 : la valeur ajoutée du junior s\'effondre, celle du senior IA-augmenté triple. Ceux qui ont pris le virage tôt sont ceux que les recruteurs s\'arrachent.</p>',
      faq: [
        { question: 'Mon métier va-t-il disparaître avec l\'IA ?', answer: 'Non, mais il mute. Les tâches préparatoires sont automatisées, l\'expertise humaine se déplace vers la validation et l\'arbitrage. C\'est là que se concentre la valeur.' },
        { question: 'Combien de temps me reste-t-il ?', answer: 'Variable selon ton secteur, mais la fenêtre est de 2 à 5 ans pour repositionner ta valeur. Plus tu attends, plus tu seras commoditisé.' },
        { question: 'Faut-il pivoter de carrière ?', answer: 'Non, repositionner. Ton expertise reste précieuse, mais elle s\'exprime différemment : moins de production, plus de validation et de conseil.' },
        { question: 'Comment se former ?', answer: 'Anthropic Academy (gratuit) pour les bases, puis spécialisation sectorielle. 4-6h par semaine pendant 2 mois suffisent pour passer devant les autres.' },
        { question: 'Quels outils maîtriser en priorité ?', answer: 'Un outil généraliste (Claude ou ChatGPT) + un outil sectoriel propre à ton métier. Trois outils suffisent pour reprendre 4-6h par semaine.' },
      ],
    },
    pilotes: {
      contexte: '<p>Ton métier est solidement positionné face à l\'IA. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey, WEF) le confirment : exposition limitée + capacité d\'amplification forte. Tu fais partie de ceux qui peuvent capitaliser sur l\'IA sans subir sa pression.</p>',
      trajectoire: '<p>Le pattern qui marche pour ton profil : construire un agent perso branché sur ton expertise (Claude Projects ou GPTs), documenter publiquement comment tu intègres l\'IA, transformer ta valeur de référent IA en avantage commercial.</p>',
      anticipation: '<p>D\'ici 2030 : ton secteur reste demandeur, et ceux qui auront documenté leur usage IA seront vus comme les leaders d\'opinion. Capitalise maintenant, le marché s\'étend.</p>',
      faq: [
        { question: 'Pourquoi mon métier est protégé ?', answer: 'Combinaison de barrière à l\'automatisation (régulation, présence humaine requise, ou expertise non-codifiable) et de levier IA fort (outils qui amplifient ton impact sans te remplacer).' },
        { question: 'Que dois-je faire pour rester en avance ?', answer: 'Construire un agent IA branché sur ton expertise et documenter ton usage publiquement. Ta valeur de référent monte avant les autres dans ton secteur.' },
        { question: 'Quels outils utiliser ?', answer: 'Un outil généraliste (Claude ou ChatGPT) pour les tâches préparatoires, et 1-2 outils sectoriels pour optimiser ta production. Les Claude Projects ou GPTs personnalisés sont parfaits pour capturer ta méthodologie.' },
        { question: 'Faut-il se former à l\'IA ?', answer: 'Oui mais pas dans une logique défensive. Forme-toi pour augmenter ton output, pas pour éviter d\'être remplacé. Anthropic Academy + DeepLearning.AI sont des bons points de départ gratuits.' },
        { question: 'Combien de temps avant que ça change ?', answer: 'Ton métier reste solidement positionné sur 5-10 ans. Mais la concurrence IA-augmentée arrive : ceux qui pilotent l\'IA dès maintenant prennent l\'avance.' },
      ],
    },
    tiens: {
      contexte: '<p>Ton métier reste solide face à l\'IA. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey, WEF) montrent une exposition limitée. L\'IA n\'a ni les moyens techniques ni l\'incentive économique de remplacer ce que tu fais. Stabilité naturelle.</p>',
      trajectoire: '<p>Le pattern qui marche : utiliser l\'IA pour alléger l\'admin, capturer ton savoir terrain (Whisper, Otter pour la dictée), faire une veille hebdo automatisée. Tu libères 3-4 heures par semaine sans toucher à ton cœur de métier.</p>',
      anticipation: '<p>D\'ici 2030 : ta profession reste stable. Le levier IA est modéré (admin + prospection), mais ton métier ne se commoditise pas. Profite-en pour transmettre ton savoir aux générations suivantes.</p>',
      faq: [
        { question: 'Pourquoi mon métier ne risque pas l\'IA ?', answer: 'Combinaison de présence physique requise, motricité fine, jugement humain, ou environnement non-standardisé. L\'IA n\'a pas l\'avantage économique de te remplacer.' },
        { question: 'Dois-je quand même utiliser l\'IA ?', answer: 'Oui, pour alléger ton admin et capturer ton savoir. Pas pour transformer ton cœur de métier — ça reste humain.' },
        { question: 'Quels outils me sont utiles ?', answer: 'Claude ou ChatGPT pour la rédaction admin (devis, factures, courriers), Whisper ou Otter pour dicter tes interventions, un agent veille hebdo pour rester informé.' },
        { question: 'Comment me former sans y passer 100 heures ?', answer: 'Anthropic Academy (gratuit, 5-10 heures suffisent) pour les bases du prompt engineering. Tu n\'as pas besoin de plus pour ton usage.' },
        { question: 'Faut-il que je m\'inquiète à long terme ?', answer: 'Non. Les rapports 2026 sont clairs : ton métier reste demandeur sur 10+ ans. Profite de la stabilité pour transmettre et te former à ton rythme.' },
      ],
    },
    pivotes: {
      contexte: '<p>Ton métier est en contraction structurelle. Les rapports 2026 (<a href="https://fletcher.tufts.edu/news-media-mentions/all-news/wired-belts-are-new-rust-belts" target="_blank" rel="noopener">Tufts AI Jobs Risk Index</a>, McKinsey, WEF) projettent une réduction massive des effectifs sur 2 à 5 ans, sans levier IA fort pour compenser. Anticiper le pivot est la seule stratégie qui paie.</p>',
      trajectoire: '<p>Le pattern qui marche : identifier le métier adjacent qui croît (souvent dans le même secteur, mais une fonction au-dessus ou de côté), apprendre le prompt engineering en 10 heures, faire la transition pendant que tu as encore le poste actuel comme filet.</p>',
      anticipation: '<p>D\'ici 2030 : la profession aura perdu 30-50% de ses effectifs. Ceux qui auront pivoté tôt seront en position de force ; ceux qui auront attendu subiront le marché du travail saturé.</p>',
      faq: [
        { question: 'Mon métier va-t-il vraiment disparaître ?', answer: 'Pas totalement, mais les effectifs se contractent fortement. Les survivants seront ceux qui auront pivoté vers des rôles de supervision IA, qualité, ou un métier adjacent du même secteur.' },
        { question: 'Vers quel métier pivoter ?', answer: 'Vers une fonction adjacente du même secteur, idéalement avec une dimension humaine ou de supervision IA. Ton expertise reste précieuse, c\'est ton poste actuel qui se contracte, pas tes compétences.' },
        { question: 'Combien de temps me reste-t-il ?', answer: 'Fenêtre de 2 à 5 ans pour anticiper. Plus tu attends, plus le marché du travail sur lequel tu pivoteras sera saturé.' },
        { question: 'Comment commencer le pivot ?', answer: '1. Apprends le prompt engineering en 10h (DeepLearning.AI gratuit). 2. Identifie 3 offres LinkedIn qui combinent ton expertise + AI/supervision. 3. Postule sans démissionner.' },
        { question: 'Faut-il une formation longue ?', answer: 'Pas forcément. La plupart des pivots se font sur la base de tes compétences existantes + une couche IA légère (10-20h de formation autodidacte). C\'est l\'expérience terrain qui compte le plus.' },
      ],
    },
  }

  return {
    ...TEMPLATES[quadrant],
    dateModified,
  }
}

/**
 * Retourne le contenu éditorial pour un job, avec fallback per-quadrant si pas spécifique.
 */
export function getMetierContent(slug: string, quadrant: JobQuadrant, dateModified: string): MetierEditorialContent {
  return METIER_CONTENT[slug] ?? getQuadrantFallbackContent(quadrant, dateModified)
}
