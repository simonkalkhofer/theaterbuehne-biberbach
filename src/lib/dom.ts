/** Kleine DOM-Helfer. Alle Nutzerdaten werden über textContent gesetzt (kein innerHTML → kein XSS). */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, string>> = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else node.setAttribute(key, value)
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue
    node.append(child)
  }
  return node
}

export function qs<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector)
  if (!found) throw new Error(`Element nicht gefunden: ${selector}`)
  return found
}

/** Initialen für Platzhalter-Fotos, z. B. „Max Muster“ → „MM“. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/** Nur sichere E-Mail-Adressen als mailto-Link zulassen. */
export function isEmail(value: string): boolean {
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value)
}

/** Nur Bilder als Data-URL zulassen (verhindert z. B. javascript:-URLs). */
export function isImageDataUrl(value: string): boolean {
  return /^data:image\/(jpeg|png|webp|gif);base64,[a-z0-9+/=]+$/i.test(value)
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
