// app/utils/prompt-moderation.ts
// Pré-check modération client-side. Subset minimal des patterns server
// pour économiser un round-trip serveur sur les inputs évidents.
//
// Le serveur fait toujours sa propre passe (défense en profondeur).

const w = (word: string): RegExp => new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i')

const CLIENT_BLOCKED_PATTERNS: { category: string; regex: RegExp }[] = [
  ...['connard', 'connasse', 'salope', 'enculé', 'enculée', 'enfoiré',
      'pute', 'pédé', 'tapette', 'gouine',
      'youpin', 'bougnoule', 'négro', 'nègre',
      'kill yourself', 'kys', 'go die']
    .map(word => ({ category: 'insulte', regex: w(word) })),

  ...['blowjob', 'cumshot', 'gangbang', 'porn', 'porno', 'pornography',
      'baise-moi', 'sucer ma bite', 'enculer']
    .map(word => ({ category: 'sexuel', regex: w(word) })),

  ...['suicider', 'me suicider', 'kill myself',
      'fabriquer une bombe', 'comment faire une bombe', 'how to make a bomb',
      'pédophil', 'child porn']
    .map(word => ({ category: 'nuisible', regex: w(word) })),
]

export interface ClientModerationResult {
  ok: boolean
  category?: string
}

export function checkPromptClientModeration(text: string): ClientModerationResult {
  for (const { category, regex } of CLIENT_BLOCKED_PATTERNS) {
    if (regex.test(text)) return { ok: false, category }
  }
  return { ok: true }
}
