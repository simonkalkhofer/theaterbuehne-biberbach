import logo from './assets/logos/logo-theaterbuehne-biberbach.jpg'
import './App.css'

const navItems = [
  { href: '#spielplan', label: 'Spielplan' },
  { href: '#ensemble', label: 'Ensemble' },
  { href: '#kontakt', label: 'Kontakt' },
]

function App() {
  return (
    <>
      <header className="site-header">
        <a href="/" className="site-logo" aria-label="Theaterbühne Biberbach – Startseite">
          <img src={logo} alt="Theaterbühne Biberbach" width="800" height="305" />
        </a>
        <nav aria-label="Hauptnavigation">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Bühne frei!</h1>
          <p>Hier entsteht die neue Webseite der Theaterbühne Biberbach.</p>
        </section>
      </main>
    </>
  )
}

export default App
