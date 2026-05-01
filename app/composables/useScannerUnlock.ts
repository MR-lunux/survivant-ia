// app/composables/useScannerUnlock.ts
const STORAGE_KEY = 'hasUnlockedScanner'

export function useScannerUnlock() {
  // useState() crée un ref partagé par tous les appelants (clé 'scanner-unlocked').
  // Sans ça, chaque composant aurait son propre ref local et markUnlocked()
  // ne propagerait pas l'état au parent — bug de désynchronisation intra-session.
  const isUnlocked = useState<boolean>('scanner-unlocked', () => false)

  onMounted(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        isUnlocked.value = true
      }
    } catch {
      // Safari private mode / disabled storage : on reste à false, pas de plantage
    }
  })

  function markUnlocked() {
    isUnlocked.value = true
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Si localStorage indisponible, on garde l'état en mémoire pour la session
    }
  }

  return { isUnlocked, markUnlocked }
}
