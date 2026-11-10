/**
 * Demo-Inhalte für das Archiv: Fülltexte, Rollen und Platzhalter-Fotos.
 * Texte sind frei erfunden (passend zum Titel), Rollenbesetzung ist eine
 * Beispiel-Zuordnung – beides im Admin durch echte Angaben ersetzen.
 * Fotos: public/demo/ (Unsplash-Lizenz, siehe public/demo/QUELLEN.md).
 */
import type { Credit } from './store'

export interface DemoPlay {
  year: number
  title: string
  description: string
  credits: Credit[]
}

const cast = (role: string, name: string): Credit => ({ role, name, group: 'cast' })
const crew = (role: string, name: string): Credit => ({ role, name, group: 'crew' })

export const DEMO_PLAYS: DemoPlay[] = [
  {
    year: 2015,
    title: 'Alptraum einer Schwiegermutter',
    description: `Kaum ist das junge Glück der Hubers frisch eingerichtet, steht sie vor der Tür: Hermine, die Schwiegermutter – mit drei Koffern, einem Kanarienvogel und der festen Absicht, „nur ein paar Tage“ zu bleiben.

Aus den paar Tagen werden Wochen, aus guten Ratschlägen ein strenges Regiment. Als Franz und Lisa zu immer verzweifelteren Mitteln greifen, um die resolute Dame wieder loszuwerden, gerät das halbe Dorf in einen Strudel aus Missverständnissen, falschen Verehrern und einem sehr gesprächigen Vogel.`,
    credits: [
      crew('Regie', 'Sonja Soxberger'),
      crew('Souffleuse', 'Helga Peschek'),
      crew('Bühnenbild', 'Anton Kammerhofer'),
      crew('Maske', 'Michaela Kammerhofer'),
      cast('Hermine Huber, die Schwiegermutter', 'Gertrude Aigner'),
      cast('Franz Huber', 'Markus Edermayr'),
      cast('Lisa Huber', 'Viktoria Kalkhofer'),
      cast('Sepp, der Nachbar', 'Ernst Fehringer'),
      cast('Pfarrer Gottlieb', 'Josef Leutgeb'),
    ],
  },
  {
    year: 2016,
    title: 'Alibi Bauernhof',
    description: `Am Moserhof ist über Nacht die preisgekrönte Zuchtsau Berta verschwunden – ausgerechnet eine Woche vor der Landwirtschaftsmesse. Inspektor Gruber aus der Stadt soll den Fall lösen, hat aber noch nie einen Stall von innen gesehen.

Jeder am Hof hat ein Alibi, und jedes Alibi ist wackeliger als das vorige. Zwischen Heuboden, Melkschemel und einer Wiener Urlauberin, die „echtes Landleben“ sucht, entwickelt sich eine Kriminalkomödie, in der am Ende niemand ganz unschuldig ist.`,
    credits: [
      crew('Regie', 'Thomas Teufel'),
      crew('Souffleuse', 'Helga Peschek'),
      crew('Licht & Ton', 'Simon Peschek'),
      crew('Bühnenbild', 'Franz Schörghuber'),
      cast('Leopold Moser, Bauer', 'Robert Kößl'),
      cast('Rosa Moser, Bäuerin', 'Hilda Ördög'),
      cast('Inspektor Gruber', 'Thomas Bühringer'),
      cast('Hias, der Knecht', 'Fabian Soxberger'),
      cast('Frau von Hohenberg, Urlauberin', 'Manuela Raaber'),
    ],
  },
  {
    year: 2017,
    title: 'Männerwirtschaft',
    description: `Seit die Haushälterin Resi in Kur ist, regiert bei den Brüdern Ferdl, Gustl und Poldi das Chaos: Socken im Kühlschrank, Gulasch an der Decke und ein Hausschwein, das sich im Wohnzimmer erstaunlich wohlfühlt.

Als sich überraschend die Bürgermeisterin zum Besuch ansagt, muss in einem Tag alles blitzblank sein. Ein Rennen gegen die Zeit beginnt – mit Nachbarschaftshilfe, geborgten Möbeln und Lügen, die immer größer werden.`,
    credits: [
      crew('Regie', 'Sonja Soxberger'),
      crew('Souffleuse', 'Petra Jesch'),
      crew('Bühnenbild', 'Anton Ördög'),
      crew('Requisite', 'Barbara Gassner'),
      cast('Ferdl', 'Günther Reisigner'),
      cast('Gustl', 'Rudolf Jesch'),
      cast('Poldi', 'Markus Edermayr'),
      cast('Resi, die Haushälterin', 'Gertrude Aigner'),
      cast('Frau Bürgermeisterin', 'Silvia Kalkhofer'),
    ],
  },
  {
    year: 2018,
    title: 'Gedächtnislücke',
    description: `Otto wacht nach dem Feuerwehrfest im falschen Bett auf – und kann sich an absolut nichts erinnern. Weder daran, wie er hierherkam, noch an die Wette, die er offenbar am Vorabend abgeschlossen hat.

Während seine Frau Margit misstrauisch wird und Freund Karl alles nur noch schlimmer macht, versucht Otto Stück für Stück die verlorene Nacht zu rekonstruieren. Jede neue Erinnerung wirft mehr Fragen auf als sie beantwortet.`,
    credits: [
      crew('Regie', 'Thomas Teufel'),
      crew('Souffleuse', 'Helga Peschek'),
      crew('Maske', 'Michaela Kammerhofer'),
      crew('Licht & Ton', 'Simon Peschek'),
      cast('Otto Brandstetter', 'Ernst Fehringer'),
      cast('Margit Brandstetter', 'Hilda Ördög'),
      cast('Karl, sein Freund', 'Josef Leutgeb'),
      cast('Mitzi, die Kellnerin', 'Viktoria Kalkhofer'),
      cast('Inspektor Wimmer', 'Anton Kammerhofer'),
    ],
  },
  {
    year: 2019,
    title: 'Opa rockt das Altersheim',
    description: `Im Seniorenheim „Abendsonne“ herrscht Ordnung: Frühstück um sieben, Mittagsruhe um eins, Bingo am Donnerstag. Bis Opa Willi einzieht – mit E-Gitarre, Lederjacke und einem Verstärker, der eindeutig zu laut ist.

Heimleiterin Strobl ist entsetzt, die Bewohner sind begeistert. Als das Heim geschlossen werden soll, gründet Willi kurzerhand eine Band und plant das Benefizkonzert des Jahrhunderts.`,
    credits: [
      crew('Regie', 'Sonja Soxberger'),
      crew('Souffleuse', 'Petra Jesch'),
      crew('Musik', 'Fabian Soxberger'),
      crew('Kostüme', 'Barbara Gassner'),
      cast('Opa Willi', 'Rudolf Jesch'),
      cast('Heimleiterin Strobl', 'Manuela Raaber'),
      cast('Oma Frieda', 'Gertrude Aigner'),
      cast('Max, der Pfleger', 'Thomas Bühringer'),
      cast('Jasmin, die Enkelin', 'Viktoria Kalkhofer'),
    ],
  },
  {
    year: 2023,
    title: 'Natur Pur',
    description: `Hotelier Hannes will aus seinem in die Jahre gekommenen Gasthof ein Wellness-Resort „im Einklang mit der Natur“ machen. Dumm nur, dass die Natur dabei nicht ganz mitspielt.

Zwischen Yoga am Misthaufen, Kräuterkursen beim Kräuterweiberl Vroni und einem anspruchsvollen Gast aus der Stadt wird schnell klar: Zurück zur Natur ist leichter gesagt als getan – vor allem, wenn sich der Bürgermeister zur Eröffnung angekündigt hat.`,
    credits: [
      crew('Regie', 'Thomas Teufel'),
      crew('Souffleuse', 'Helga Peschek'),
      crew('Bühnenbild', 'Franz Schörghuber'),
      crew('Licht & Ton', 'Simon Peschek'),
      cast('Hannes, der Hotelier', 'Markus Edermayr'),
      cast('Luna, Yogalehrerin', 'Michaela Kammerhofer'),
      cast('Dr. Berger, Kurgast', 'Robert Kößl'),
      cast('Vroni, das Kräuterweiberl', 'Hilda Ördög'),
      cast('Herr Bürgermeister', 'Günther Reisigner'),
    ],
  },
  {
    year: 2025,
    title: 'Letzte Rettung - Erste Hilfe',
    description: `Für den Führerschein, die Feuerwehr oder einfach aus schlechtem Gewissen: Sieben grundverschiedene Menschen landen im selben Erste-Hilfe-Kurs. Kursleiter Huber, Sanitäter mit Leib und Seele, ahnt noch nicht, was auf ihn zukommt.

Die Übungspuppe verliert den Kopf, der Verbandskasten ist leer und ausgerechnet der Kursleiter braucht plötzlich selbst Hilfe. Eine turbulente Komödie über Mut, Missgeschicke und die Frage, wer hier eigentlich wen rettet.`,
    credits: [
      crew('Regie', 'Sonja Soxberger'),
      crew('Souffleuse', 'Petra Jesch'),
      crew('Maske', 'Michaela Kammerhofer'),
      crew('Requisite', 'Anton Ördög'),
      cast('Kursleiter Huber', 'Thomas Bühringer'),
      cast('Frau Dr. Lechner', 'Silvia Kalkhofer'),
      cast('Kevin, Führerscheinneuling', 'Fabian Soxberger'),
      cast('Theresia Mayr', 'Gertrude Aigner'),
      cast('Feuerwehrkommandant Pichler', 'Ernst Fehringer'),
    ],
  },
]

/** Pfade der Demo-Fotos (in public/demo/) für ein Jahr. */
export const demoPhotos = (year: number): string[] => [1, 2, 3].map((n) => `demo/stueck-${year}-${n}.jpg`)
