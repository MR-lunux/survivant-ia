// video/src/carousel/data/cycle-angles-morts.ts
// Carrousel LinkedIn pour le post du 2026-06-07 : "les angles morts de l'IA en entreprise suisse".
// Mapping B : les 7 outils du grand filtre compressés en 3 castes (exposés / risqués / protégés).
import type { CycleData } from '../types';

export const cycleAnglesMorts: CycleData = {
  id: 'cycle-angles-morts',
  articleSlug: 'angles-morts-ia-entreprise-suisse',
  hook: {
    line1: "TON IA EST 'SÉCURISÉE'.",
    line2: "Et ton secret d'affaires fuit quand même.",
  },
  setup: {
    kicker: 'LE CONSTAT',
    body: "Le mot 'sécurisé' est jeté à toutes les sauces. Sauf qu'il recouvre trois choses qui ne se recoupent pas : la conformité LPD, la protection du secret d'affaires, la résidence des données. Aucun éditeur ne te le dit comme ça.",
  },
  bascule: {
    kicker: 'LA BASCULE',
    amorce: "J'ai cherché un tableau clair. Il n'existait pas.",
    bascule: "Je l'ai construit. Trois castes d'outils en sortent.",
  },
  leviers: [
    {
      numero: 'I',
      titre: 'Les outils exposés',
      body: "ChatGPT perso, Free, Plus individuel. Tu paies avec tes données : le modèle s'entraîne dessus. Violation directe de la LPD. Le cauchemar du Shadow IT.",
    },
    {
      numero: 'II',
      titre: 'Les outils risqués',
      body: "ChatGPT Team ou Enterprise, API OpenAI avec ZDR. Conformes LPD grâce au DPA et au no-train. Mais soumis au Cloud Act : ton secret d'affaires reste exposé à une injonction américaine.",
    },
    {
      numero: 'III',
      titre: 'Les outils protégés',
      body: "Azure CH ou Bedrock CH avec HYOK et TEE empilés. Infomaniak AI, suisse et chiffré. Self-host bien fait sur infra suisse. Conformité ET souveraineté tiennent ensemble.",
    },
  ],
  quote: {
    quote: "Conformité LPD ne veut pas dire secret d'affaires protégé.",
    attribution: 'Mathieu, Survivant de l\'IA',
  },
  cta: {
    titre: 'Ouvre le grand filtre',
    soustitre: "La matrice complète + PDF téléchargeable. Lien en commentaire du post.",
    url: 'survivant-ia.ch',
  },
};
