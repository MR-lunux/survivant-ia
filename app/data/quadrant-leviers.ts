// app/data/quadrant-leviers.ts
import type { JobQuadrant } from './jobs'

export interface QuadrantLeviers {
  quadrant: JobQuadrant
  intro: string             // Playfair italic, ≤ 100 chars
  leviers: string[]         // exactement 3 items, format: "Titre — Description courte (1-2 phrases)"
}

export const QUADRANT_LEVIERS: QuadrantLeviers[] = [

  {
    quadrant: 'tiens',
    intro: 'Trois leviers pour libérer du temps quand l\'IA ne touche pas ton cœur de métier.',
    leviers: [
      'Allège ton admin avec un agent IA — Génère devis, rappels, factures et courriers types en quelques minutes avec Claude ou ChatGPT. Ton métier reste humain, ton temps libre revient.',
      'Capture le savoir terrain — Dicte tes interventions à un transcripteur IA (Whisper, Otter), tu construis ton manuel sans jamais écrire. Précieux pour transmettre à un junior ou un repreneur.',
      'Veille 5 min par semaine — Demande à un agent IA de te faire un résumé hebdo des évolutions de ta filière. Tu sais ce qui change sans avoir à chercher.',
    ],
  },

  {
    quadrant: 'pilotes',
    intro: 'Trois leviers pour transformer ton avantage en position dominante.',
    leviers: [
      'Mets l\'IA en première ligne sur tes tâches préparatoires — Synthèses de dossiers, recherche, brouillons. Tu valides et signes ; ton temps haut-niveau triple. Outils : Claude, ChatGPT, Perplexity.',
      'Construis ton agent perso sur ton expertise — Avec Claude Projects ou des GPTs personnalisés, capture ta méthodologie pour qu\'elle te rende du temps sur les cas standards. Tu te concentres sur les cas complexes.',
      'Documente publiquement comment tu intègres l\'IA — LinkedIn, blog, conférence. Ta valeur de référent IA dans ton secteur monte avant que les autres ne s\'y mettent.',
    ],
  },

  {
    quadrant: 'pivotes',
    intro: 'Trois leviers pour préparer ton repositionnement avant que la pression ne s\'aggrave.',
    leviers: [
      'Bascule vers un rôle de qualité ou supervision — Les centres de contact, les services client, les back-offices survivent en superviseurs IA. Apprends à arbitrer les escalades complexes que les agents ne savent pas gérer.',
      'Apprends le prompt engineering en 10h — Cours gratuits sur DeepLearning.AI ou Anthropic Academy. Compétence portable et demandée dans tous les secteurs.',
      'Identifie le métier adjacent qui croît — Customer success, formation interne, animation communauté. Ton expertise relationnelle reste précieuse, juste pas à ton poste actuel. Un test : recherche les offres LinkedIn dans ta région avec "AI" + ton secteur.',
    ],
  },

  {
    quadrant: 'mutes',
    intro: 'Trois leviers pour devenir l\'expert IA de ton équipe avant que les autres ne comprennent.',
    leviers: [
      'Intègre l\'IA dans ton flux avant qu\'on te l\'impose — Identifie une tâche qui te coûte 2h/semaine, automatise-la avec Claude, ChatGPT ou Copilot. Documente le gain pour ton manager. Tu deviens la référence interne.',
      'Repositionne ta valeur sur la validation, pas la production — L\'IA produit, tu valides, tu signes, tu portes la responsabilité. Ton métier mute du faire à l\'audit ; c\'est là que se concentre la valeur.',
      'Investis dans l\'évaluation des modèles et le prompt engineering — Sources : Anthropic Academy, DeepLearning.AI Specializations. 4-6h par semaine pendant 2 mois et tu es devant les autres dans ton équipe.',
    ],
  },

]

export function getLeviersByQuadrant(quadrant: JobQuadrant): QuadrantLeviers {
  const found = QUADRANT_LEVIERS.find(q => q.quadrant === quadrant)
  if (!found) throw new Error(`Quadrant ${quadrant} not found in QUADRANT_LEVIERS`)
  return found
}
