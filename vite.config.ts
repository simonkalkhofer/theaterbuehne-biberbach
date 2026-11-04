import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-Page-Website: jede HTML-Datei im Projektordner ist eine eigene Seite.
const page = (name: string) => resolve(import.meta.dirname, name)

export default defineConfig({
  // relative Pfade: die fertige Seite funktioniert in jedem (Unter-)Ordner eines Webservers
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: page('index.html'),
        mitglieder: page('mitglieder.html'),
        archiv: page('archiv.html'),
        admin: page('admin.html'),
      },
    },
  },
})
