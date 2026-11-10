/**
 * Admin-Bereich: Login über den Server, Verwaltung von Mitgliedern und Stücken.
 * „Speichern“ schreibt direkt auf den Server – alle Besucher sehen die Änderung sofort.
 * Passwort, Sitzung und Rechte prüft ausschließlich der Server (server/auth.ts).
 */
import '../common'
import { ApiError, getSession, imageSrc, login, logout, uploadImage } from '../data/api'
import {
  byLastName,
  defaultData,
  initData,
  loadData,
  parseImport,
  playsByYear,
  playUrl,
  saveData,
  uid,
  type Credit,
  type Member,
  type Play,
  type SiteData,
} from '../data/store'
import { el, initials, qs } from '../lib/dom'
import { fileToResizedBlob } from '../lib/image'

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
let saving = false

/** Speichert auf dem Server. Bei abgelaufener Sitzung zurück zum Login. */
async function persist(next: SiteData, message: string): Promise<boolean> {
  if (saving) return false
  saving = true
  document.body.classList.add('is-saving')
  try {
    data = await saveData(next)
    toast(`${message} Für alle Besucher sichtbar.`)
    return true
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      alert('Deine Anmeldung ist abgelaufen. Bitte neu anmelden – die letzte Änderung wurde nicht gespeichert.')
      await void showView()
    } else {
      alert(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    }
    return false
  } finally {
    saving = false
    document.body.classList.remove('is-saving')
  }
}

// --- Login --------------------------------------------------------------------
const loginView = qs('[data-login]')
const dashView = qs('[data-dashboard]')
const loginForm = qs<HTMLFormElement>('[data-login-form]')
const loginError = qs('[data-login-error]')

async function showView(): Promise<void> {
  let loggedIn = false
  try {
    const s = await getSession()
    loggedIn = s.loggedIn
    if (!s.configured) loginError.textContent = 'Auf dem Server ist noch kein Admin-Passwort eingerichtet.'
  } catch (err) {
    loginError.textContent = err instanceof Error ? err.message : 'Server nicht erreichbar.'
  }
  loginView.hidden = loggedIn
  dashView.hidden = !loggedIn
  if (loggedIn) {
    await initData()
    renderAll()
  } else {
    qs<HTMLInputElement>('#password').focus()
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const input = qs<HTMLInputElement>('#password')
  const button = loginForm.querySelector<HTMLButtonElement>('button[type="submit"]')
  if (button) button.disabled = true
  try {
    await login(input.value)
    input.value = ''
    loginError.textContent = ''
    await showView()
  } catch (err) {
    loginError.textContent = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.'
    input.select()
  } finally {
    if (button) button.disabled = false
  }
})

