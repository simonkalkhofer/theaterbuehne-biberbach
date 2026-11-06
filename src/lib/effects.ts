/**
 * Seitenübergreifende Effekte:
 *  - Überschriften mit [data-split] gleiten zeilenweise aus einer Maske (GSAP SplitText)
 *  - Theatervorhang als Seitenübergang zwischen den Seiten
 * Alles entfällt bei prefers-reduced-motion.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion } from './dom'

gsap.registerPlugin(ScrollTrigger, SplitText)

const CURTAIN_FLAG = 'tbb-curtain'

// --- Überschriften ----------------------------------------------------------------
export function initSplitHeadings(root: ParentNode = document): void {
  if (prefersReducedMotion()) return
  root.querySelectorAll<HTMLElement>('[data-split]:not([data-split-done])').forEach((heading) => {
    heading.setAttribute('data-split-done', '')
    SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.1,
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
        }),
    })
  })
}

// --- Vorhang-Seitenübergang ------------------------------------------------------
function buildCurtain(): HTMLElement {
  const curtain = document.createElement('div')
  curtain.className = 'page-curtain'
  curtain.setAttribute('aria-hidden', 'true')
  curtain.innerHTML = '<div class="page-curtain__half page-curtain__half--l"></div><div class="page-curtain__half page-curtain__half--r"></div>'
  document.body.append(curtain)
  return curtain
}

function isInternalPageLink(a: HTMLAnchorElement, e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
  if (a.target && a.target !== '_self') return false
  if (a.hasAttribute('download')) return false
  const url = new URL(a.href, location.href)
  if (url.origin !== location.origin) return false
  if (!/\.html$|\/$/.test(url.pathname)) return false
  // reiner Anker auf derselben Seite → kein Übergang
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return false
  return true
}

export function initPageCurtain(): void {
  const root = document.documentElement
  const incoming = root.classList.contains('curtain-in')
  try {
    sessionStorage.removeItem(CURTAIN_FLAG)
  } catch {
    // ignorieren
  }

  if (prefersReducedMotion()) {
    root.classList.remove('curtain-in')
    return
  }

  const curtain = buildCurtain()
  const halves = curtain.querySelectorAll<HTMLElement>('.page-curtain__half')
  const left = halves[0]!
  const right = halves[1]!
  gsap.set([left, right], { x: 0 })
  const setOpen = () => gsap.set([left, right], { xPercent: (i) => (i === 0 ? -101 : 101) })

  // Ankunft: Vorhang ist (per CSS vor dem ersten Zeichnen) zu und öffnet sich jetzt
  if (incoming) {
    gsap.set([left, right], { xPercent: 0 })
    root.classList.remove('curtain-in')
    // Startseite öffnet ihren eigenen Bühnenvorhang → Seitenvorhang sofort weg
    if (document.body.hasAttribute('data-own-curtain')) setOpen()
    else {
      const opening = gsap.to([left, right], {
        xPercent: (i) => (i === 0 ? -101 : 101),
        duration: 1.1,
        ease: 'power3.inOut',
        delay: 0.1,
      })
      // Sicherheitsnetz: Vorhang darf die Seite nie dauerhaft verdecken
      window.setTimeout(() => {
        if (opening.progress() < 1) {
          opening.kill()
          setOpen()
        }
      }, 2000)
    }
  } else {
    setOpen()
  }

  // Abschied: Vorhang schließt sich, dann zur neuen Seite
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!a || !isInternalPageLink(a, e)) return
    e.preventDefault()
    try {
      sessionStorage.setItem(CURTAIN_FLAG, '1')
    } catch {
      // ohne sessionStorage einfach ohne Ankunfts-Animation
    }
    let gone = false
    const go = () => {
      if (gone) return
      gone = true
      location.assign(a.href)
    }
    gsap.to([left, right], { xPercent: 0, duration: 0.6, ease: 'power3.in', onComplete: go })
    // Sicherheitsnetz: Läuft die Animation nicht (z. B. Tab im Hintergrund), trotzdem wechseln
    window.setTimeout(go, 900)
  })

  // Zurück-Button (bfcache): Seite kommt mit geschlossenem Vorhang zurück → öffnen
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) setOpen()
  })
}
