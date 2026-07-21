# P3R Tagesplaner

Ein Gaming-Companion für **Persona 3 Reload** — Kalender, Tartarus-Guide, Schatz-Rechner
und Elizabeth-Request-Tracker in einer einzigen, offline lauffähigen Seite.

## Nutzung

`index.html` einfach im Browser öffnen — keine Installation, kein Server, keine
Internetverbindung nötig (React ist inline eingebettet). Fortschritt wird lokal im
Browser gespeichert (`localStorage`), bleibt also an Browser + Gerät gebunden.

## Features

- **Tagesplaner**: Kalender April–Januar (10 Monate, 281 Tageseinträge) inkl. Epilog,
  mit Monats-Tipps, Dialog-Optionen im Volltext und „✓ Alle ToDos abhaken" pro Tag.
  Springt beim Laden automatisch zum ersten offenen Tag.
- **Full-Moon-Bosse**: ausklappbare Kampf-Infos direkt im jeweiligen Tageseintrag.
- **Tartarus-Tab**: Gatekeeper, häufige Gegner und Block-Tipps für alle Blöcke von
  Thebel bis Adamah.
- **Schatz-Rechner**: alle Valuables plus eigene Items, editierbare Preise, Zielbetrag
  mit Fortschrittsbalken, Suche.
- **Elizabeth-Requests-Tracker**: Checkliste aller 101 Requests mit Voraussetzung,
  Anforderung und Belohnung, zeitkritische Requests farblich markiert, Suche.
- Navigation über Burger-Menü oben rechts sowie einen runden Umschalt-Button
  (Tagesplaner ↔ Tartarus).

## Bekannte Lücken

Die Daten stammen aus mehreren Guides (siehe [`CLAUDE.md`](CLAUDE.md)) und sind an
einigen Stellen unvollständig — betroffene Stellen sind im Guide selbst mit ⚠
gekennzeichnet, z. B. einzelne Gatekeeper-Affinitäten, ein paar Preise im
Schatz-Rechner und zwei Elizabeth-Requests ohne dokumentierte Anforderungen.

## Struktur

| Pfad          | Inhalt                                                          |
|---------------|------------------------------------------------------------------|
| `index.html`  | fertig gebaute, offline lauffähige App (React inline, kein CDN) |
| `src/App.jsx` | React-Quellcode — Bearbeitungs-Vorlage für Änderungen           |
| `CLAUDE.md`   | Projektkontext, Konventionen und Build-Pipeline für Claude Code |

Änderungen werden in `src/App.jsx` gemacht und dann neu zu `index.html` gebaut —
die Build-Pipeline dafür ist in `CLAUDE.md` dokumentiert.

## Spoiler-Hinweis

Der Guide ist bewusst spoilerarm gehalten: Story-Events werden nur vage angedeutet,
Bosse nur mit ihrem Arkana-Namen genannt.
