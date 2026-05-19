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
      question: "Est-ce vraiment gratuit ?",
      answer: "Oui, c'est un outil offert pour l'instant. Aucune inscription, aucun paiement, aucune carte demandée. Le coût des appels Infomaniak est à ma charge tant que les volumes restent raisonnables — pour des usages production sur de gros volumes, écris-moi à mathieu@survivant-ia.ch et on regarde ensemble.",
    },
    {
      question: 'Comment ça marche techniquement ?',
      answer: "Flow texte : ton navigateur → survivant-ia.ch (proxy léger côté serveur) → Infomaniak AI Service à Genève → réponse JSON structurée. Flow voix : ton navigateur → survivant-ia.ch → Infomaniak Whisper V3 (batch asynchrone) → polling toutes les ~800ms jusqu'à transcription complète → la transcription devient l'input du parsing comptable. Aucune persistance côté serveur, le journal vit en localStorage de ton navigateur (tu peux tout effacer via le bouton « Nouveau journal »).",
    },
  ],
  'ameliorer-son-prompt': [
    {
      question: 'L\'outil garde-t-il mon prompt ?',
      answer: 'Non. On capture des métriques anonymes (taille, durée, succès), jamais le texte. Le prompt transite par notre serveur le temps de l\'appel à l\'IA Infomaniak (Suisse, Genève) et n\'est pas stocké.',
    },
    {
      question: 'Quelle IA est utilisée derrière ?',
      answer: 'Mistral 24B, hébergée chez Infomaniak en Suisse. Même infra que pour nos autres outils. Pas d\'OpenAI, pas d\'Anthropic. Ton prompt ne traverse pas l\'Atlantique.',
    },
    {
      question: 'Pourquoi 6 champs et pas plus / pas moins ?',
      answer: 'C\'est ce que les guides d\'Anthropic et d\'OpenAI utilisent comme base utile. Moins de 6, tu rates des leviers (typiquement le rôle et le format). Plus de 6, tu sur-spécifies et la qualité baisse. Les 6 couvrent l\'écrasante majorité des cas pros.',
    },
    {
      question: 'L\'outil refuse mon prompt, c\'est normal ?',
      answer: 'Oui si ton prompt contient des insultes, du contenu sexuel explicite, du dénigrement ciblé ou des demandes nocives. Raisons légales (responsabilité de l\'éditeur) et éditoriales. Reformule en restant pro, ça passera.',
    },
    {
      question: 'Combien de fois par jour je peux l\'utiliser ?',
      answer: '20 améliorations par jour et par IP. Si tu atteins la limite, reviens demain. Un bypass pour les abonnés de La Fréquence est en chantier.',
    },
    {
      question: 'Ça marche aussi pour les prompts en anglais ?',
      answer: 'Tu peux coller un prompt anglais. La sortie sera en français. Si tu veux la sortie en anglais, ajoute « FORMAT DE SORTIE : answer in English » dans ton prompt brut.',
    },
    {
      question: 'Comment cet outil a-t-il été construit ?',
      answer: 'Environ 3 heures, avec Claude Code comme assistant. Je ne suis pas développeur full-stack à temps plein : je suis Deputy Head of IT dans une boîte qui n\'a rien de tech, et cet outil a été construit en marge de mes journées. Le system prompt qui restructure ton prompt a été itéré une dizaine de fois avant d\'atteindre une grille stable. « 3 heures » ne veut pas dire que tu peux le refaire en 3 heures (ce n\'est pas trivial). Ça veut dire qu\'aujourd\'hui, entre l\'idée d\'un outil et un outil qui marche, il n\'y a presque plus de friction si tu sais poser le problème et repérer quand l\'IA hallucine.',
    },
  ],
}
