/**
 * Detailseite eines Theaterstücks: Text und Bildergalerie werden erst hier geladen.
 * Aufruf: stueck.html?id=<Stück-ID>
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../common'
import { getLenis, initReveal } from '../common'
import { imageUrl } from '../data/images'
import { findPlay, loadData, playsByYear, playUrl, type Play } from '../data/store'
import { el, prefersReducedMotion, qs } from '../lib/dom'

const id = new URLSearchParams(location.search).get('id')
let objectUrls: string[] = []

let refreshTimer = 0
function refreshSoon(): void {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
}

// --- Lightbox -----------------------------------------------------------------
const lightbox = qs<HTMLDialogElement>('[data-lightbox]')
const lbImg = qs<HTMLImageElement>('[data-lightbox-img]')
const lbCount = qs('[data-lightbox-count]')
let lbItems: { src: string; alt: string }[] = []
let lbIndex = 0

function showImage(index: number): void {
  if (lbItems.length === 0) return
  lbIndex = (index + lbItems.length) % lbItems.length
  const item = lbItems[lbIndex]!
  lbImg.src = item.src
  lbImg.alt = item.alt
  lbCount.textContent = `${lbIndex + 1} / ${lbItems.length}`
  const multiple = lbItems.length > 1
  qs('[data-lightbox-prev]').hidden = !multiple
  qs('[data-lightbox-next]').hidden = !multiple
  if (!prefersReducedMotion()) gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.35 })
}

function openLightbox(index: number): void {
  showImage(index)
  getLenis()?.stop()
  lightbox.showModal()
}

lightbox.addEventListener('close', () => getLenis()?.start())
qs('[data-lightbox-close]').addEventListener('click', () => lightbox.close())
qs('[data-lightbox-prev]').addEventListener('click', () => showImage(lbIndex - 1))
qs('[data-lightbox-next]').addEventListener('click', () => showImage(lbIndex + 1))
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close() // Klick auf den dunklen Hintergrund
})
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showImage(lbIndex - 1)
  if (e.key === 'ArrowRight') showImage(lbIndex + 1)
})
// Wischen auf dem Handy
let touchX: number | null = null
lightbox.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') touchX = e.clientX
})
lightbox.addEventListener('pointerup', (e) => {
  if (touchX === null) return
  const dx = e.clientX - touchX
  touchX = null
  if (Math.abs(dx) > 50) showImage(lbIndex + (dx < 0 ? 1 : -1))
})

// --- Inhalt -------------------------------------------------------------------
function renderText(play: Play): boolean {
  const box = qs('[data-play-text]')
  const paragraphs = play.description.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean)
  box.replaceChildren(...paragraphs.map((t) => el('p', { 'data-reveal': '', text: t })))
  qs('[data-play-text-section]').hidden = paragraphs.length === 0
  return paragraphs.length > 0
}

/** Besetzung (Rollen im Stück) und Team (Regie, Souffleuse …) */
function renderCredits(play: Play): boolean {
  const fill = (group: 'cast' | 'crew') => {
    const items = play.credits.filter((c) => c.group === group)
    qs(`[data-credits-${group}]`).replaceChildren(
      ...items.flatMap((c) => [
        el('dt', { text: c.role || '–' }),
        el('dd', { text: c.name || 'N. N.' }),
      ]),
    )
    qs(`[data-credits-${group}-col]`).hidden = items.length === 0
    return items.length
  }
  const total = fill('cast') + fill('crew')
  qs('[data-play-credits-section]').hidden = total === 0
  return total > 0
}

async function renderGallery(play: Play): Promise<boolean> {
  const list = qs('[data-play-gallery]')
  objectUrls.forEach((u) => URL.revokeObjectURL(u))
  objectUrls = []

  const urls = (await Promise.all(play.photos.map(imageUrl))).filter((u): u is string => Boolean(u))
  objectUrls = urls
  lbItems = urls.map((src, i) => ({ src, alt: `„${play.title}“ – Bild ${i + 1} von ${urls.length}` }))

  list.replaceChildren(
    ...lbItems.map((item, i) => {
      const img = el('img', { src: item.src, alt: item.alt, loading: 'lazy' })
      // Bilder verändern beim Laden die Seitenhöhe → Scroll-Animationen neu berechnen
      img.addEventListener('load', refreshSoon, { once: true })
      const btn = el('button', { class: 'gallery__btn', type: 'button', 'aria-label': `${item.alt} vergrößern` }, img)
      btn.addEventListener('click', () => openLightbox(i))
      return el('li', { class: 'gallery__item', 'data-reveal': '' }, btn)
    }),
  )
  qs('[data-play-gallery-section]').hidden = urls.length === 0
  return urls.length > 0
}

function renderNav(play: Play, all: Play[]): void {
  const sorted = playsByYear(all, 'asc')
  const i = sorted.findIndex((p) => p.id === play.id)
  const older = sorted[i - 1]
  const newer = sorted[i + 1]
  const link = (p: Play | undefined, dir: 'prev' | 'next') =>
    p
      ? el(
          'a',
          { class: `play-nav__link play-nav__link--${dir}`, href: playUrl(p) },
          el('span', { class: 'play-nav__label', text: dir === 'prev' ? '← Älteres Stück' : 'Neueres Stück →' }),
          el('strong', { text: `${p.year} · ${p.title}` }),
        )
      : el('span')
  qs('[data-play-nav]').replaceChildren(link(older, 'prev'), link(newer, 'next'))
}

async function render(): Promise<void> {
  const data = loadData()
  const play = findPlay(data, id)

  if (!play) {
    document.title = 'Stück nicht gefunden – Theaterbühne Biberbach'
    qs('[data-play-title]').textContent = 'Stück nicht gefunden'
    qs('[data-play-empty-text]').textContent = 'Dieses Theaterstück gibt es (nicht mehr). Schau im Archiv nach.'
    qs('[data-play-empty]').hidden = false
    return
  }

  document.title = `${play.title} (${play.year}) – Theaterbühne Biberbach`
  qs('[data-play-year]').textContent = String(play.year)
  qs('[data-play-title]').textContent = play.title

  const hasText = renderText(play)
  const hasCredits = renderCredits(play)
  const hasImages = await renderGallery(play)
  qs('[data-play-empty]').hidden = hasText || hasCredits || hasImages
  renderNav(play, data.plays)
  initReveal(qs('#inhalt'))

  if (!prefersReducedMotion()) {
    gsap.from('.play-hero .container > *', { opacity: 0, y: 30, duration: 0.9, ease: 'power3.out', stagger: 0.1 })
  }
}

void render()
