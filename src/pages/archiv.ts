import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../common'
import { initReveal } from '../common'
import { loadData, onDataChange, playsByYear, type Play } from '../data/store'
import { el, isImageDataUrl, prefersReducedMotion, qs } from '../lib/dom'

let progressTrigger: ScrollTrigger | null = null

function item(p: Play): HTMLLIElement {
  return el(
    'li',
    { class: 'timeline__item', 'data-reveal': '' },
    el('span', { class: 'timeline__year', text: String(p.year) }),
    el(
      'div',
      { class: 'timeline__card' },
      isImageDataUrl(p.photo)
        ? el('div', { class: 'timeline__img' }, el('img', { src: p.photo, alt: `Szene aus „${p.title}“`, loading: 'lazy' }))
        : null,
      el(
        'div',
        {},
        el('h2', { class: 'timeline__title', text: p.title }),
        p.description ? el('p', { class: 'timeline__desc', text: p.description }) : null,
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

render()
onDataChange(render)
