// app/plugins/scroll-reveal.client.ts
export default defineNuxtPlugin(() => {
  const router = useRouter()

  function initReveal() {
    nextTick(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              const delay = Number(el.dataset.revealDelay ?? 0)
              setTimeout(() => el.classList.add('revealed'), delay)
              observer.unobserve(el)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
      document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => observer.observe(el))
    })
  }

  router.afterEach(() => initReveal())
  initReveal()
})
