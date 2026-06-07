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
      answer: "Non. L'IA tourne sur les datacenters Infomaniak en Suisse (certifiés ISO 27001 et conformes nLPD). Aucun appel ne part vers OpenAI, Anthropic, Google ou un autre fournisseur hors d'Europe.",
    },
    {
      question: 'Mes prompts servent-ils à entraîner des modèles ?',
      answer: "Non. Infomaniak s'engage contractuellement à ne rien entraîner sur nos appels. Tes descriptions ne nourrissent aucun de leurs modèles (Mistral, Whisper, ou tiers). Différence avec ChatGPT, Claude.ai ou Gemini grand public : eux, par défaut, s'entraînent sur tes conversations.",
    },
    {
      question: "Qu'est-ce que Survivant-IA garde de mes écritures ?",
      answer: "Rien. Le journal vit uniquement dans ton navigateur (mémoire de session). Côté serveur, rien n'est gardé : pas de base de données, pas de cache, pas de log. On log uniquement les erreurs techniques (timeout, validation ratée), jamais le texte. Tu fermes l'onglet, tout disparaît côté Survivant-IA.",
    },
    {
      question: "Quel modèle d'IA fait le travail ?",
      answer: "Mistral Small 4 (119 milliards de paramètres) via Infomaniak AI Tools, hébergé en Suisse. Modèle français, ouvert, qui gère bien le JSON structuré. Pas de GPT-4 ni Claude derrière. Pour structurer une ligne comptable, pas besoin d'un frontier model. Et ça reste en Suisse.",
    },
    {
      question: 'Combien coûte un appel à Survivant-IA ?',
      answer: 'Côté Infomaniak (l\'IA), une écriture parsée coûte environ 0,024 centime suisse (~700 tokens entrants à 0,30 CHF par million + ~80 tokens sortants à 0,40 CHF par million). Une dictée de 10 secondes via Whisper V3 ajoute environ 0,1 centime. En clair : 1 franc te paye plus de 4000 écritures texte ou environ 1000 dictées. C\'est offert ici. À toi de comparer avec un comptable à 150 CHF de l\'heure.',
    },
    {
      question: "Est-ce vraiment gratuit ?",
      answer: "Oui, c'est offert pour l'instant. Pas d'inscription, pas de paiement, pas de carte demandée. Le coût des appels Infomaniak est à ma charge tant que les volumes restent raisonnables. Si tu veux l'utiliser en production sur de gros volumes, écris-moi à mathieu@survivant-ia.ch et on regarde ensemble.",
    },
    {
      question: 'Comment ça marche techniquement ?',
      answer: "Flow texte : ton navigateur → survivant-ia.ch (proxy léger côté serveur) → Infomaniak AI Tools à Genève → réponse JSON structurée. Flow voix : ton navigateur → survivant-ia.ch → Infomaniak Whisper V3 (batch asynchrone) → polling toutes les ~800ms jusqu'à transcription complète → la transcription devient l'input du parsing comptable. Rien n'est gardé côté serveur. Le journal vit en localStorage de ton navigateur (tu peux tout effacer via le bouton « Nouveau journal »).",
    },
  ],
  'generateur-processus-bpmn': [
    {
      question: "Quels types de processus l'outil sait générer ?",
      answer: "Tous les éléments BPMN 2.0 courants : tâches (user/service/manuelle), événements (début, fin, intermédiaires : timer, message, erreur), gateways (exclusive, parallèle, inclusive), lanes pour les acteurs, sous-processus. Les structures très complexes (collaborations multi-organisations, événements limites) restent à éditer manuellement dans bpmn.io.",
    },
    {
      question: "Le XML est-il du vrai BPMN 2.0 standard ?",
      answer: "Oui. Le XML est sérialisé via bpmn-moddle, la librairie officielle de bpmn.io. Le fichier .bpmn s'ouvre sans erreur dans Camunda Modeler, Signavio, BIC ou tout outil compatible BPMN 2.0.",
    },
    {
      question: "Quelle IA est utilisée derrière ?",
      answer: "Mistral Small 4 (119 milliards de paramètres) via Infomaniak AI Tools, hébergé en Suisse. Même setup pour tous nos outils. Aucun appel vers OpenAI, Anthropic ou Google. Ton processus reste en Suisse.",
    },
    {
      question: "Mes données sont-elles partagées ou conservées ?",
      answer: "Ta description est envoyée à l'IA d'Infomaniak (datacenters en Suisse) le temps de la génération, puis n'est pas stockée par Survivant-IA. Aucune donnée n'est transmise à OpenAI, Anthropic ou Google. PostHog reçoit des métriques anonymes (durée, nombre d'éléments) sans le contenu.",
    },
    {
      question: "Quelle est la limite par jour ?",
      answer: "20 générations par adresse IP, remise à zéro à minuit (heure suisse). Largement assez pour cartographier les 3-4 processus d'un atelier.",
    },
    {
      question: "Pourquoi l'outil me dit que ma description est \"trop vague\" ?",
      answer: "Il faut au moins 2 étapes identifiables et un acteur. Reformule en mentionnant qui fait quoi : \"le commercial reçoit la demande, le responsable la valide\" plutôt que \"on traite les demandes\".",
    },
    {
      question: "Je suis étudiant en cours BPMN. Ça marche pour mes exercices ?",
      answer: "Oui, l'outil n'est pas vendu pour ça mais le mécanisme fonctionne aussi pour les exercices académiques. Garde en tête que ton enseignant attend probablement que tu maîtrises l'éditeur. Utilise l'outil pour gagner du temps sur la première version, puis relis et valide à la main.",
    },
  ],
  'ameliorer-son-prompt': [
    {
      question: 'L\'outil garde-t-il mon prompt ?',
      answer: 'Non. On compte juste la taille, la durée et si l\'appel a marché. Jamais ton texte. Quand tu cliques sur « Améliore mon prompt », ton prompt passe par notre serveur, puis chez Infomaniak (Suisse, Genève), et personne ne le garde.',
    },
    {
      question: 'Quelle IA est utilisée derrière ?',
      answer: "Mistral Small 4 (119 milliards de paramètres) via Infomaniak AI Tools, hébergé en Suisse. Même setup pour tous nos outils. Aucun appel vers OpenAI, Anthropic ou Google. Ton prompt ne traverse pas l'Atlantique.",
    },
    {
      question: 'Pourquoi 6 champs et pas plus / pas moins ?',
      answer: 'C\'est la base qu\'on retrouve dans les guides d\'Anthropic et d\'OpenAI. En dessous de 6, il manque des leviers (souvent le rôle et le format). Au-delà, tu sur-spécifies et l\'IA s\'embrouille. Pour les cas pros du quotidien, ces 6 suffisent.',
    },
    {
      question: 'L\'outil refuse mon prompt, c\'est normal ?',
      answer: 'Oui si ton prompt contient des insultes, du contenu sexuel explicite, du dénigrement ciblé ou des demandes nocives. Comme éditeur du site, je suis responsable de ce qui sort, donc la politique est stricte. Reformule en restant pro, ça passera.',
    },
    {
      question: 'Combien de fois par jour je peux l\'utiliser ?',
      answer: '20 améliorations par jour et par IP. Si tu atteins la limite, reviens demain. Pour les abonnés de La Fréquence, un quota élargi arrive bientôt.',
    },
    {
      question: 'Ça marche aussi pour les prompts en anglais ?',
      answer: 'Tu peux coller un prompt anglais. La sortie sera en français. Si tu veux la sortie en anglais, ajoute « FORMAT DE SORTIE : answer in English » dans ton prompt brut.',
    },
    {
      question: 'Comment cet outil a-t-il été construit ?',
      answer: 'Environ 3 heures, avec Claude Code comme assistant. Je ne suis pas développeur full-stack : je suis Deputy Head of IT dans une boîte qui n\'a rien de tech, et j\'ai bossé sur cet outil en marge de mes journées. Le prompt système qui restructure ton input, je l\'ai réécrit une dizaine de fois avant d\'avoir un comportement à peu près prévisible. « 3 heures » ne veut pas dire que tu peux le refaire en 3 heures (ce n\'est pas trivial). Ça veut dire qu\'aujourd\'hui, passer d\'une idée à un outil qui marche prend beaucoup moins de temps qu\'avant, si tu sais bien poser le problème et repérer les moments où l\'IA hallucine.',
    },
  ],
  'le-grand-filtre': [
    {
      question: "Qui est responsable si je me trompe d'outil ?",
      answer: "Toi, et ton conseil juridique. Le grand filtre est une aide à la décision, pas un avis juridique. La qualification précise des données et la conformité d'un déploiement donné doivent être validées par un juriste spécialisé, en particulier sur le volet FINMA. Le document récapitule l'état du marché à la date affichée, les caractéristiques des fournisseurs évoluent.",
    },
    {
      question: "Pourquoi ChatGPT Enterprise est 'risqué' alors qu'il est conforme LPD ?",
      answer: "Parce que la LPD et le secret d'affaires sont deux choses différentes. ChatGPT Enterprise garantit le non-entraînement et un DPA, donc la LPD est respectée. Mais OpenAI reste une entreprise américaine, soumise au Cloud Act. Sur injonction d'un juge américain, elle peut être contrainte de livrer des données, même celles d'un client suisse. La LPD protège les personnes ; le Cloud Act expose les secrets d'entreprise.",
    },
    {
      question: "Self-host = solution parfaite ?",
      answer: "Sur le papier oui, en pratique non. Un VPS étranger fait retomber la résidence et peut réintroduire le Cloud Act par la couche infrastructure. Et la sécurité interne (accès, sauvegardes, durcissement, GPU à payer) devient ton problème. Le risque ne disparaît pas, il se déplace.",
    },
    {
      question: "Et les agents de codage comme Claude Code ou Cursor ?",
      answer: "Ils n'ont pas de conformité propre. Ils héritent de leur backend. Claude Code routé vers l'API Anthropic (US) = profil 'API OpenAI'. Routé vers Bedrock région européenne = profil 'Azure / Bedrock CH'. Et un plan grand public (Pro/Max) peut activer l'entraînement par défaut, même piège que ChatGPT personnel.",
    },
    {
      question: "C'est mis à jour quand ?",
      answer: "La date de dernière révision est affichée en bas de la fiche. Le marché de l'IA en entreprise change rapidement (nouveaux outils, changements de statut DPF, évolutions FINMA). Pour être notifié des mises à jour, inscris-toi à La Fréquence.",
    },
  ],
}
