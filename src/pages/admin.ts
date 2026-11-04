/**
 * Admin-Bereich: einfacher Passwortschutz + Verwaltung von Mitgliedern und Stücken.
 *
 * ACHTUNG: Das ist KEIN echter Zugriffsschutz. Der Code läuft komplett im Browser;
 * wer sich auskennt, kann die Prüfung umgehen. Er verhindert nur versehentliche
 * Änderungen. Die Daten liegen ohnehin nur im eigenen Browser (localStorage).
 */
import '../common'
import {
  blobToDataUrl,
  clearImages,
  dataUrlToBlob,
  getImage,
  imageUrl,
  putImage,
  removeUnusedImages,
} from '../data/images'
import {
  defaultData,
  loadData,
  parseImport,
  playsByYear,
  playUrl,
  resetData,
  saveData,
  uid,
  type ExportFile,
  type Member,
  type Play,
  type SiteData,
} from '../data/store'
import { el, initials, isImageDataUrl, qs } from '../lib/dom'
import { fileToResizedBlob, fileToResizedDataUrl } from '../lib/image'

/** SHA-256 des Admin-Passworts (Klartext steht bewusst nicht im Code). */
const PASSWORD_HASH = 'd74d19c2635b79ff2c6159f231a9842e57e4d437f0a8f0df765004690883ea6a'
const SESSION_KEY = 'tbb-admin-session'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const session = {
  get: () => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  },
  set: (on: boolean) => {
    try {
      if (on) sessionStorage.setItem(SESSION_KEY, '1')
      else sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ohne sessionStorage bleibt man nur bis zum Neuladen angemeldet
    }
  },
}

// --- UI-Helfer ----------------------------------------------------------------
const toastEl = qs('[data-toast]')
let toastTimer = 0
function toast(message: string): void {
  toastEl.textContent = message
  toastEl.classList.add('is-visible')
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2600)
}

let data: SiteData = loadData()

function persist(next: SiteData, message: string): boolean {
  try {
    saveData(next)
    data = next
    toast(message)
    return true
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    return false
  }
}

// --- Login --------------------------------------------------------------------
const loginView = qs('[data-login]')
const dashView = qs('[data-dashboard]')
const loginForm = qs<HTMLFormElement>('[data-login-form]')
const loginError = qs('[data-login-error]')

function showView(): void {
  const loggedIn = session.get()
  loginView.hidden = loggedIn
  dashView.hidden = !loggedIn
  if (loggedIn) renderAll()
  else qs<HTMLInputElement>('#password').focus()
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const input = qs<HTMLInputElement>('#password')
  if (!window.isSecureContext || !crypto.subtle) {
    loginError.textContent = 'Login nur über https:// oder localhost möglich.'
    return
  }
  if ((await sha256(input.value)) === PASSWORD_HASH) {
    session.set(true)
    input.value = ''
    loginError.textContent = ''
    showView()
  } else {
    loginError.textContent = 'Falsches Passwort.'
    input.select()
  }
})

qs('[data-logout]').addEventListener('click', () => {
  session.set(false)
  showView()
})

// --- Tabs ---------------------------------------------------------------------
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')]
function selectTab(name: string): void {
  for (const tab of tabs) {
    const active = tab.dataset.tab === name
    tab.setAttribute('aria-selected', String(active))
    tab.tabIndex = active ? 0 : -1
  }
  document.querySelectorAll<HTMLElement>('[data-panel]').forEach((p) => {
    p.hidden = p.dataset.panel !== name
  })
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab.dataset.tab ?? 'members'))
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]
    if (next) {
      selectTab(next.dataset.tab ?? 'members')
      next.focus()
    }
  })
})

// --- Wiederverwendbare Foto-Auswahl ------------------------------------------
function photoField(input: HTMLInputElement, preview: HTMLImageElement, removeBtn: HTMLButtonElement) {
  let value = ''
  const show = () => {
    const has = isImageDataUrl(value)
    preview.hidden = !has
    removeBtn.hidden = !has
    if (has) preview.src = value
    else preview.removeAttribute('src')
  }
  input.addEventListener('change', async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      value = await fileToResizedDataUrl(file)
      show()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bild konnte nicht verarbeitet werden.')
      input.value = ''
    }
  })
  removeBtn.addEventListener('click', () => {
    value = ''
    input.value = ''
    show()
  })
  return {
    get: () => value,
    set: (v: string) => {
      value = v
      input.value = ''
      show()
    },
  }
}

