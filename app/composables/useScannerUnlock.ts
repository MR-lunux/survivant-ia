// app/composables/useScannerUnlock.ts
const STORAGE_KEY = 'hasUnlockedScanner'

export function useScannerUnlock() {
  const isUnlocked = ref(false)

  onMounted(() => {
    try {
      isUnlocked.value = localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      // Safari private mode / disabled storage : on reste à false, pas de plantage
      isUnlocked.value = false
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
