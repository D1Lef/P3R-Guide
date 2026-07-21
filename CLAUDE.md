# P3R Tagesplaner — Projekt-Briefing

Gaming-Companion-App für Persona 3 Reload, gebaut als Single-Page React-App.

## Rolle

Gaming Companion für Persona 3 Reload. Antworten auf **Deutsch**.

## Konventionen (wichtig)

- **Spoilerarm.** Story-Events nur vage; Bosse nur mit Arkana-Namen. Vor dem Verraten
  von Handlung, Charakter-Schicksalen o. ä. **erst fragen**.
- **Variante 3** (ab Oktober): Spoiler-lastige Tage zusätzlich mit ⚠ kennzeichnen,
  Details nur in aufklappbaren Feldern.
- **Dialog-Antworten immer im Volltext**, nie als Positionsnummern („P1 -> …").
- **Genauigkeit vor Vollständigkeit.** Lücken ehrlich als ⚠ markieren statt raten.
- **Meine In-Game-Beobachtungen schlagen Guide-Daten.** Guides haben mehrfach
  danebengelegen (z. B. Chimera ist Chariot, nicht Moon).
- Guides chronologisch aufbauen. Hohe Autonomie: Plan reicht, Details selbst lösen.

## Quellen

game8.co (primär) · GameFAQs / samurai-gamers / thegamer / neoseeker / nightlygamingbinge
(Fallback) · Steam-Guide „Shadow Affinities" für Gatekeeper-Tabellen.

Hinweis: game8s November-Seite war zeitweise nicht abrufbar → November stammt von
GameFAQs (Volltext-Dialoge), gegengeprüft mit samurai-gamers.

---

## Stand der App

**Dateien:**
- `src/App.jsx` — React-Quellcode, **Bearbeitungs-Vorlage**
- `index.html` — gebaute Voll-Version, komplett offline lauffähig (React inline, kein CDN)

**Inhalt — fertig:**
- Kalender **April–Januar** (10 Monate, 281 Tageseinträge) inkl. Epilog-Eintrag (4.3.)
- Alle Full-Moon-Bosse mit ausklappbarer Kampf-Info (rot, ⚔)
- Monats-Tipps sind pro Monat die **erste** Seite (vor Tag 1), nicht mehr die letzte
- Tartarus-Tab (Dark-Hour-Grün): **Thebel · Arqa I/II · Yabbashah I/II · Tziah I/II ·
  Harabah I/II · Adamah** — Gatekeeper, häufige Gegner, Block-Tipps
- **Burger-Menü** oben rechts (lila, rundes ☰-Icon): Navigation zwischen Tagesplaner,
  Tartarus, Schatzrechner, Elizabeth-Requests
- **Schatz-Rechner**: eigene Seite, über Burger-Menü erreichbar — alle Valuables +
  eigene Items nachtragbar, editierbare Preise, Zielbetrag mit Fortschrittsbalken,
  Suche, Zurücksetzen
- **Elizabeth-Requests-Tracker**: eigene Seite über Burger-Menü, Checkliste aller 101
  Requests mit ausklappbaren Infos (Voraussetzung/Anforderung/Belohnung), zeitkritische
  Requests mit Deadline rot markiert (⚠ Frist), Suche, Haken werden gespeichert
- Runder Umschalt-Button oben links bleibt erhalten (grün 🌙 → Tartarus, blau 📅 → Kalender)
- „✓ Alle ToDos abhaken" pro Tag
- Auto-Sprung zum ersten offenen Tag beim Laden

**Offene Punkte / bekannte Lücken:**
- Harabah: thegamer nennt 9 Gatekeeper, 8 sind dokumentiert
- Adamah: Genocidal Mercenary (255F) — Affinitäten unbekannt
- Schatz-Rechner: viele Preise unbekannt (game8-Liste ist unvollständig)
- Juli 27.–31. und August 29.–31. dünner (game8-Seiten brachen ab)
- September 30. offen gelassen
- Elizabeth-Request #91 (Tonbo-kiri) und #101 (Endgegner-Quest): Anforderungen/Belohnung
  in der rpgsite.net-Quelle nicht dokumentiert, im Tracker mit ⚠ markiert statt geraten

---

## Technik

**Speicher:** localStorage, Keys `p3r-april-checklist-v1` (Fortschritt), `p3r-treasure-calc-v1`
(Rechner) und `p3r-elizabeth-tracker-v1` (Request-Tracker, Schema `{ done: { [id]: true } }`).
Hängt an Browser + URL.

**Build-Pipeline** (Skripte selbst nicht im Repo, bei Bedarf neu anlegen):

1. `build_standalone.py`: liest `src/App.jsx`, entfernt `import React`, setzt Prelude
   (`const {useState,...} = React` + localStorage-Shim `ST`), ersetzt
   `window.storage` → `ST`, `export default function App` → `function App`,
   hängt ReactDOM-Bootstrap an → `/tmp/app-core.jsx`
2. `npx esbuild@0.20.2 app-core.jsx --bundle --jsx=transform
   --jsx-factory=React.createElement --jsx-fragment=React.Fragment
   --format=iife --minify --outfile=/tmp/app.js`
3. `make_offline.py`: React + ReactDOM UMD aus `/tmp/offline/node_modules` +
   app.js inline in die HTML (dabei `</script>` escapen) → `index.html`
4. Boot-Test mit jsdom: HTML laden, localStorage-Shim **vor** der App injizieren,
   Render + Klicks prüfen

Deps: `npm install react@18.3.1 react-dom@18.3.1 jsdom@24 --no-save` in `/tmp/offline`

**Fallstricke:**
- Umlaute in Daten teils als `ue/ae/oe`, teils echt; em-dash „—" vs. „-" —
  bei `str_replace` exakt matchen
- Beim jsdom-Test muss der localStorage-Shim **vor** den App-Scripts stehen,
  sonst lädt der Seed nicht

---

## Spielstand (Stand: Mitte Mai, Level ~19)

Hermit Rang 6 am 17.5. verpasst (zu wenig Punkte).
Moon-Persona fehlt noch — Naga (Lv 22) ist die niedrigste, geht erst ab Level 22.
Vorhandene Personas u. a.: Orpheus, Jack Frost, Jack-o'-Lantern, Apsaras, Oberon,
Forneus, Omoikane, Silky, Pixie, Chimera, Ara Mitama, Archangel, Angel, Onmoraki,
Valkyrie, Inugami, Nigi Mitama.
