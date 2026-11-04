import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../common'
import { loadData, onDataChange, playsByYear } from '../data/store'
import { prefersReducedMotion, qs } from '../lib/dom'
import { startParticles } from '../lib/particles'

const reduced = prefersReducedMotion()

// --- Partikel-Netzwerk im Hero ---------------------------------------------
startParticles(qs<HTMLCanvasElement>('.hero__canvas'), { reducedMotion: reduced })

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
  qs('[data-latest-desc]').textContent =
    latest?.description || 'Alle unsere Stücke der letzten Jahre findest du im Archiv.'
}

render()
onDataChange(render)