function listActions(onEdit: () => void, onDelete: () => void, label: string): HTMLElement {
  const edit = el('button', { class: 'btn btn--ghost btn--small', type: 'button', 'aria-label': `${label} bearbeiten`, text: 'Bearbeiten' })
  const del = el('button', { class: 'btn btn--danger btn--small', type: 'button', 'aria-label': `${label} löschen`, text: 'Löschen' })
  edit.addEventListener('click', onEdit)
  del.addEventListener('click', onDelete)
  return el('div', { class: 'admin-list__actions' }, edit, del)
}

// --- Mitglieder ---------------------------------------------------------------
const mForm = qs<HTMLFormElement>('[data-member-form]')
const mBoard = qs<HTMLInputElement>('#m-board')
const mBoardFields = qs('[data-board-fields]')
const mError = qs('[data-member-error]')
const mPhoto = photoField(
  qs<HTMLInputElement>('#m-photo'),
  qs<HTMLImageElement>('[data-member-preview]'),
  qs<HTMLButtonElement>('[data-member-photo-remove]'),
)

mBoard.addEventListener('change', () => {
  mBoardFields.hidden = !mBoard.checked
})

function resetMemberForm(): void {
  mForm.reset()
  ;(mForm.elements.namedItem('id') as HTMLInputElement).value = ''
  mPhoto.set('')
  mBoardFields.hidden = true
  mError.textContent = ''
  qs('[data-member-form-title]').textContent = 'Mitglied hinzufügen'
  qs('[data-member-submit]').textContent = 'Hinzufügen'
  qs('[data-member-cancel]').hidden = true
}

function editMember(m: Member): void {
  const f = mForm.elements
  ;(f.namedItem('id') as HTMLInputElement).value = m.id
  ;(f.namedItem('name') as HTMLInputElement).value = m.name
  mBoard.checked = m.board
  mBoardFields.hidden = !m.board
  ;(f.namedItem('role') as HTMLInputElement).value = m.role
  ;(f.namedItem('email') as HTMLInputElement).value = m.email
  mPhoto.set(m.photo)
  mError.textContent = ''
  qs('[data-member-form-title]').textContent = 'Mitglied bearbeiten'
  qs('[data-member-submit]').textContent = 'Speichern'
  qs('[data-member-cancel]').hidden = false
  mForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
  qs<HTMLInputElement>('#m-name').focus({ preventScroll: true })
}

mForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const f = mForm.elements
  const id = (f.namedItem('id') as HTMLInputElement).value
  const name = (f.namedItem('name') as HTMLInputElement).value.trim()
  const emailInput = f.namedItem('email') as HTMLInputElement
  if (!name) {
    mError.textContent = 'Bitte einen Namen eingeben.'
    return
  }
  if (mBoard.checked && emailInput.value && !emailInput.checkValidity()) {
    mError.textContent = 'Die E-Mail-Adresse ist ungültig.'
    return
  }
  const entry: Member = {
    id: id || uid(),
    name,
    board: mBoard.checked,
    role: mBoard.checked ? (f.namedItem('role') as HTMLInputElement).value.trim() : '',
    email: mBoard.checked ? emailInput.value.trim() : '',
    photo: mPhoto.get(),
  }
  const members = id ? data.members.map((m) => (m.id === id ? entry : m)) : [...data.members, entry]
  if (persist({ ...data, members }, id ? 'Mitglied gespeichert.' : 'Mitglied hinzugefügt.')) {
    resetMemberForm()
    renderMembers()
  }
})

qs('[data-member-cancel]').addEventListener('click', resetMemberForm)

function renderMembers(): void {
  const list = qs('[data-member-admin-list]')
  const sorted = [...data.members].sort(
    (a, b) => Number(b.board) - Number(a.board) || a.name.localeCompare(b.name, 'de'),
  )
  qs('[data-member-count]').textContent = String(sorted.length)
  list.replaceChildren(
    ...sorted.map((m) =>
      el(
        'li',
        {},
        isImageDataUrl(m.photo)
          ? el('img', { class: 'admin-list__thumb', src: m.photo, alt: '' })
          : el('div', { class: 'admin-list__thumb admin-list__thumb--year', text: initials(m.name) }),
        el(
          'div',
          { class: 'admin-list__meta' },
          el('strong', { text: m.name }),
          el('span', { text: m.board ? `Vorstand${m.role ? ` · ${m.role}` : ''}` : 'Mitglied' }),
        ),
        listActions(
          () => editMember(m),
          () => {
            if (!confirm(`„${m.name}“ wirklich löschen?`)) return
            if (persist({ ...data, members: data.members.filter((x) => x.id !== m.id) }, 'Mitglied gelöscht.')) {
              resetMemberForm()
              renderMembers()
            }
          },
          m.name,
        ),
      ),
    ),
  )
}

