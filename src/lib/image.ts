/**
 * Verkleinert ein hochgeladenes Bild und gibt es als JPEG-Data-URL zurück.
 * So bleiben die Fotos klein genug für den localStorage (~5 MB pro Webseite).
 */
export async function fileToResizedDataUrl(file: File, maxSize = 600, quality = 0.8): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Bitte eine Bilddatei auswählen.')

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Das Bild konnte nicht gelesen werden.'))
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
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}
