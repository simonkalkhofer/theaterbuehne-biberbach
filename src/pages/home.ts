import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import '../common'
import { loadData, onDataChange, playsByYear, playUrl } from '../data/store'
import { prefersReducedMotion, qs } from '../lib/dom'
import { startStage } from '../lib/stage'

const reduced = prefersReducedMotion()

// --- Miniatur-Theater im Hero: Vorhang öffnet sich beim Laden ---------------
const curtain = { open: reduced ? 1 : 0 }
startStage(qs<HTMLCanvasElement>('.hero__canvas'), {
  reducedMotion: reduced,
  curtain,
  // der obere Vorhang ist der fixierte Seiten-Header (siehe index.html)
  valance: false,
  headerHeight: qs('[data-header]').offsetHeight + 12,
})

if (!reduced) {
  const slogan = SplitText.create('.hero__slogan', { type: 'words', mask: 'words' })
  gsap
    .timeline({ delay: 0.3 })
    .to(curtain, { open: 1, duration: 2, ease: 'power3.inOut' })
    .from('.hero__logo', { opacity: 0, scale: 0.92, duration: 1, ease: 'power3.out' }, '-=1.1')
    .from(slogan.words, { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.08 }, '-=0.6')
    // .hero__scroll ist per CSS zentriert (translateX) → nur einblenden
    .from('.hero__scroll', { opacity: 0, duration: 0.8 }, '-=0.4')

  // Beim Herausscrollen: Text schwebt nach oben und blendet aus (Parallax)
  gsap.to('.hero__content', {
    yPercent: -25,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 30%', scrub: true },
  })
}

// --- Kopfzeile = oberer Bühnenvorhang; Logo + Menü erscheinen beim Scrollen ----
const header = qs('[data-header]')
const headerInner = qs('[data-header-inner]')

function setHeaderVisible(visible: boolean): void {
  header.classList.toggle('is-scrolled', visible)
  headerInner.toggleAttribute('inert', !visible)
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

// --- Zahlen zählen hoch, große Jahreszahl gleitet beim Scrollen ----------------
if (!reduced) {
  document.querySelectorAll<HTMLElement>('[data-stat]').forEach((node) => {
    const target = Number(node.textContent)
    if (!Number.isFinite(target) || target === 0) return
    // Jahreszahlen ab 1900 zählen nur die letzten Schritte hoch
    const from = target > 1900 ? target - 25 : 0
    const counter = { value: from }
    node.textContent = String(from)
    gsap.to(counter, {
      value: target,
      duration: 1.6,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate: () => {
        node.textContent = String(counter.value)
      },
      scrollTrigger: { trigger: node, start: 'top 90%', once: true },
    })
  })

  gsap.fromTo(
    '.latest__year',
    { yPercent: 25 },
    {
      yPercent: -25,
      ease: 'none',
      scrollTrigger: { trigger: '.latest', start: 'top bottom', end: 'bottom top', scrub: true },
    },
  )
}
