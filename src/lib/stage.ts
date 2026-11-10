/**
 * Miniatur-Theater als animierter Hero-Hintergrund:
 * Bühne mit rotem Vorhang, Scheinwerfern und kleinen Figuren, die herumlaufen,
 * stehen bleiben, gestikulieren und miteinander „reden“. Reines Canvas.
 */

type State = 'walk' | 'idle' | 'talk' | 'bow'

interface Actor {
  /** Position quer über die Bühne, 0 = links, 1 = rechts */
  x: number
  /** Tiefe, 0 = hinten, 1 = vorne */
  t: number
  targetT: number
  dir: 1 | -1
  speed: number
  state: State
  timer: number
  phase: number
  costume: string
  size: number
  line: string
}

interface Spot {
  base: number
  amp: number
  speed: number
  offset: number
  follow: boolean
}

interface Options {
  reducedMotion?: boolean
  /** Vorhang-Zustand (0 = geschlossen, 1 = offen) – kann von außen per GSAP animiert werden */
  curtain?: { open: number }
  /** false: oberen Vorhang (Lambrequin) nicht zeichnen – übernimmt der Seiten-Header */
  valance?: boolean
  /** Höhe des Headers in px, wenn valance = false (Scheinwerfer hängen darunter) */
  headerHeight?: number
}

const RED = '#e62b34'
const LINES = ['…', '!', '?', '♪', 'Ha!', '!!', '…?']

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!

