// video/src/carousel/data/cycle-prompting.ts
// Carrousel LinkedIn pour le post du 2026-05-21 : "Comment écrire un prompt qui améliore tes réponses".
// Mapping α : décomposition des 6 composants du prompt en 3 leviers (rôle+tâche / format+contexte / contraintes+exemples).
import type { CycleData } from '../types';

export const cyclePrompting: CycleData = {
  id: 'cycle-prompting',
  articleSlug: 'comment-ecrire-prompt-ameliore-reponses',
  hook: {
    line1: "AVANT DE BLÂMER TON IA,",
    line2: "revois ton prompt.",
  },
  setup: {
    kicker: 'LE CONSTAT',
    body: "Tu pestes contre ton IA parce que sa première réponse était au chou ? Entre nous, le problème se situe souvent entre la chaise et le clavier.",
  },
  bascule: {
    kicker: 'LA BASCULE',
    amorce: "La réponse d'une IA, c'est du calcul statistique.",
    bascule: "Pose les bons éléments, et la réponse change.",
  },
  leviers: [
    {
      numero: 'I',
      titre: 'Le rôle et la tâche',
      body: "Dis-lui qui il est et ce qu'il doit faire, précisément. « Tu es un account manager B2B. Rédige un mail de relance en 5 bullets. » Pas d'intention vague, une action chiffrable.",
    },
    {
      numero: 'II',
      titre: 'Le format et le contexte',
      body: "Précise la forme attendue (longueur, structure, ton) et donne-lui la matière première. « Mail court, 120 mots max, ton cordial-ferme. Client = PME suisse, contrat signé il y a 6 mois. »",
    },
    {
      numero: 'III',
      titre: 'Les contraintes et les exemples',
      body: "Liste ce qu'il ne doit PAS faire (souvent plus puissant que ce qu'il doit faire). Et montre-lui 1-2 démos de ce que tu attends. C'est le few-shot prompting.",
    },
  ],
  quote: {
    quote: "Les modèles s'améliorent. Les prompts, c'est à toi de les peaufiner.",
    attribution: 'Mathieu, Survivant de l\'IA',
  },
  cta: {
    titre: 'Améliore ton prompt en 3 secondes',
    soustitre: "Pas d'email, pas de carte — c'est offert. Lien en commentaire du post.",
    url: 'survivant-ia.ch',
  },
};
