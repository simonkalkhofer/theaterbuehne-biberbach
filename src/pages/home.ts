import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../common'
import { loadData, onDataChange, playsByYear, playUrl } from '../data/store'
import { prefersReducedMotion, qs } from '../lib/dom'
import { startStage } from '../lib/stage'

const reduced = prefersReducedMotion()

// --- Miniatur-Theater im Hero ------------------------------------------------
startStage(qs<HTMLCanvasElement>('.hero__canvas'), { reducedMotion: reduced })

// --- Intro-Animation ---------------------------------------------------------
if (!reduced) {
  gsap.from('[data-hero-anim]', {
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.18,
    delay: 0.15,
  })
}

// --- Kopfzeile: im Hero eingeklappt, beim Scrollen einblenden ----------------
const header = qs('[data-header]')

function setHeaderVisible(visible: boolean): void {
  header.classList.toggle('site-header--hidden', !visible)
  header.toggleAttribute('inert', !visible)
}

ScrollTrigger.create({
  trigger: '.hero',
  start: () => `top+=${Math.min(window.innerHeight * 0.35, 320)} top`,
  onEnter: () => setHeaderVisible(true),
  onLeaveBack: () => setHeaderVisible(false),
})

// --- Dynamische Inhalte aus dem Datenspeicher --------------------------------
function render(): void {
  const data = loadData()
  const plays = playsByYear(data.plays)
  const latest = plays[0]
  const oldest = plays[plays.length - 1]

  qs('[data-stat="plays"]').textContent = String(plays.length)
  qs('[data-stat="members"]').textContent = String(data.members.length)
  qs('[data-stat="since"]').textContent = oldest ? String(oldest.year) : '–'

  qs('[data-latest-year]').textContent = latest ? String(latest.year) : '–'
  qs('[data-latest-title]').textContent = latest ? latest.title : 'Bald mehr'
  // nur ein kurzer Anriss – der ganze Text steht auf der Detailseite
  const text = latest?.description.replace(/\s+/g, ' ').trim() ?? ''
  qs('[data-latest-desc]').textContent = text
    ? text.length > 180
      ? `${text.slice(0, 180).replace(/\s+\S*$/, '')} …`
      : text
    : 'Bilder und mehr zu unserem letzten Stück.'
  const link = qs<HTMLAnchorElement>('[data-latest-link]')
  link.href = latest ? playUrl(latest) : 'archiv.html'
}

render()
onDataChange(render)
