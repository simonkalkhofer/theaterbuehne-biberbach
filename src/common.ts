/**
 * Gemeinsamer Code für alle Seiten: Smooth Scrolling (Lenis + GSAP),
 * mobile Navigation, Einblende-Animationen und Jahr im Footer.
 */
import './styles/main.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { prefersReducedMotion } from './lib/dom'
import { initPageCurtain, initSplitHeadings } from './lib/effects'

gsap.registerPlugin(ScrollTrigger)

document.documentElement.classList.add('js')

let lenis: Lenis | null = null

function initSmoothScroll(): void {
  if (prefersReducedMotion()) return
  lenis = new Lenis({ autoRaf: false, anchors: { offset: -72 } })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export const getLenis = (): Lenis | null => lenis

function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle')
  const nav = document.querySelector<HTMLElement>('.site-nav')
  if (!toggle || !nav) return

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen')
    nav.classList.toggle('is-open', open)
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'))
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false)
  })
}

/** Elemente mit data-reveal blenden beim Hineinscrollen ein. */
export function initReveal(root: ParentNode = document): void {
  const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-reveal]'))
  if (items.length === 0) return

  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0 })
    return
  }

  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  })
}

function initFooterYear(): void {
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear())
  })
}

initSmoothScroll()
initNav()
initPageCurtain()
initSplitHeadings()
initFooterYear()
initReveal()
