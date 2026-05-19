// app/data/ameliorer-prompt-examples.ts
// 3 exemples avant/après cliquables pour démo (V1-Pédago).
// Pré-générés, statiques, aucun appel API au clic.

export interface AmeliorerPromptExampleAddition {
  field: 'role' | 'task' | 'format' | 'context' | 'constraints' | 'examples'
  before: string
  after: string
  explanation: string
}

export interface AmeliorerPromptExampleAfter {
  structured: {
    role: string
    task: string
    format: string
    context: string | null
    constraints: string | null
    examples: string | null
  }
  additions: AmeliorerPromptExampleAddition[]
  already_solid: false
}

export interface AmeliorerPromptExample {
  id: 'mail-relance' | 'synthese-reunion' | 'analyse-tableau'
  label: string
  category: 'COMMUNICATION' | 'SYNTHÈSE' | 'ANALYSE'
  hint: string
  before: string
  after: AmeliorerPromptExampleAfter
}

export const AMELIORER_PROMPT_EXAMPLES: AmeliorerPromptExample[] = [
  {
    id: 'mail-relance',
    label: 'Un mail de relance',
    category: 'COMMUNICATION',
    hint: 'Un classique : tu veux relancer un client mais sans avoir l\'air désespéré.',
    before: 'Fais-moi un mail de relance pour un client qui répond pas',
    after: {
      structured: {
        role: 'Tu es un account manager B2B suisse, ton ton est cordial-ferme.',
        task: 'Rédige un mail de relance pour un client qui n\'a pas répondu à un précédent message commercial depuis 14 jours.',
        format: 'Mail court (max 120 mots), structure : salutation / rappel du sujet précédent / proposition d\'action concrète / signature « Cordialement, [Prénom] ».',
        context: null,
        constraints: 'Pas de superlatifs marketing. Pas de mention du prix. Pas de proposition d\'appel téléphonique auto-imposée.',
        examples: null,
      },
      additions: [
        { field: 'role', before: 'absent', after: 'account manager B2B suisse', explanation: 'Tu n\'avais pas donné de rôle — j\'ai mis « account manager B2B » parce que ton prompt parle de relance commerciale.' },
        { field: 'task', before: 'mail de relance pour un client qui répond pas', after: 'mail de relance pour un client qui n\'a pas répondu depuis 14 jours', explanation: 'Tu disais « répond pas » sans préciser le délai — j\'ai mis « depuis 14 jours » pour que l\'IA dose le ton.' },
        { field: 'format', before: 'absent', after: 'max 120 mots, 3 temps (salutation / rappel / action)', explanation: 'J\'ai imposé un format précis pour éviter le mail-roman.' },
        { field: 'constraints', before: 'absent', after: 'pas de superlatifs, pas de prix, pas d\'appel auto-proposé', explanation: 'J\'ai ajouté 3 contraintes qui empêchent les pièges habituels.' },
      ],
      already_solid: false,
    },
  },
  {
    id: 'synthese-reunion',
    label: 'Un compte-rendu de réunion',
    category: 'SYNTHÈSE',
    hint: 'Tu sors d\'une réunion, tu veux un CR exécutif qui ne noie pas les vrais sujets.',
    before: 'Résume cette réunion',
    after: {
      structured: {
        role: 'Tu es un chef de projet expérimenté, habitué aux comptes-rendus B2B.',
        task: 'Rédige une synthèse exécutive d\'une réunion à partir des notes que je fournirai.',
        format: '5 sections en bullets : (1) Décisions prises (2) Actions à mener avec responsable + deadline (3) Points en suspens (4) Désaccords notés (5) Prochaine étape. Pas de phrases longues.',
        context: '[Tu colleras les notes de réunion ici]',
        constraints: 'Ne reformule pas les phrases des participants en les édulcorant. Si une action n\'a pas de responsable, écris « responsable à clarifier ».',
        examples: null,
      },
      additions: [
        { field: 'role', before: 'absent', after: 'chef de projet expérimenté', explanation: 'Tu n\'avais pas de rôle — j\'ai mis « chef de projet » pour orienter la synthèse vers l\'action plutôt que la narration.' },
        { field: 'format', before: 'absent', after: '5 sections en bullets (décisions / actions / suspens / désaccords / next)', explanation: 'Tu disais « résume » sans structure — j\'ai imposé 5 sections (la grille standard CR).' },
        { field: 'constraints', before: 'absent', after: 'pas d\'édulcoration, responsables nommés', explanation: 'Sans contrainte anti-édulcoration, l\'IA arrondit les angles et tu perds les vrais conflits.' },
        { field: 'context', before: 'absent', after: '[Tu colleras les notes de réunion ici]', explanation: 'J\'ai ajouté un placeholder de contexte pour que tu n\'oublies pas de coller tes notes.' },
      ],
      already_solid: false,
    },
  },
  {
    id: 'analyse-tableau',
    label: 'Insights d\'un tableau',
    category: 'ANALYSE',
    hint: 'Tu as un tableau de chiffres, tu veux des enseignements business — pas une description.',
    before: 'Analyse ce tableau Excel et donne-moi les insights',
    after: {
      structured: {
        role: 'Tu es un analyste data B2B, focalisé sur les enseignements business actionnables.',
        task: 'Analyse les données ci-dessous et identifie les 3 enseignements business les plus actionnables.',
        format: 'Pour chaque enseignement : (a) chiffre ou tendance observée, (b) ce que ça implique business, (c) une action concrète recommandée. 3 enseignements max.',
        context: '[Tu colleras les données ici]',
        constraints: 'Pas d\'observations triviales (« les chiffres varient »). Pas de jargon stat sauf si essentiel. Si pas assez de données pour un enseignement solide, dis-le.',
        examples: null,
      },
      additions: [
        { field: 'role', before: 'absent', after: 'analyste data B2B', explanation: 'Tu n\'avais pas de rôle — j\'ai mis « analyste data » pour cadrer le niveau d\'analyse.' },
        { field: 'task', before: 'donne-moi les insights', after: 'identifie les 3 enseignements les plus actionnables', explanation: 'Tu disais « insights » sans nombre — j\'ai limité à 3, pour forcer la priorisation.' },
        { field: 'format', before: 'absent', after: 'triplet par enseignement (chiffre / implication / action)', explanation: 'J\'ai ajouté un format en triplet pour éviter les observations descriptives sans valeur.' },
        { field: 'constraints', before: 'absent', after: 'pas de jargon stat, dire « pas assez de données » si besoin', explanation: 'J\'ai mis « pas de jargon stat » pour que ce soit lisible par un non-data scientist.' },
      ],
      already_solid: false,
    },
  },
]
