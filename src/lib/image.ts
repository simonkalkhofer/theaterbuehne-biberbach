/**
 * Verkleinert hochgeladene Bilder im Browser, bevor sie gespeichert werden.
 */

async function drawResized(file: File, maxSize: number): Promise<HTMLCanvasElement> {
  if (!file.type.startsWith('image/')) throw new Error(`„${file.name}“ ist keine Bilddatei.`)

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(`„${file.name}“ konnte nicht gelesen werden.`))
      image.src = url
    })

    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Bildbearbeitung wird von diesem Browser nicht unterstützt.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Bild als JPEG-Blob für den Upload auf den Server. */
export async function fileToResizedBlob(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  const canvas = await drawResized(file, maxSize)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Bild konnte nicht umgewandelt werden.'))),
      'image/jpeg',
      quality,
    ),
  )
}
