import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-Page-Website: jede HTML-Datei im Projektordner ist eine eigene Seite.
const page = (name: string) => resolve(import.meta.dirname, name)

export default defineConfig({
  // relative Pfade: die fertige Seite funktioniert in jedem (Unter-)Ordner eines Webservers
  base: './',
  // lokal: API-Aufrufe an den Node-Server weiterleiten (npm run dev:server)
  server: {
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: false, xfwd: true } },
  },
  build: {
    rollupOptions: {
      input: {
        index: page('index.html'),
        mitglieder: page('mitglieder.html'),
        archiv: page('archiv.html'),
        stueck: page('stueck.html'),
        admin: page('admin.html'),
      },
    },
  },
})
