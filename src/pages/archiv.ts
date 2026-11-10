import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../common'
import { initReveal } from '../common'
import { initData, loadData, onDataChange, playsByYear, playUrl, type Play } from '../data/store'
import { el, prefersReducedMotion, qs } from '../lib/dom'

let progressTrigger: ScrollTrigger | null = null

/** Übersicht zeigt nur Jahr + Titel; Bilder und Text gibt es erst auf der Detailseite. */
function item(p: Play): HTMLLIElement {
  const hint = p.photos.length > 0 ? `${p.photos.length} Bilder & mehr` : 'Zum Stück'
  return el(
    'li',
    { class: 'timeline__item', 'data-reveal': '' },
    el(
      'a',
      { class: 'timeline__link', href: playUrl(p) },
      el('span', { class: 'timeline__year', text: String(p.year) }),
      el(
        'div',
        { class: 'timeline__card' },
        el('div', {}, el('h2', { class: 'timeline__title', text: p.title }), el('span', { class: 'timeline__more', text: hint })),
      ),
    ),
  )
}

function render(): void {
  const list = qs('[data-timeline]')
  // Chronologisch: neuestes Stück oben
  const plays = playsByYear(loadData().plays, 'desc')
  const progress = qs('[data-timeline-progress]')

  list.replaceChildren(
    ...(plays.length ? plays.map(item) : [el('li', { class: 'empty', text: 'Noch keine Stücke im Archiv.' })]),
  )
  initReveal(list)

  progressTrigger?.kill()
  if (prefersReducedMotion()) {
    gsap.set(progress, { scaleY: 1 })
  } else {
    progressTrigger = ScrollTrigger.create({
      trigger: list,
      start: 'top 70%',
      end: 'bottom 70%',
      scrub: true,
      animation: gsap.fromTo(progress, { scaleY: 0 }, { scaleY: 1, ease: 'none' }),
    })
  }
  ScrollTrigger.refresh()
}

await initData()
render()
onDataChange(render)