export function startStage(canvas: HTMLCanvasElement, opts: Options = {}): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const c = ctx
  const reduced = opts.reducedMotion ?? false
  const curtain = opts.curtain ?? { open: 1 }

  let W = 0
  let H = 0
  let dpr = 1
  let raf = 0
  let running = false
  let last = 0
  let time = 0
  let actors: Actor[] = []
  const pointer = { x: 0, y: 0, active: false }
  const staticLayer = document.createElement('canvas')

  // Bühnengeometrie (wird in resize() gesetzt)
  const g = { curtainW: 0, valanceH: 0, floorTop: 0, floorFront: 0, backL: 0, backR: 0 }

  const spots: Spot[] = [
    { base: 0.3, amp: 0.12, speed: 0.23, offset: 0, follow: false },
    { base: 0.5, amp: 0.18, speed: 0.17, offset: 2, follow: true },
    { base: 0.7, amp: 0.12, speed: 0.29, offset: 4, follow: false },
  ]

  /** Bildschirmkoordinaten eines Bühnenpunkts. */
  function project(x: number, t: number) {
    const y = g.floorTop + t * (g.floorFront - g.floorTop) * 0.92 + (g.floorFront - g.floorTop) * 0.04
    const left = g.backL + (0 - g.backL) * t * 0.35 + g.curtainW * 0.25 * t
    const right = g.backR + (W - g.backR) * t * 0.35 - g.curtainW * 0.25 * t
    return { sx: left + (right - left) * x, sy: y, scale: 0.55 + t * 0.6 }
  }

  const actorCount = () => (W < 600 ? 4 : W < 1000 ? 6 : 7)

  function createActors() {
    const count = actorCount()
    const costumes = ['#e8e8e8', '#cfcfcf', '#b5b5b5', '#f4f4f4', '#d8d8d8', '#c2c2c2']
    actors = Array.from({ length: count }, (_, i) => ({
      x: rand(0.1, 0.9),
      t: rand(0.1, 0.95),
      targetT: rand(0.1, 0.95),
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: rand(0.03, 0.06),
      state: 'walk' as State,
      timer: rand(1, 4),
      phase: rand(0, Math.PI * 2),
      costume: i === 0 ? RED : pick(costumes),
      // wie im Logo: mal die kleinere, mal die größere Figur
      size: i % 2 ? rand(1.08, 1.2) : rand(0.85, 0.98),
      line: pick(LINES),
    }))
  }

  /** Statische Ebene: Rückwand, Bühnenboden, Rampe. Wird nur bei resize gezeichnet. */
  function drawStatic() {
    staticLayer.width = Math.round(W * dpr)
    staticLayer.height = Math.round(H * dpr)
    const s = staticLayer.getContext('2d')
    if (!s) return
    s.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Rückwand
    const wall = s.createLinearGradient(0, 0, 0, g.floorTop)
    wall.addColorStop(0, '#0a0a0a')
    wall.addColorStop(1, '#1c1c1c')
    s.fillStyle = wall
    s.fillRect(0, 0, W, g.floorTop)

    // dezente Kulisse: Häuser-Silhouetten eines Dorfes
    s.fillStyle = '#161616'
    const baseY = g.floorTop
    let x = g.backL
    let k = 0
    while (x < g.backR) {
      const w = Math.min(rand(50, 110), g.backR - x)
      const h = rand(0.08, 0.16) * H
      s.beginPath()
      s.moveTo(x, baseY)
      s.lineTo(x, baseY - h)
      s.lineTo(x + w / 2, baseY - h - w * 0.45)
      s.lineTo(x + w, baseY - h)
      s.lineTo(x + w, baseY)
      s.closePath()
      s.fill()
      // Fenster
      if (k % 2 === 0 && w > 60) {
        s.fillStyle = 'rgba(255, 210, 140, 0.07)'
        s.fillRect(x + w * 0.3, baseY - h * 0.7, w * 0.16, h * 0.22)
        s.fillRect(x + w * 0.56, baseY - h * 0.7, w * 0.16, h * 0.22)
        s.fillStyle = '#161616'
      }
      x += w + rand(10, 40)
      k++
    }
    // Kirchturm
    const tx = g.backL + (g.backR - g.backL) * 0.62
    const th = H * 0.3
    s.fillRect(tx, baseY - th, 34, th)
    s.beginPath()
    s.moveTo(tx - 4, baseY - th)
    s.lineTo(tx + 17, baseY - th - 70)
    s.lineTo(tx + 38, baseY - th)
    s.fill()

    // Bühnenboden mit Perspektive und Dielen
    const fl = s.createLinearGradient(0, g.floorTop, 0, g.floorFront)
    fl.addColorStop(0, '#2a2420')
    fl.addColorStop(1, '#4a3d33')
    s.fillStyle = fl
    s.beginPath()
    s.moveTo(g.backL, g.floorTop)
    s.lineTo(g.backR, g.floorTop)
    s.lineTo(W, g.floorFront)
    s.lineTo(0, g.floorFront)
    s.closePath()
    s.fill()

    s.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    s.lineWidth = 1
    const planks = 18
    for (let i = 1; i < planks; i++) {
      const f = i / planks
      s.beginPath()
      s.moveTo(g.backL + (g.backR - g.backL) * f, g.floorTop)
      s.lineTo(W * f, g.floorFront)
      s.stroke()
    }

    // Rampe / Bühnenkante vorne
    const apron = s.createLinearGradient(0, g.floorFront, 0, H)
    apron.addColorStop(0, '#111')
    apron.addColorStop(1, '#000')
    s.fillStyle = apron
    s.fillRect(0, g.floorFront, W, H - g.floorFront)
    s.fillStyle = '#2e2e2e'
    s.fillRect(0, g.floorFront, W, 3)
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    W = rect.width
    H = rect.height
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    c.setTransform(dpr, 0, 0, dpr, 0, 0)

    g.curtainW = Math.max(36, Math.min(W * 0.13, 190))
    g.valanceH = opts.valance === false ? (opts.headerHeight ?? 72) : Math.max(40, H * 0.09)
    g.floorTop = H * 0.66
    g.floorFront = H * 0.94
    g.backL = g.curtainW * 1.4
    g.backR = W - g.curtainW * 1.4

    drawStatic()
    if (actors.length !== actorCount()) createActors()
    if (reduced) draw()
  }

  // --- Zeichnen -----------------------------------------------------------------
  function drawSpots() {
    c.save()
    c.globalCompositeOperation = 'lighter'
    for (const s of spots) {
      let cx = W * (s.base + Math.sin(time * s.speed + s.offset) * s.amp)
      if (s.follow && pointer.active) cx = pointer.x
      const pool = project(Math.min(1, Math.max(0, (cx - g.backL) / (g.backR - g.backL))), 0.6)
      const srcX = W * s.base
      const srcY = g.valanceH * 0.7

      // Lichtkegel
      const cone = c.createLinearGradient(0, srcY, 0, pool.sy)
      cone.addColorStop(0, 'rgba(255, 244, 220, 0.16)')
      cone.addColorStop(1, 'rgba(255, 244, 220, 0.03)')
      c.fillStyle = cone
      const spread = W * 0.09
      c.beginPath()
      c.moveTo(srcX - 6, srcY)
      c.lineTo(srcX + 6, srcY)
      c.lineTo(cx + spread, pool.sy)
      c.lineTo(cx - spread, pool.sy)
      c.closePath()
      c.fill()

      // Lichtkegel auf dem Boden
      const r = spread * 1.15
      const glow = c.createRadialGradient(cx, pool.sy, 0, cx, pool.sy, r)
      glow.addColorStop(0, 'rgba(255, 236, 200, 0.22)')
      glow.addColorStop(1, 'rgba(255, 236, 200, 0)')
      c.fillStyle = glow
      c.beginPath()
      c.ellipse(cx, pool.sy, r, r * 0.32, 0, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  }

  /**
   * Figur exakt nach den Logo-Figuren (die zwei Figuren, die das „B“ bilden):
   * runder, frei schwebender Kopf über einem Körper wie ein Rock – oben fast
   * halbrund, unten GESCHLOSSEN, mit einem Fenster in der Mitte.
   * Proportionen aus dem Logo gemessen. Keine Beine, keine Arme, kein Gesicht.
   */
  function drawActor(a: Actor) {
    const p = project(a.x, a.t)
    const unit = Math.max(28, Math.min(H * 0.13, W * 0.11, 120)) * p.scale * a.size
    const x = p.sx
    const y = p.sy
    const walking = a.state === 'walk'
    const talking = a.state === 'talk'
    const swing = walking ? Math.sin(a.phase) : 0
    const bob = walking ? Math.abs(Math.cos(a.phase)) * unit * 0.05 : 0
    const bow = a.state === 'bow' ? Math.sin(Math.min(1, (2.2 - a.timer) / 0.6) * Math.PI) * 0.55 : 0

    // Maße relativ zur Körperbreite – gemessen am Logo-Zeichen
    const bw = unit * 0.5 // Körperbreite
    const bh = bw * 1.2 // Körperhöhe
    const topR = bw * 0.41 // Höhe der Rundung oben (Halbellipse)
    const r = bw * 0.26 // Kopfradius
    const gap = r * 0.95 // Abstand Kopf ↔ Körper
    const winW = bw * 0.44 // Fensterbreite
    const winBottom = -bh * 0.15 // Unterkante Fenster (darunter schmaler, geschlossener Rocksaum)
    const winTop = -bh * 0.67 // Oberkante Fenster

    // Schatten
    c.fillStyle = 'rgba(0, 0, 0, 0.45)'
    c.beginPath()
    c.ellipse(x, y, bw * 0.7, unit * 0.07, 0, 0, Math.PI * 2)
    c.fill()

    c.save()
    c.translate(x, y - bob)
    c.scale(a.dir, 1)
    // Watscheln beim Gehen bzw. Verbeugung – Drehpunkt am Boden
    c.rotate(swing * 0.07 + bow)

    // Körper: gerade Seiten, oben Halbellipse, unten geschlossen (Rock)
    c.fillStyle = a.costume
    c.beginPath()
    c.moveTo(-bw / 2, 0)
    c.lineTo(-bw / 2, -bh + topR)
    c.ellipse(0, -bh + topR, bw / 2, topR, 0, Math.PI, 0)
    c.lineTo(bw / 2, 0)
    c.closePath()
    // Fenster mit runden oberen Ecken (evenodd → durchsichtig wie im Logo)
    c.roundRect(-winW / 2, winTop, winW, winBottom - winTop, [winW * 0.42, winW * 0.42, 0, 0])
    c.fill('evenodd')

    // Kopf schwebt mit Abstand über dem Körper; wippt beim Gehen leicht nach
    const nod = talking ? Math.sin(time * 9 + a.phase) * unit * 0.035 : 0
    const lag = walking ? Math.sin(a.phase + 0.9) * unit * 0.025 : 0
    const headY = -bh - gap - r + nod + lag
    c.beginPath()
    c.arc(bw * 0.05, headY, r, 0, Math.PI * 2)
    c.fill()
    c.restore()

    // Sprechblase
    if (talking) {
      const bx = x + a.dir * unit * 0.25
      const by = y - unit * 1.12 * a.size
      const fs = Math.max(10, unit * 0.2)
      c.font = `800 ${fs}px 'Montserrat Variable', sans-serif`
      const tw = c.measureText(a.line).width
      const bw = tw + fs * 1.1
      const bh = fs * 1.6
      c.fillStyle = 'rgba(255, 255, 255, 0.92)'
      c.beginPath()
      c.roundRect(bx - bw / 2, by - bh, bw, bh, bh / 2)
      c.moveTo(bx - a.dir * fs * 0.2, by - 1)
      c.lineTo(bx - a.dir * fs * 0.6, by + fs * 0.5)
      c.lineTo(bx - a.dir * fs * 0.7, by - 1)
      c.fill()
      c.fillStyle = a.costume === RED ? RED : '#111'
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText(a.line, bx, by - bh / 2 + 1)
    }
  }

  function drawCurtains() {
    const sway = reduced ? 0 : Math.sin(time * 0.6) * 4
    // offen: schmale Seitenvorhänge; geschlossen: beide Hälften treffen sich in der Mitte
    const closed = 1 - Math.min(1, Math.max(0, curtain.open))
    const cw = g.curtainW + (W / 2 + 4 - g.curtainW) * closed
    for (const side of [-1, 1]) {
      c.save()
      if (side === 1) {
        c.translate(W, 0)
        c.scale(-1, 1)
      }
      const grad = c.createLinearGradient(0, 0, cw * 1.25, 0)
      const folds = 5
      for (let i = 0; i <= folds; i++) {
        const f = i / folds
        grad.addColorStop(Math.min(1, f), i % 2 ? '#7d0d14' : '#c41f28')
      }
      c.fillStyle = grad
      c.beginPath()
      c.moveTo(0, 0)
      c.lineTo(cw, 0)
      // gerafft: oben schmal, unten zur Seite ausgestellt
      // geschlossen: gerade Kante (keine Lücke in der Mitte); offen: geraffte Form
      const k = (f: number) => cw * (f + (1 - f) * closed)
      c.bezierCurveTo(k(0.8) + sway, H * 0.35, k(1.25) + sway, H * 0.6, k(1.05) + sway * 0.5, g.floorFront)
      c.lineTo(0, g.floorFront)
      c.closePath()
      c.fill()
      // Kordel
      c.strokeStyle = 'rgba(0, 0, 0, 0.35)'
      c.lineWidth = 3
      c.beginPath()
      c.moveTo(0, H * 0.55)
      c.quadraticCurveTo(cw * 0.6, H * 0.6, cw * 0.95 + sway * 0.6, H * 0.57)
      c.stroke()
      c.restore()
    }

    // Lambrequin (oberer Vorhang) mit Bögen – entfällt, wenn der Header ihn darstellt
    if (opts.valance === false) return
    const vh = g.valanceH
    const top = c.createLinearGradient(0, 0, 0, vh)
    top.addColorStop(0, '#6e0b11')
    top.addColorStop(1, '#c41f28')
    c.fillStyle = top
    c.beginPath()
    c.moveTo(0, 0)
    c.lineTo(W, 0)
    c.lineTo(W, vh)
    const scallops = Math.max(5, Math.round(W / 160))
    const sw = W / scallops
    for (let i = scallops; i > 0; i--) {
      const x0 = i * sw
      c.quadraticCurveTo(x0 - sw / 2, vh + vh * 0.45, x0 - sw, vh)
    }
    c.closePath()
    c.fill()
    c.fillStyle = '#0b0b0b'
    c.fillRect(0, 0, W, Math.max(6, vh * 0.12))
  }

  function drawFootlights() {
    c.save()
    c.globalCompositeOperation = 'lighter'
    const n = Math.max(6, Math.round(W / 120))
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * W
      const flicker = reduced ? 1 : 0.85 + Math.sin(time * 3 + i * 1.7) * 0.15
      const glow = c.createRadialGradient(x, g.floorFront, 0, x, g.floorFront, 60)
      glow.addColorStop(0, `rgba(255, 210, 150, ${0.35 * flicker})`)
      glow.addColorStop(1, 'rgba(255, 210, 150, 0)')
      c.fillStyle = glow
      c.fillRect(x - 60, g.floorFront - 60, 120, 120)
    }
    c.restore()
  }

  function draw() {
    c.clearRect(0, 0, W, H)
    c.drawImage(staticLayer, 0, 0, W, H)
    drawSpots()
    for (const a of [...actors].sort((p, q) => p.t - q.t)) drawActor(a)
    drawFootlights()
    drawCurtains()

    // Abdunkeln hinter dem Text, damit Logo und Slogan gut lesbar bleiben
    const v = c.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, Math.max(W, H) * 0.55)
    v.addColorStop(0, 'rgba(0, 0, 0, 0.45)')
    v.addColorStop(1, 'rgba(0, 0, 0, 0)')
    c.fillStyle = v
    c.fillRect(0, 0, W, H)
  }

  // --- Verhalten der Figuren --------------------------------------------------------
  function update(dt: number) {
    for (const a of actors) {
      a.timer -= dt
      if (a.state === 'walk') {
        a.phase += dt * 9 * (a.speed / 0.045)
        a.x += a.dir * a.speed * dt
        a.t += (a.targetT - a.t) * dt * 0.3
        if (a.x < 0.04 || a.x > 0.96) {
          a.x = Math.min(0.96, Math.max(0.04, a.x))
          a.dir = a.dir === 1 ? -1 : 1
        }
      }
      if (a.timer > 0) continue

      const r = Math.random()
      if (a.state === 'walk') {
        // jemand in der Nähe? → anschauen und „reden“
        const partner = actors.find((b) => b !== a && Math.abs(b.x - a.x) < 0.14 && Math.abs(b.t - a.t) < 0.25)
        if (partner && r < 0.7) {
          a.state = 'talk'
          a.dir = partner.x > a.x ? 1 : -1
          a.line = pick(LINES)
          a.timer = rand(1.5, 3)
        } else if (r < 0.15) {
          a.state = 'bow'
          a.timer = 2.2
        } else {
          a.state = 'idle'
          a.timer = rand(0.6, 2)
        }
      } else {
        a.state = 'walk'
        if (Math.random() < 0.4) a.dir = a.dir === 1 ? -1 : 1
        a.targetT = rand(0.05, 0.95)
        a.speed = rand(0.03, 0.06)
        a.timer = rand(2, 5)
      }
    }
  }

  function loop(now: number) {
    if (!running) return
    const dt = Math.min(0.05, (now - last) / 1000 || 0)
    last = now
    time += dt
    update(dt)
    draw()
    raf = requestAnimationFrame(loop)
  }

  function start() {
    if (running || reduced) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = e.pointerType === 'mouse'
  }
  const onLeave = () => {
    pointer.active = false
  }

  // Animation nur, wenn der Hero sichtbar und der Tab aktiv ist
  let inView = true
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? false
    if (inView && !document.hidden) start()
    else stop()
  })
  const onVisibility = () => {
    if (document.hidden) stop()
    else if (inView) start()
  }

  resize()
  window.addEventListener('resize', resize)
  if (reduced) {
    // ruhiges Standbild: zwei Figuren unterhalten sich
    actors.slice(0, 2).forEach((a, i) => {
      a.state = 'talk'
      a.x = 0.42 + i * 0.12
      a.t = 0.6
      a.dir = i === 0 ? 1 : -1
    })
    draw()
  } else {
    canvas.parentElement?.addEventListener('pointermove', onMove)
    canvas.parentElement?.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    visibility.observe(canvas)
    start()
  }
  // Schrift für Sprechblasen nachladen und Standbild ggf. neu zeichnen
  document.fonts?.ready.then(() => reduced && draw())

  return () => {
    stop()
    visibility.disconnect()
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', onVisibility)
    canvas.parentElement?.removeEventListener('pointermove', onMove)
    canvas.parentElement?.removeEventListener('pointerleave', onLeave)
  }
}
