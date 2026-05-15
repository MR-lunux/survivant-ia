// video/src/carousel/data/cycle-dictee.ts
// Carrousel LinkedIn pour le post du 2026-05-15 : "Dictée comptable — l'IA augmente, ne remplace pas".
// Mapping α : décomposition en 3 angles latents (voix / souveraineté / 80-20).
import type { CycleData } from '../types';

export const cycleDictee: CycleData = {
  id: 'cycle-dictee',
  articleSlug: 'dictee-comptable',
  hook: {
    line1: "EN 2026, SAISIR SES ÉCRITURES À LA MAIN,",
    line2: "c'est avoir un pied dans la tombe.",
    icon: 'microphone',
  },
  setup: {
    kicker: 'LE CONSTAT',
    body: "Ouvrir le justificatif, taper le montant, copier le compte, sauvegarder. Et recommencer une énième fois. C'est l'inverse de la valeur ajoutée.",
  },
  bascule: {
    kicker: 'LA BASCULE',
    amorce: 'Tuer la tâche aliénante,',
    bascule: "c'est possible. Et ça commence par la voix.",
  },
  leviers: [
    {
      numero: 'I',
      titre: 'Dicter, pas saisir',
      body: "En 4h, j'ai codé une app de dictée comptable. La voix tue la friction. Vous gardez le contrôle sur la validation, vous lâchez la saisie mécanique.",
    },
    {
      numero: 'II',
      titre: 'IA suisse, données protégées',
      body: "Hébergement Infomaniak. Vos données ne servent à entraîner aucun modèle. RGPD respecté par défaut, pas en option.",
    },
    {
      numero: 'III',
      titre: '80% du gain, 20% du boulot',
      body: "Un prototype imparfait qui libère du temps tout de suite, plutôt qu'un outil parfait qui ne sort jamais. Le reste, c'est de la cosmétique.",
    },
  ],
  quote: {
    quote: "L'IA ne doit pas vous remplacer. Elle doit vous augmenter.",
    attribution: 'Mathieu, Survivant de l\'IA',
  },
  cta: {
    titre: 'Testez le prototype',
    soustitre: 'Pas d\'email, pas de carte — c\'est offert. Lien en commentaire du post.',
    url: 'survivant-ia.ch',
  },
};