// --- Theaterstücke ------------------------------------------------------------
const pForm = qs<HTMLFormElement>('[data-play-form]')
const pError = qs('[data-play-error]')
const pPhotosInput = qs<HTMLInputElement>('#p-photos')
const pPhotosStatus = qs('[data-play-photos-status]')
const pGalleryList = qs('[data-play-gallery-edit]')

/** Bild-IDs der Galerie im Formular (Reihenfolge = Anzeigereihenfolge). */
let gallery: string[] = []
let galleryUrls: string[] = []

async function renderGalleryEdit(): Promise<void> {
  galleryUrls.forEach((u) => URL.revokeObjectURL(u))
  galleryUrls = []
  const urls = await Promise.all(gallery.map(imageUrl))
  galleryUrls = urls.filter((u): u is string => Boolean(u))

  const tool = (label: string, text: string, onClick: () => void, disabled = false) => {
    const b = el('button', { type: 'button', 'aria-label': label, title: label, text })
    b.disabled = disabled
    b.addEventListener('click', onClick)
    return b
  }
  const move = (i: number, d: number) => {
    const j = i + d
    const a = gallery[i]
    const b = gallery[j]
    if (a === undefined || b === undefined) return
    gallery[i] = b
    gallery[j] = a
    void renderGalleryEdit()
  }

  pGalleryList.replaceChildren(
    ...gallery.map((id, i) => {
      const url = urls[i]
      return el(
        'li',
        {},
        url ? el('img', { src: url, alt: `Bild ${i + 1}` }) : el('div', { class: 'photo-preview', text: '?' }),
        el(
          'div',
          { class: 'gallery-edit__tools' },
          tool(`Bild ${i + 1} nach vorne`, '‹', () => move(i, -1), i === 0),
          tool(`Bild ${i + 1} entfernen`, '×', () => {
            gallery = gallery.filter((x) => x !== id)
            void renderGalleryEdit()
          }),
          tool(`Bild ${i + 1} nach hinten`, '›', () => move(i, 1), i === gallery.length - 1),
        ),
      )
    }),
  )
  const submitLabel = qs('[data-play-submit]').textContent ?? 'Speichern'
  pPhotosStatus.textContent = gallery.length
    ? `${gallery.length} Bild(er) – übernommen wird erst mit „${submitLabel}“.`
    : ''
}

pPhotosInput.addEventListener('change', async () => {
  const files = [...(pPhotosInput.files ?? [])]
  pPhotosInput.value = ''
  if (files.length === 0) return
  pPhotosInput.disabled = true
  try {
    for (const [i, file] of files.entries()) {
      pPhotosStatus.textContent = `Bilder werden verarbeitet … ${i + 1} / ${files.length}`
      gallery.push(await putImage(await fileToResizedBlob(file)))
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Bild konnte nicht gespeichert werden.')
  } finally {
    pPhotosInput.disabled = false
    void renderGalleryEdit()
  }
})

function resetPlayForm(): void {
  pForm.reset()
  ;(pForm.elements.namedItem('id') as HTMLInputElement).value = ''
  ;(pForm.elements.namedItem('year') as HTMLInputElement).value = String(new Date().getFullYear())
  gallery = []
  pError.textContent = ''
  qs('[data-play-form-title]').textContent = 'Theaterstück hinzufügen'
  qs('[data-play-submit]').textContent = 'Hinzufügen'
  qs('[data-play-cancel]').hidden = true
  void renderGalleryEdit()
}

function editPlay(p: Play): void {
  const f = pForm.elements
  ;(f.namedItem('id') as HTMLInputElement).value = p.id
  ;(f.namedItem('year') as HTMLInputElement).value = String(p.year)
  ;(f.namedItem('title') as HTMLInputElement).value = p.title
  ;(f.namedItem('description') as HTMLTextAreaElement).value = p.description
  gallery = [...p.photos]
  pError.textContent = ''
  qs('[data-play-form-title]').textContent = 'Theaterstück bearbeiten'
  qs('[data-play-submit]').textContent = 'Speichern'
  qs('[data-play-cancel]').hidden = false
  void renderGalleryEdit()
  pForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
  qs<HTMLInputElement>('#p-title').focus({ preventScroll: true })
}

/** Bilder, die zu keinem Stück mehr gehören, aus dem Bild-Speicher löschen. */
const cleanupImages = () => removeUnusedImages(data.plays.flatMap((p) => p.photos)).catch(() => {})

pForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const f = pForm.elements
  const id = (f.namedItem('id') as HTMLInputElement).value
  const year = Number((f.namedItem('year') as HTMLInputElement).value)
  const title = (f.namedItem('title') as HTMLInputElement).value.trim()
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    pError.textContent = 'Bitte ein gültiges Jahr eingeben.'
    return
  }
  if (!title) {
    pError.textContent = 'Bitte einen Titel eingeben.'
    return
  }
  const entry: Play = {
    id: id || uid(),
    year,
    title,
    description: (f.namedItem('description') as HTMLTextAreaElement).value.trim(),
    photos: [...gallery],
  }
  const plays = id ? data.plays.map((p) => (p.id === id ? entry : p)) : [...data.plays, entry]
  if (persist({ ...data, plays }, id ? 'Stück gespeichert.' : 'Stück hinzugefügt.')) {
    void cleanupImages()
    resetPlayForm()
    renderPlays()
  }
})

