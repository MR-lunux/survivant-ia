// app/plugins/scroll-reveal.client.ts
export default defineNuxtPlugin(() => {
  const router = useRouter()
  let mutObs: MutationObserver | null = null

  const intObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        setTimeout(() => el.classList.add('revealed'), Number(el.dataset.revealDelay ?? 0))
        intObs.unobserve(el)
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )

  function observeAll() {
    document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => intObs.observe(el))
  }

  function initReveal() {
    mutObs?.disconnect()
    nextTick(() => {
      observeAll()
      // Watch for async-loaded elements (e.g. article cards from useAsyncData)
      mutObs = new MutationObserver(observeAll)
      mutObs.observe(document.body, { childList: true, subtree: true })
    })
  }

  router.afterEach(initReveal)
  initReveal()
})