qs('[data-logout]').addEventListener('click', async () => {
  try {
    await logout()
  } catch {
    // auch ohne Server-Antwort lokal abmelden
  }
  await showView()
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
    const has = Boolean(value)
    preview.hidden = !has
    removeBtn.hidden = !has
    if (has) preview.src = imageSrc(value)
    else preview.removeAttribute('src')
  }
  input.addEventListener('change', async () => {
    const file = input.files?.[0]
    if (!file) return
    input.disabled = true
    try {
      value = await uploadImage(await fileToResizedBlob(file, 800, 0.82))
      show()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bild konnte nicht hochgeladen werden.')
      input.value = ''
    } finally {
      input.disabled = false
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

mForm.addEventListener('submit', async (e) => {
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
  if (await persist({ ...data, members }, id ? 'Mitglied gespeichert.' : 'Mitglied hinzugefügt.')) {
    resetMemberForm()
    renderMembers()
    renderMemberNameOptions()
  }
})

qs('[data-member-cancel]').addEventListener('click', resetMemberForm)

function renderMembers(): void {
  const list = qs('[data-member-admin-list]')
  const sorted = [...data.members].sort(
    (a, b) => Number(b.board) - Number(a.board) || (a.board ? 0 : byLastName(a, b)),
  )
  qs('[data-member-count]').textContent = String(sorted.length)
  list.replaceChildren(
    ...sorted.map((m) =>
      el(
        'li',
        {},
        m.photo
          ? el('img', { class: 'admin-list__thumb', src: imageSrc(m.photo), alt: '' })
          : el('div', { class: 'admin-list__thumb admin-list__thumb--year', text: initials(m.name) }),
        el(
          'div',
          { class: 'admin-list__meta' },
          el('strong', { text: m.name }),
          el('span', { text: m.board ? `Vorstand${m.role ? ` · ${m.role}` : ''}` : 'Mitglied' }),
        ),
        listActions(
          () => editMember(m),
          async () => {
            if (!confirm(`„${m.name}“ wirklich löschen?`)) return
            if (await persist({ ...data, members: data.members.filter((x) => x.id !== m.id) }, 'Mitglied gelöscht.')) {
              resetMemberForm()
              renderMembers()
              renderMemberNameOptions()
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

async function renderGalleryEdit(): Promise<void> {
  const urls = gallery.map(imageSrc)

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
      pPhotosStatus.textContent = `Bilder werden hochgeladen … ${i + 1} / ${files.length}`
      gallery.push(await uploadImage(await fileToResizedBlob(file)))
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Bild konnte nicht gespeichert werden.')
  } finally {
    pPhotosInput.disabled = false
    void renderGalleryEdit()
  }
})

// --- Rollen & Team (Credits) im Stück-Formular ---------------------------------
const creditRows = qs('[data-credit-rows]')

function addCreditRow(credit: Credit = { role: '', name: '', group: 'cast' }): void {
  const group = el(
    'select',
    { 'aria-label': 'Art', 'data-credit-group': '' },
    el('option', { value: 'cast', text: 'Rolle' }),
    el('option', { value: 'crew', text: 'Team' }),
  )
  group.value = credit.group
  const role = el('input', {
    'aria-label': 'Rolle bzw. Aufgabe',
    placeholder: credit.group === 'crew' ? 'z. B. Regie' : 'z. B. Opa Willi',
    maxlength: '80',
    'data-credit-role': '',
  })
  role.value = credit.role
  const name = el('input', {
    'aria-label': 'Name',
    placeholder: 'Name',
    list: 'member-names',
    maxlength: '80',
    'data-credit-name': '',
  })
  name.value = credit.name
  const remove = el('button', { type: 'button', class: 'btn btn--danger btn--small', 'aria-label': 'Zeile entfernen', text: '×' })
  const row = el('div', { class: 'credit-row' }, group, role, name, remove)
  remove.addEventListener('click', () => row.remove())
  group.addEventListener('change', () => {
    role.placeholder = group.value === 'crew' ? 'z. B. Regie' : 'z. B. Opa Willi'
  })
  creditRows.append(row)
}

function setCredits(credits: Credit[]): void {
  creditRows.replaceChildren()
  // Team zuerst (Regie …), dann die Rollen
  ;[...credits].sort((a, b) => (a.group === b.group ? 0 : a.group === 'crew' ? -1 : 1)).forEach((c) => addCreditRow(c))
}

function readCredits(): Credit[] {
  return [...creditRows.querySelectorAll<HTMLElement>('.credit-row')]
    .map((row) => ({
      group: (qs<HTMLSelectElement>('[data-credit-group]', row).value === 'crew' ? 'crew' : 'cast') as Credit['group'],
      role: qs<HTMLInputElement>('[data-credit-role]', row).value.trim(),
      name: qs<HTMLInputElement>('[data-credit-name]', row).value.trim(),
    }))
    .filter((c) => c.role || c.name)
}

document.querySelectorAll<HTMLButtonElement>('[data-credit-add]').forEach((btn) =>
  btn.addEventListener('click', () => {
    addCreditRow({ role: '', name: '', group: btn.dataset.creditAdd === 'crew' ? 'crew' : 'cast' })
    creditRows.querySelector<HTMLInputElement>('.credit-row:last-child [data-credit-role]')?.focus()
  }),
)

/** Namensvorschläge aus der Mitgliederliste */
function renderMemberNameOptions(): void {
  qs('[data-member-names]').replaceChildren(
    ...[...data.members].sort(byLastName).map((m) => el('option', { value: m.name })),
  )
}

function resetPlayForm(): void {
  pForm.reset()
  ;(pForm.elements.namedItem('id') as HTMLInputElement).value = ''
  ;(pForm.elements.namedItem('year') as HTMLInputElement).value = String(new Date().getFullYear())
  gallery = []
  setCredits([])
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
  setCredits(p.credits)
  pError.textContent = ''
  qs('[data-play-form-title]').textContent = 'Theaterstück bearbeiten'
  qs('[data-play-submit]').textContent = 'Speichern'
  qs('[data-play-cancel]').hidden = false
  void renderGalleryEdit()
  pForm.scrollIntoView({ behavior: 'smooth', block: 'start' })
  qs<HTMLInputElement>('#p-title').focus({ preventScroll: true })
}

pForm.addEventListener('submit', async (e) => {
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
    credits: readCredits(),
  }
  const plays = id ? data.plays.map((p) => (p.id === id ? entry : p)) : [...data.plays, entry]
  if (await persist({ ...data, plays }, id ? 'Stück gespeichert.' : 'Stück hinzugefügt.')) {
    resetPlayForm()
    renderPlays()
  }
})

// (nicht gespeicherte Uploads räumt der Server später automatisch auf)
qs('[data-play-cancel]').addEventListener('click', resetPlayForm)

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
        async () => {
          if (!confirm(`„${p.title}“ (${p.year}) mit allen Bildern wirklich löschen?`)) return
          if (await persist({ ...data, plays: data.plays.filter((x) => x.id !== p.id) }, 'Stück gelöscht.')) {
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
        `${p.credits.length} Rolle${p.credits.length === 1 ? '' : 'n'}`,
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
qs('[data-export]').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
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
    const imported = parseImport(await file.text())
    const question = `${imported.members.length} Mitglieder und ${imported.plays.length} Stücke importieren? Der aktuelle Stand auf dem Server wird ersetzt.`
    if (!confirm(question)) return
    if (await persist(imported, 'Daten importiert.')) renderAll()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Import fehlgeschlagen.')
  }
})

qs('[data-reset]').addEventListener('click', async () => {
  if (!confirm('Alle Inhalte auf dem Server durch die Standarddaten ersetzen? Texte, Bilder und Rollen der Stücke gehen verloren.')) return
  if (await persist(defaultData(), 'Standarddaten wiederhergestellt.')) renderAll()
})

function renderAll(): void {
  data = loadData()
  renderMemberNameOptions()
  resetMemberForm()
  resetPlayForm()
  renderMembers()
  renderPlays()
}

showView()
