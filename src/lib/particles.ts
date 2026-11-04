/**
 * Animierter Netzwerk-Hintergrund (Partikel, die sich bei Nähe verbinden –
 * Stil eines Wissensgraphen). Reines Canvas, ohne Abhängigkeiten.
 */
interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  accent: boolean
}

interface Options {
  /** Partikel pro 10 000 px² (wird automatisch begrenzt) */
  density?: number
  linkDistance?: number
  reducedMotion?: boolean
}

const RED = '230, 43, 52'
const GREY = '153, 153, 153'

export function startParticles(canvas: HTMLCanvasElement, opts: Options = {}): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const density = opts.density ?? 0.9
  const reduced = opts.reducedMotion ?? false
  let linkDist = opts.linkDistance ?? 140
  let nodes: Node[] = []
  let width = 0
  let height = 0
  let raf = 0
  let running = true
  const pointer = { x: -9999, y: -9999, active: false }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

    linkDist = Math.max(90, Math.min(160, width / 9))
    const count = Math.round(Math.min(150, Math.max(35, (width * height) / 10000 * density)))
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
      accent: Math.random() < 0.12,
    }))
    if (reduced) draw()
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx
      n.y += n.vy
      if (n.x < 0 || n.x > width) n.vx *= -1
      if (n.y < 0 || n.y > height) n.vy *= -1

      if (pointer.active) {
        const dx = n.x - pointer.x
        const dy = n.y - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < 120 * 120 && d2 > 1) {
          const f = (1 - Math.sqrt(d2) / 120) * 0.6
          n.x += (dx / Math.sqrt(d2)) * f
          n.y += (dy / Math.sqrt(d2)) * f
        }
      }
    }
  }

  function draw() {
    ctx!.clearRect(0, 0, width, height)
    const max2 = linkDist * linkDist

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 > max2) continue
        const alpha = (1 - d2 / max2) * 0.45
        const color = a.accent || b.accent ? RED : GREY
        ctx!.strokeStyle = `rgba(${color}, ${alpha})`
        ctx!.lineWidth = a.accent && b.accent ? 1.2 : 0.7
        ctx!.beginPath()
        ctx!.moveTo(a.x, a.y)
        ctx!.lineTo(b.x, b.y)
        ctx!.stroke()
      }
    }

    for (const n of nodes) {
      ctx!.fillStyle = n.accent ? `rgba(${RED}, 0.95)` : `rgba(${GREY}, 0.8)`
      ctx!.beginPath()
      ctx!.arc(n.x, n.y, n.accent ? n.r + 1 : n.r, 0, Math.PI * 2)
      ctx!.fill()
    }
  }

  function loop() {
    if (!running) return
    step()
    draw()
    raf = requestAnimationFrame(loop)
  }

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = true
  }
  const onLeave = () => {
    pointer.active = false
  }

  // Animation pausieren, wenn der Hero nicht sichtbar ist (spart Akku/CPU)
  const visibility = new IntersectionObserver(([entry]) => {
    if (reduced) return
    const visible = entry?.isIntersecting ?? false
    if (visible && !running) {
      running = true
      loop()
    } else if (!visible && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  })

  resize()
  window.addEventListener('resize', resize)
  if (!reduced) {
    canvas.parentElement?.addEventListener('pointermove', onMove)
    canvas.parentElement?.addEventListener('pointerleave', onLeave)
    visibility.observe(canvas)
    loop()
  } else {
    running = false
  }

  return () => {
    running = false
    cancelAnimationFrame(raf)
    visibility.disconnect()
    window.removeEventListener('resize', resize)
    canvas.parentElement?.removeEventListener('pointermove', onMove)
    canvas.parentElement?.removeEventListener('pointerleave', onLeave)
  }
}
