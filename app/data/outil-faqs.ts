// Static FAQ data for outils, indexed by kit code.
// Kept out of @nuxt/content schema to avoid invalidating the prebuilt
// SQLite cache (better-sqlite3 native module fails on Vercel Lambda
// when the DB needs to be rebuilt at runtime).

export interface FaqItem {
  question: string
  answer: string
}

export const OUTIL_FAQS: Record<string, FaqItem[]> = {
  'generateur-ecriture-comptable': [
    {
      question: 'Mes données partent-elles aux États-Unis ?',
      answer: "Non. Le moteur IA est hébergé dans les datacenters Infomaniak en Suisse (certifiés ISO 27001, conformes nLPD). Aucun appel n'est routé vers OpenAI, Anthropic, Google ou un fournisseur extra-européen.",
    },
    {
      question: 'Mes prompts servent-ils à entraîner des modèles ?',
      answer: "Non. Infomaniak AI Service contracte explicitement le no-training : tes descriptions d'écriture ne nourrissent ni Mistral, ni Whisper, ni aucun modèle tiers. C'est l'avantage face à ChatGPT, Claude.ai ou Gemini grand public, qui entraînent par défaut sur les conversations.",
    },
    {
      question: "Qu'est-ce que Survivant-IA garde de mes écritures ?",
      answer: "Rien. Le journal vit uniquement dans ton navigateur (mémoire de session). Aucune base de données, aucun cache, aucun log applicatif ne stocke le contenu de tes écritures. Seuls les codes d'erreur techniques (timeout, validation ratée) sont loggés pour debug, jamais le texte saisi. Tu fermes l'onglet, tout disparaît côté Survivant-IA.",
    },
    {
      question: "Quel modèle d'IA fait le travail ?",
      answer: 'Mistral Ministral-3 (14 milliards de paramètres, instruction-tuned), servi par Infomaniak. Le choix : modèle ouvert, performant en français, fort en JSON structuré, hébergé en Suisse. Pas du GPT-4 ou Claude, pas besoin de la puissance d\'un frontier model pour structurer une ligne comptable.',
    },
    {
      question: 'Combien coûte un appel à Survivant-IA ?',
      answer: 'Côté Infomaniak (le moteur IA), une écriture parsée coûte environ 0,024 centime suisse (~700 tokens entrants à 0,30 CHF par million + ~80 tokens sortants à 0,40 CHF par million). Une dictée vocale de 10 secondes via Whisper V3 ajoute environ 0,1 centime. Concrètement : 1 franc te paye plus de 4000 écritures texte ou environ 1000 dictées. C\'est offert ici, mais à toi de mesurer ce que ça représente vs. un comptable à 150 CHF de l\'heure.',
    },
    {
      question: 'Pourquoi seulement 10 essais par jour ?',
      answer: "Limite anti-abus par IP, pas pour t'embêter, pour éviter qu'un bot ratisse l'outil et fasse exploser ma facture Infomaniak. À 0,024 centime l'écriture, 10 essais par jour suffisent largement pour évaluer si c'est utile dans ton flux. Si tu veux passer en production sur de vrais volumes, écris-moi.",
    },
    {
      question: 'Comment ça marche techniquement ?',
      answer: "Flow texte : ton navigateur → survivant-ia.ch (proxy léger côté serveur) → Infomaniak AI Service à Genève → réponse JSON structurée. Flow voix : ton navigateur → survivant-ia.ch → Infomaniak Whisper V3 (batch asynchrone) → polling toutes les ~800ms jusqu'à transcription complète → la transcription devient l'input du parsing comptable. Aucune persistance côté serveur, le journal vit en localStorage de ton navigateur (tu peux tout effacer via le bouton « Nouveau journal »).",
    },
  ],
}
