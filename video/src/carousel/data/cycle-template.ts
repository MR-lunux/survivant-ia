// video/src/carousel/data/cycle-template.ts
import type { CycleData } from '../types';

export const cycleTemplate: CycleData = {
  id: 'cycle-template',
  articleSlug: 'comment-ne-pas-se-faire-remplacer-par-lia',
  hook: {
    line1: 'TU NE LUTTES PAS CONTRE L\'IA.',
    line2: 'Tu apprends à t\'en servir mieux que les autres.',
  },
  setup: {
    kicker: 'LE CONSTAT',
    body: 'Tu vois l\'IA arriver dans ton job. Tu ne sais pas comment te positionner. Tu n\'es pas seul. Pas un cours de Python. Pas du jargon.',
  },
  bascule: {
    kicker: 'LA BASCULE',
    amorce: 'Tu as raison de sentir le risque.',
    bascule: 'C\'est ta meilleure opportunité depuis dix ans.',
  },
  leviers: [
    {
      numero: 'I',
      titre: 'Maîtriser ce que l\'IA fait mal',
      body: 'Précision du langage, contexte humain, jugement en situation ambiguë. Tu deviens utile là où la machine cale.',
    },
    {
      numero: 'II',
      titre: 'Utiliser l\'IA comme copilote',
      body: 'Automatiser ce qui te ralentit. Pas remplacer ton expertise, augmenter ton débit sur le travail répétitif.',
    },
    {
      numero: 'III',
      titre: 'Renforcer ton relationnel',
      body: 'Stratégie, négociation, jugement éthique. C\'est là que ta valeur devient irremplaçable. La technique se rattrape, la posture humaine non.',
    },
  ],
  quote: {
    quote: 'Tu ne luttes pas contre l\'IA. Tu apprends à t\'en servir mieux que les autres.',
    attribution: 'Mathieu, Deputy Head of IT · Survivant de l\'IA',
  },
  cta: {
    titre: 'Article complet sur le site',
    soustitre: 'La Fréquence : un nouvel article chaque semaine, gratuit.',
    url: 'survivant-ia.ch',
  },
};
