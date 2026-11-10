import '../common'
import { initReveal } from '../common'
import { imageSrc } from '../data/api'
import { byLastName, initData, loadData, onDataChange, type Member } from '../data/store'
import { el, initials, isEmail, qs } from '../lib/dom'

/** Platzhalter-Namen aus den Standarddaten bekommen eine Silhouette statt Initialen. */
const PLACEHOLDER_NAME = /^(name folgt|mitglied \d+)$/i

function photo(m: Member): HTMLElement {
  return el(
    'div',
    { class: 'person__photo' },
    m.photo
      ? el('img', { src: imageSrc(m.photo), alt: `Foto von ${m.name}`, loading: 'lazy' })
      : PLACEHOLDER_NAME.test(m.name)
        ? el('div', { class: 'person__placeholder person__placeholder--anon', 'aria-hidden': 'true' })
        : el('div', { class: 'person__placeholder', 'aria-hidden': 'true', text: initials(m.name) }),
  )
}

function boardCard(m: Member): HTMLLIElement {
  const contact = m.email
    ? el(
        'p',
        { class: 'person__contact' },
        isEmail(m.email) ? el('a', { href: `mailto:${m.email}`, text: m.email }) : m.email,
      )
    : null

  return el(
    'li',
    { class: 'person', 'data-reveal': '' },
    photo(m),
    el('h3', { class: 'person__name', text: m.name }),
    m.role ? el('p', { class: 'person__role', text: m.role }) : null,
    contact,
  )
}

function memberCard(m: Member): HTMLLIElement {
  return el('li', { class: 'person', 'data-reveal': '' }, photo(m), el('h3', { class: 'person__name', text: m.name }))
}

function fill(list: HTMLElement, items: HTMLLIElement[], emptyText: string): void {
  list.replaceChildren(...(items.length ? items : [el('li', { class: 'empty', text: emptyText })]))
}

function render(): void {
  const { members } = loadData()
  const board = members.filter((m) => m.board)
  const others = members.filter((m) => !m.board).sort(byLastName)

  fill(qs('[data-board-list]'), board.map(boardCard), 'Der Vorstand wird bald vorgestellt.')
  fill(qs('[data-member-list]'), others.map(memberCard), 'Hier werden bald unsere Mitglieder vorgestellt.')
  initReveal(qs('#inhalt'))
}

await initData()
render()
onDataChange(render)