qs('[data-play-cancel]').addEventListener('click', () => {
  resetPlayForm()
  void cleanupImages()
})

function renderPlays(): void {
  const list = qs('[data-play-admin-list]')
  const sorted = playsByYear(data.plays)
  qs('[data-play-count]').textContent = String(sorted.length)
  list.replaceChildren(
    ...sorted.map((p) => {
      const view = el('a', {
        class: 'btn btn--ghost btn--small',
        href: playUrl(p),
        target: '_blank',
        rel: 'noopener',
        text: 'Ansehen',
      })
      const actions = listActions(
        () => editPlay(p),
        () => {
          if (!confirm(`„${p.title}“ (${p.year}) mit allen Bildern wirklich löschen?`)) return
          if (persist({ ...data, plays: data.plays.filter((x) => x.id !== p.id) }, 'Stück gelöscht.')) {
            void cleanupImages()
            resetPlayForm()
            renderPlays()
          }
        },
        p.title,
      )
      actions.prepend(view)
      const info = [
        String(p.year),
        `${p.photos.length} Bild${p.photos.length === 1 ? '' : 'er'}`,
        p.description ? 'mit Text' : 'kein Text',
      ]
      return el(
        'li',
        {},
        el('div', { class: 'admin-list__thumb admin-list__thumb--year', text: String(p.year).slice(2) }),
        el('div', { class: 'admin-list__meta' }, el('strong', { text: p.title }), el('span', { text: info.join(' · ') })),
        actions,
      )
    }),
  )
}

// --- Export / Import / Zurücksetzen ------------------------------------------
qs('[data-export]').addEventListener('click', async () => {
  const images: Record<string, string> = {}
  for (const id of new Set(data.plays.flatMap((p) => p.photos))) {
    const blob = await getImage(id)
    if (blob) images[id] = await blobToDataUrl(blob)
  }
  const file: ExportFile = { ...data, images }
  const blob = new Blob([JSON.stringify(file)], { type: 'application/json' })
  const a = el('a', {
    href: URL.createObjectURL(blob),
    download: `theaterbuehne-daten-${new Date().toISOString().slice(0, 10)}.json`,
  })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
})

qs<HTMLInputElement>('[data-import]').addEventListener('change', async (e) => {
  const input = e.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    const { data: imported, images } = parseImport(await file.text())
    const count = Object.keys(images).length
    const question = `${imported.members.length} Mitglieder, ${imported.plays.length} Stücke und ${count} Bilder importieren? Der aktuelle Stand wird ersetzt.`
    if (!confirm(question)) return
    for (const [id, url] of Object.entries(images)) await putImage(await dataUrlToBlob(url), id)
    if (persist(imported, 'Daten importiert.')) {
      void cleanupImages()
      renderAll()
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Import fehlgeschlagen.')
  }
})

qs('[data-reset]').addEventListener('click', async () => {
  if (!confirm('Alle Änderungen (inkl. aller Bilder) verwerfen und die Standarddaten wiederherstellen?')) return
  resetData()
  await clearImages()
  data = defaultData()
  toast('Standarddaten wiederhergestellt.')
  renderAll()
})

function renderAll(): void {
  data = loadData()
  resetMemberForm()
  resetPlayForm()
  renderMembers()
  renderPlays()
}

showView()
