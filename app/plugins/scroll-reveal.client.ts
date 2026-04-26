// app/plugins/scroll-reveal.client.ts
export default defineNuxtPlugin((nuxtApp) => {
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
      mutObs = new MutationObserver(observeAll)
      mutObs.observe(document.body, { childList: true, subtree: true })
    })
  }

  // app:mounted fires once the Vue app is fully hydrated on first load
  nuxtApp.hook('app:mounted', initReveal)
  // page:finish fires after each SPA navigation resolves (including async data)
  nuxtApp.hook('page:finish', initReveal)
})
