// server/utils/ameliorer-prompt-moderation.ts
// Wordlist de modération pour l'améliorateur de prompt.
// Inspirée LDNOOBW FR + ajouts custom (Cluster sexuel + Cluster nuisible).
// Patterns en \bword\b pour minimiser les faux positifs.
//
// Couvre :
// - insulte : injures ciblées, propos haineux racistes/sexistes/homophobes
// - sexuel : contenu sexuel explicite, pornographique
// - nuisible : automutilation, fabrication d'armes/drogues, exploitation mineurs
// - diffamation : pattern "[X] est un [insulte]"

export type ModerationCategory = 'insulte' | 'sexuel' | 'nuisible' | 'diffamation'

export interface ModerationPattern {
  category: ModerationCategory
  regex: RegExp
}

// Helper pour générer un pattern \bword\b case-insensitive.
const w = (word: string): RegExp => new RegExp(`\\b${word}\\b`, 'i')

export const BLOCKED_PATTERNS: ModerationPattern[] = [
  // ─── INSULTES (FR) ───
  ...['connard', 'connasse', 'salope', 'salaud', 'enculé', 'enculée', 'enfoiré',
      'pute', 'putain', 'pédé', 'tapette', 'tarlouze', 'gouine',
      'youpin', 'youpine', 'bougnoule', 'négro', 'nègre', 'bicot',
      'nazi', 'sale juif', 'sale arabe', 'sale noir', 'sale blanc',
      'crève', 'va mourir', 'sale chien', 'sale chienne']
    .map(word => ({ category: 'insulte' as const, regex: w(word) })),

  // ─── INSULTES (EN) ───
  ...['nigger', 'nigga', 'faggot', 'tranny', 'kike', 'spic', 'chink',
      'retard', 'cunt', 'whore', 'slut',
      'kill yourself', 'kys', 'go die']
    .map(word => ({ category: 'insulte' as const, regex: w(word.replace(/\s+/g, '\\s+')) })),

  // ─── SEXUEL EXPLICITE (FR) ───
  ...['baise-moi', 'sucer ma bite', 'me sucer', 'enculer', 'ejaculer sur',
      'porno', 'pornographique', 'pornographie',
      'gros seins', 'gros cul', 'chatte mouillée', 'bite dure', 'queue dure']
    .map(word => ({ category: 'sexuel' as const, regex: w(word.replace(/\s+/g, '\\s+')) })),

  // ─── SEXUEL EXPLICITE (EN) ───
  ...['blowjob', 'handjob', 'cumshot', 'gangbang', 'rimjob',
      'porn', 'pornography', 'porno',
      'big tits', 'big ass', 'wet pussy', 'hard dick', 'fuck me']
    .map(word => ({ category: 'sexuel' as const, regex: w(word.replace(/\s+/g, '\\s+')) })),

  // ─── NUISIBLE ───
  ...['suicider', 'me suicider', 'comment se suicider',
      'fabriquer une bombe', 'comment faire une bombe', 'construire une arme',
      'synthétiser de la méthamphétamine', 'fabriquer de la drogue',
      'comment empoisonner', 'préparer un poison',
      'mineure nue', 'mineur nu', 'enfant nu', 'enfant nue',
      'pédophil', 'cp ', 'child porn']
    .map(word => ({ category: 'nuisible' as const, regex: w(word.replace(/\s+/g, '\\s+')) })),

  // ─── NUISIBLE (EN) ───
  ...['kill myself', 'how to suicide', 'how to make a bomb',
      'how to poison', 'synthesize meth', 'make drugs at home',
      'minor naked', 'child naked', 'pedophil']
    .map(word => ({ category: 'nuisible' as const, regex: w(word.replace(/\s+/g, '\\s+')) })),

  // ─── DIFFAMATION (pattern générique) ───
  // "[Nom propre commençant par majuscule] est un/une [insulte]"
  {
    category: 'diffamation',
    regex: /\b[A-ZÉÈÊÀÔÎÛÇ][a-zéèêàôîûç]+\s+(?:est|était)\s+(?:un|une)\s+(?:connard|salope|enculé|pute|pédé|voleur|menteur|nazi|raciste|pervers|pédophile)\b/i,
  },
]

export interface ModerationResult {
  ok: boolean
  category?: ModerationCategory
}

export function checkModeration(text: string): ModerationResult {
  for (const { category, regex } of BLOCKED_PATTERNS) {
    if (regex.test(text)) return { ok: false, category }
  }
  return { ok: true }
}

// Used after the AI structured response, to check the rewritten fields.
export function checkModerationOnOutput(structured: {
  role: string
  task: string
  context?: string | null
  constraints?: string | null
}): ModerationResult {
  const joined = [structured.role, structured.task, structured.context ?? '', structured.constraints ?? ''].join(' ')
  return checkModeration(joined)
}
