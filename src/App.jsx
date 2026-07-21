import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ───────────────────────────────────────────────────────────────────────────
// Persona 3 Reload — Tagesplaner / Checklist (April + Mai, Blätter-Ansicht)
// Daten: game8.co April + May Walkthrough
// ───────────────────────────────────────────────────────────────────────────

const STAT = {
  charm: { label: "Charm", color: "#ff5fa2", glow: "rgba(255,95,162,.25)" },
  academics: { label: "Academics", color: "#3fa9ff", glow: "rgba(63,169,255,.25)" },
  courage: { label: "Courage", color: "#ffb13f", glow: "rgba(255,177,63,.25)" },
};

const KIND = {
  quiz: { tag: "Quiz", color: "#ffd34d" },
  cutscene: { tag: "Cutscene", color: "#8a93b2" },
  social: { tag: "Social Link", color: "#7df9a8" },
  tartarus: { tag: "Tartarus", color: "#b98cff" },
  shop: { tag: "Shop", color: "#5fd0ff" },
  prereq: { tag: "Voraussetzung", color: "#ff8f6b" },
  stat: { tag: "Stat", color: "#ff5fa2" },
  class: { tag: "Schule", color: "#6ea8ff" },
  boss: { tag: "Story-Boss", color: "#ff5f6b" },
  exam: { tag: "Pruefung", color: "#ffd34d" },
  link: { tag: "Link Episode", color: "#7df9a8" },
};

const DAYS = [
  { date: "8", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Recitation", answer: "Antwort: Vivid Carp Streamers", stat: "charm" }]},
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: Iwatodai Dorm" }]},
    { slot: "Abend", items: [{ kind: "cutscene", label: "Cutscene: Velvet Room" }]},
  ]},
  { date: "9", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: Paulownia Mall mit Junpei" }]},
    { slot: "Abend", items: [{ kind: "cutscene", label: "Cutscene: Magician & Combat-Tutorial" }]},
  ]},
  { date: "17", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: Time Skip" }]},
    { slot: "Abend", items: [{ kind: "cutscene", label: "Cutscene: Time Skip" }]},
  ]},
  { date: "18", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Recitation", answer: "Antwort: Middens", stat: "charm" }]},
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: Time Skip" }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Fool Rang 1" }]},
  ]},
  { date: "19", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: Time Skip" }]},
    { slot: "Abend", items: [{ kind: "cutscene", label: "Cutscene: Junpei zieht ins Iwatodai Dorm" }]},
  ]},
  { date: "20", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: School Activities" }]},
    { slot: "Abend", items: [
      { kind: "tartarus", label: "Tartarus: Erkundungs- & Combat-Tutorial" },
      { kind: "social", label: "Social Link: Fool Rang 2" },
    ]},
  ]},
  { date: "21", slots: [
    { slot: "Tag", items: [
      { kind: "cutscene", label: "Magician (Kenji) & Morning Assembly" },
      { kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" },
    ]},
    { slot: "Nach der Schule", items: [
      { kind: "stat", label: "School Clinic: Mysterious Concoction trinken", stat: "courage" },
      { kind: "shop", label: "2x Mad Bull (Iwatodai Station) + Kishido Blade fuer Junpei kaufen" },
      { kind: "cutscene", label: "Cutscene: Police Station Intro" },
      { kind: "stat", label: "Game Parade: House of the Deceased spielen", stat: "courage" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: House of the Deceased spielen", stat: "courage" }]},
  ]},
  { date: "22", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Magician Rang 1" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "2x Mad Bull (Iwatodai Dorm, 2. Etage) kaufen" },
      { kind: "tartarus", label: "Tartarus bis Etage 22", answer:
        "Ziele: Odd Morsel holen - 50.000+ Yen (inkl. Materialien & Extra-Verbrauchsgegenstaenden) - Personas mit Magician, Chariot, Emperor & Hierophant dabeihaben" },
    ]},
  ]},
  { date: "23", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "stat", label: "School Clinic: Mysterious Concoction trinken", stat: "courage" },
      { kind: "shop", label: "Alle Tartarus-Materialien fuer Geld verkaufen" },
      { kind: "social", label: "Social Link: Chariot Rang 1", answer:
        "P1 \"Should I say hello?\" -> I think I will.\nP2 \"What's up...?\" -> Wanna walk home together?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: Highschool of Youth spielen", stat: "charm" }]},
  ]},
  { date: "24", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "social", label: "Social Link: Magician Rang 2", answer:
        "P1 (Takeba-Zimmer) -> No / That's a secret\nP2 (aeltere Frauen) -> I'm into older women, too / I like them all!" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: House of the Deceased spielen", stat: "courage" }]},
  ]},
  { date: "25", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Voraussetzung fuer Hierophant", answer:
        "1) Bookworms (Iwatodai Station Strip Mall): mit dem aelteren Ehepaar reden\n2) Persimmon Leaf vom jungen Baum im Gang zur Turnhalle holen\n3) zurueck zum Ehepaar" },
      { kind: "social", label: "Social Link: Hierophant Rang 1" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer spielen", stat: "academics" }]},
  ]},
  { date: "26", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Kenjis Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Vorher: SP-Items aus Automaten kaufen" },
      { kind: "social", label: "Social Link: Hierophant Rang 2", answer:
        "P1 (Name) -> eigenen Namen sagen\nP2 -> Thank you!\nP3 -> I'd like that. (Melon Bread x2)" },
    ]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Mystery Burger essen", stat: "courage" },
      { kind: "stat", label: "* Courage steigt auf \"Ordinary\"" },
    ]},
  ]},
  { date: "27", slots: [
    { slot: "Morgen", items: [
      { kind: "cutscene", label: "Morning Assembly" },
      { kind: "quiz", label: "Morning Recitation", answer: "Antwort: A.", stat: "charm" },
    ]},
    { slot: "Tag", items: [
      { kind: "prereq", label: "Vorher: im Faculty Office dem Student Council beitreten" },
      { kind: "social", label: "Social Link: Emperor Rang 1" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: Highschool of Youth spielen", stat: "charm" }]},
  ]},
  { date: "28", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Voraussetzung fuer Chariot/Strength", answer:
        "1) Chihiro im Classroom Hallway ansprechen -> \"I just wanted to talk...\"\n2) Yuko Hallo sagen & nach Chariot 1-2 zusammen heimgehen" },
      { kind: "social", label: "Social Link: Chariot Rang 2 + Strength Rang 1", answer:
        "P1 \"My side is killing me...\" -> Toughen up!" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: House of the Deceased spielen", stat: "courage" }]},
  ]},
  { date: "29", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Hermit Rang 1" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "NetCafe (3. Etage Iwatodai Strip Mall): alle Software kaufen + Info vom Suspicious Man (Club Escapade)" },
      { kind: "stat", label: "Game Parade: You're the Answer spielen", stat: "academics" },
    ]},
  ]},
  { date: "30", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Voraussetzung: Chihiro ein zweites Mal ansprechen (egal was)" },
      { kind: "social", label: "Social Link: Magician Rang 3", answer:
        "P1 \"I'm so sick of this\" -> What, of life?\nP2 -> Good luck!" },
    ]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Game Parade: Highschool of Youth spielen", stat: "charm" },
      { kind: "stat", label: "* Charm steigt auf \"Unpolished\"" },
    ]},
  ]},
];

const TIPS = [
  "Tartarus moeglichst in einem Rutsch klaeren - das spart Abend-Aktionspunkte fuer Social Links & Stats.",
  "Woechentlich SP-Items (Mad Bull, Fountain Due) bunkern, damit du Etage 22 ohne Tagewiederholung schaffst.",
  "Knapp bei Kasse fuer die Arcade-Spiele? Ueberschuessige Tartarus-Verbrauchsgegenstaende verkaufen - oder den Dorm-PC als Arcade-Ersatz nutzen.",
  "Fuer Social-Link-Boni eine Persona der passenden Arkana mitfuehren (im hinteren Teil der Paulownia Mall fusionieren spart den Tartarus-Abend).",
];

// Grobe Ausgaben pro Tag (Yen). Quelle: game8 + game8-Itempreise.
// Arcade-Spiel = 3.000 - Kishido Blade = 3.000 - Mad Bull ~110/Stk.
const BUDGET = {
  "21": { total: "~9.200", approx: true, items: [
    ["Kishido Blade (Junpei)", "3.000"],
    ["House of the Deceased x2", "6.000"],
    ["Mad Bull x2", "~220"],
  ], tip: "Teuerster Tag im April. Wenn's knapp wird: nur 1x Arcade spielen (Courage statt vollem Bonus) und den Rest ueber Clinic + Mystery Burger ausgleichen." },
  "22": { total: "~220", items: [["Mad Bull x2", "~220"]],
    income: "Tartarus heute = Einnahmen. Ziel: mit 50.000+ Yen rausgehen." },
  "23": { total: "3.000", items: [["Highschool of Youth", "3.000"]],
    income: "Tartarus-Materialien an der Polizeistation verkaufen bringt heute Geld rein." },
  "24": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "25": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "26": { total: "~1.000", approx: true, items: [
    ["SP-Items (Automaten)", "einige 100"],
    ["Mystery Burger", "klein"],
  ] },
  "27": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
  "28": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "29": { total: "~4.000", approx: true, items: [
    ["You're the Answer", "3.000"],
    ["NetCafe-Software + Info (Suspicious Man)", "~1.000"],
  ] },
  "30": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
};

// ───────────────────────────── MAI ─────────────────────────────
// Daten: game8.co May Walkthrough. Story-Boss am 9. bewusst vage gehalten.
const MAY_DAYS = [
  { date: "1", slots: [
    { slot: "Nach der Schule", items: [{ kind: "cutscene", label: "Cutscene (Story): Krankenhausbesuch" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" }]},
  ]},
  { date: "2", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Voraussetzung fuer Strength", answer:
        "1) Chihiro ansprechen -> \"Let's hang out\" (schaltet ihren Social Link frei)\n2) Velvet Room: Omoikane + Forneus -> Valkyrie fusionieren, beide danach nachsummonen" },
      { kind: "social", label: "Social Link: Strength Rang 2", answer:
        "P1 -> What happened?\nP2 -> It wasn't your fault.\nP3 -> That's true" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "3", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka's TV-Shopping: Rose Bouquet Set NICHT kaufen" },
      { kind: "prereq", label: "Voraussetzung fuer Hermit", answer:
        "Beliebige Lovers-Arkana-Persona auf Valkyrie fusionieren -> Onmoraki (Hermit); Valkyrie danach nachsummonen" },
      { kind: "social", label: "Social Link: Hermit Rang 2", answer:
        "P1 -> Of course.\nP2 -> Sunshine is overrated." },
    ]},
    { slot: "Abend", items: [
      { kind: "shop", label: "SP-Items aus Automaten kaufen (optional)" },
      { kind: "stat", label: "Dorm-PC: Digital Cram School", stat: "academics" },
      { kind: "stat", label: "* Academics steigt auf \"Average\"" },
    ]},
  ]},
  { date: "4", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Miyamotos Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Hermit Rang 3", answer:
      "P1 -> Oh really?!\nP2 -> You don't like your job?" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Language Made Easy", stat: "academics" }]},
  ]},
  { date: "5", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Kenjis Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Hermit Rang 4", answer:
      "P1 -> Let's plan our wedding, then." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: TypinGhoul", stat: "courage" }]},
  ]},
  { date: "6", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Recitation", answer: "Antwort: A pantograph", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Voraussetzung fuer Strength", answer:
        "Weird Takoyaki kaufen und zusammen mit einem Mad Bull an Maiko am Naganaki-Schrein geben" },
      { kind: "social", label: "Social Link: Strength Rang 3", answer:
        "P1 -> Don't worry about it.\nP2 -> I'm honored." },
    ]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Dorm-PC: Animal Othello", stat: "courage" },
      { kind: "stat", label: "* Courage steigt auf \"Determined\"" },
    ]},
  ]},
  { date: "7", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 1" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Lessons in Etiquette", stat: "charm" }]},
  ]},
  { date: "8", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hierophant Rang 3 (schaltet Temperance frei)", answer:
      "P1 -> Looking for something?\nP2 -> Can I help?" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Virtual Diet", stat: "charm" }]},
  ]},
  { date: "9", slots: [
    { slot: "Ganzer Tag", items: [
      { kind: "boss", label: "Story: Full Moon Operation - Boss-Kampf (Priestess-Arkana)", answer:
        "Schwaeche: keine - kann nicht gedownt werden.\nSpiegelt: Ice (Bufu wird reflektiert - NIE Eis benutzen!).\nResistiert: Magie. Immun: Light, Dark, Status, Insta-Death.\nEmpf. Level ~10. Party: MC, Junpei, Yukari.\n\nStrategie: Mit staerksten Phys-Angriffen + Agi/Zio chippen, Yukari heilt mit Dia. MC debufft per Tarunda (-ATK) / Rakunda (-DEF). Eis-resistente Persona (Apsaras/Valkyrie/Jack Frost) als Schutz - aber Jack Frosts Bufu NICHT nutzen.\nSummons (Tiaras): Despairing -> Agi, Skeptical -> Zio, Loathsome -> Garu." },
      { kind: "social", label: "Social Link: Fool Rang 3" },
    ]},
  ]},
  { date: "10", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "SP-Items aus Automaten kaufen" },
      { kind: "shop", label: "Tanaka: Antibiotic Gel Set NICHT kaufen" },
      { kind: "social", label: "Social Link: Hermit Rang 5", answer:
        "P1 -> Do you mean S.O.B.?\nP2 -> Are you a teacher?" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Vor Tartarus erledigen", answer:
        "1) 12. Request annehmen -> mit Yukari reden (Pine Resin)\n2) 13. Request annehmen -> mit Junpei reden (Handheld Game Console)\n3) 8. Request annehmen -> Rarity Fortune vom Wahrsager im Club Escapade holen, dann Tartarus" },
      { kind: "tartarus", label: "Tartarus (Arqa-Block)", answer:
        "In Tartarus: verschlossene Truhen auf Etage 17 & 36 oeffnen (Ausruestungs-Upgrades).\nZiele: Level 20 - Etage 43 - 90.000+ Yen - passende Social-Link-Personas dabei" },
    ]},
  ]},
  { date: "11", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [
      { kind: "stat", label: "School Clinic: Mysterious Concoction trinken", stat: "courage" },
      { kind: "shop", label: "Alle Tartarus-Materialien verkaufen (~90.000 Yen+)" },
      { kind: "social", label: "Social Link: Hanged Man Rang 1" },
    ]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: Video-Aufzeichnung ansehen" },
      { kind: "stat", label: "Wakatsu (2. Etage Strip Mall): Prodigy Platter -> Seafood Course freischalten", stat: "academics" },
    ]},
  ]},
  { date: "12", slots: [
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Junpei 1" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Im Zimmer lernen", stat: "academics" }]},
  ]},
  { date: "13", slots: [
    { slot: "Tag", items: [
      { kind: "quiz", label: "Afternoon Recitation", answer: "Antwort: The Pendulum", stat: "charm" },
      { kind: "stat", label: "* Charm steigt auf \"Confident\"" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hanged Man Rang 2", answer:
      "P1 -> Sure, let's go." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Prodigy Platter essen", stat: "academics" }]},
  ]},
  { date: "14", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hierophant Rang 4", answer:
      "P1 -> I should go too.\nP2 -> I'm worried." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "15", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Afternoon Class", answer: "Antwort: May Blues", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hierophant Rang 5", answer:
      "P1 -> I wouldn't worry about it.\nP2 -> beliebige Antwort" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Gruppenlernen mit Mitsuru & Akihiko", stat: "academics" }]},
  ]},
  { date: "16", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hanged Man Rang 3", answer:
      "P1 -> Don't worry, he'll be there." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Gruppenlernen mit Yukari & Junpei", stat: "academics" }]},
  ]},
  { date: "17", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Blinding Flashlight Set (optional)" },
      { kind: "social", label: "Social Link: Hermit Rang 6" },
    ]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Gruppenlernen mit dem Team", stat: "academics" },
      { kind: "stat", label: "* Academics steigt auf \"Above Average\"" },
    ]},
  ]},
  { date: "18", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefungen: alle Fragen kommen dir bekannt vor" }]},
  ]},
  { date: "19", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: May Blues" }]},
  ]},
  { date: "20", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: A pendulum" }]},
  ]},
  { date: "21", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Electricity" }]},
  ]},
  { date: "22", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Jomon" }]},
  ]},
  { date: "23", slots: [
    { slot: "Morgen", items: [{ kind: "exam", label: "Pruefungen: letzter Tag" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 2", answer:
      "P1 -> Don't worry about it.\nP2 -> I read the classics / I read manga.\nP3 -> I'm having fun." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "24", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Kenjis oder Kazushis Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: All-Purpose Apron Set (optional)" },
      { kind: "social", label: "Social Link: Hermit Rang 7", answer: "P1 -> What bastard?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wilduck Burger: Mystery Burger essen", stat: "courage" }]},
  ]},
  { date: "25", slots: [
    { slot: "Tag", items: [
      { kind: "stat", label: "Pruefungsergebnisse: Bester im Jahrgang", stat: "charm" },
      { kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" },
    ]},
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Pruefungsbelohnung: mit Mitsuru reden -> Stat Incenses & Proto-choker" },
      { kind: "social", label: "Social Link: Emperor Rang 2", answer: "P1 -> Sounds like nonsense." },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Healthy Tomato Sprout pflanzen" },
      { kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" },
    ]},
  ]},
  { date: "26", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 1" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" }]},
  ]},
  { date: "27", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Emperor Rang 3", answer: "P1 -> beliebige Antwort" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Hagakure Ramen: Pork Ramen essen -> Special Ramen freischalten", stat: "charm" }]},
  ]},
  { date: "28", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Chariot Rang 3", answer:
      "P1 -> Are you going to be okay?\nP2 -> Will it heal?" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "29", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Magician Rang 4", answer: "P1 -> Good luck!" }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Akihiko 1 (Iwatodai Station)" }]},
  ]},
  { date: "30", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Voraussetzung fuer Moon", answer:
        "1) Chubby Student in Paulownia Mall ansprechen\n2) Odd Morsel im Inventar haben" },
      { kind: "quiz", label: "Gourmet Quiz", answer: "1) Pheromone Coffee\n2) Red\n3) Hagakure Bowl" },
      { kind: "social", label: "Social Link: Moon Rang 1" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "31", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Einladungen von Yuko & Chihiro NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Health Sandals Set (optional)" },
      { kind: "social", label: "Social Link: Moon Rang 2", answer: "P1 -> Sure, why not." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
];

const MAY_BUDGET = {
  "1": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "2": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "10": { total: "Ziel: 90.000+", approx: true, items: [["SP-Items (Automaten)", "einige 100"]],
    income: "Grosser Tartarus-Lauf. Verkaufswert-Ziel 90.000+ Yen - Auszahlung am 11." },
  "11": { total: "0", items: [["—", "—"]],
    income: "Einnahmetag: alle Tartarus-Materialien verkaufen (~90.000 Yen+)." },
  "23": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "26": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "30": { total: "3.000", items: [["You're the Answer", "3.000"]] },
};

const MAY_TIPS = [
  "Spirit Drain besorgen: haelt deinen SP-Vorrat oben - du kannst Schwaechen & All-Out Attacks spammen und stark physisch angreifen.",
  "Elizabeths Requests frueh erledigen: bringen Geld UND Ausruestungs-Upgrades, die den wichtigen Tartarus-Lauf erleichtern.",
  "Level 20 erreichen: schaltet mehr Persona-Slots frei und bringt Geld - erspart spaeter Mikromanagement bei Finanzen & Personas.",
  "Persona mit Kouha (Light) mitfuehren: die meisten Arqa-Shadows und der Wealth Hand sind schwach gegen Light.",
  "Nicht jede verschlossene Truhe oeffnen - frueh geben sie oft unnoetiges Zeug. Vor dem Ausgeben von Fragmenten speichern. Fuer Jozomaru auf Etage 36 genau 3 Twilight Fragments bereithalten.",
  "SP-Items fuer Yukari aufheben: mit Spirit Drain hast du SP uebrig - so deckt ihre Wind-Persona den ganzen Arqa-Block ab (Heat Balance, Soul Dancers sind schwach gegen Wind).",
  "Geld im Blick behalten: Wakatsu-Menues und Arcade-Spiele sind die Haupt-Geldfresser im Mai. Der grosse Verkauf am 11. (~90.000 Yen) macht dich wieder fluessig.",
];

// ───────────────────────────── JUNI ─────────────────────────────
// Daten: game8.co June Walkthrough. Full-Moon-Boss am 8. bewusst vage.
const JUNE_DAYS = [
  { date: "1", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Emperor Rang 4", answer: "P1 -> Looks like you're hard at work." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: Highschool of Youth", stat: "charm" }]},
  ]},
  { date: "2", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 2", answer: "P1 -> Sure, let's go.\nP2 -> I totally agree." }]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" },
      { kind: "stat", label: "* Courage steigt auf \"Tough\"" },
    ]},
  ]},
  { date: "3", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 3", answer: "P1 -> beliebige Antwort\nP2 -> How about a kimono?" }]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Hagakure: Special Hagakure Bowl essen", stat: "charm" },
      { kind: "stat", label: "* Charm steigt auf \"Smooth\"" },
    ]},
  ]},
  { date: "4", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 3", answer: "P1 -> They have no shame.\nP2 -> I agree." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Tomaten ernten" },
      { kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" },
    ]},
  ]},
  { date: "5", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Gardening: Buff Potato Sprout am Port Island Station kaufen" },
      { kind: "social", label: "Social Link: Magician Rang 5", answer: "P1 -> Okay..." },
    ]},
    { slot: "Abend", items: [
      { kind: "quiz", label: "Ghost Story (Belohnung: Cielo Mist)", answer: "1) There were three victims.\n2) They hung out together" },
      { kind: "prereq", label: "Gardening: Buff Potato Sprout pflanzen" },
      { kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" },
    ]},
  ]},
  { date: "6", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 4", answer: "P1 -> I'm here for you." }]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Back Alley: mit Yukari & Junpei losziehen" },
      { kind: "shop", label: "Talk + 20.000 Yen an Tanaka (Paulownia Mall) geben" },
      { kind: "stat", label: "Wilduck: Mystery Burger essen", stat: "courage" },
    ]},
  ]},
  { date: "7", slots: [
    { slot: "Morgen", items: [
      { kind: "shop", label: "Tanaka: Perfume Set (optional)" },
      { kind: "social", label: "Kazushis Nachricht annehmen", answer: "-> You prefer bread?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "8", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "boss", label: "Story: Full Moon Operation - Boss-Kampf (Empress- & Emperor-Arkana)", answer:
      "Beide nutzen Paradigm Shift (alle ~2 Runden) und wechseln dabei zufaellig ihre Affinitaeten.\nEmpress: immer schwach gegen eine PHYSISCHE Art (Start: Pierce).\nEmperor: immer schwach gegen eine ELEMENTAR-Art, kein Light/Dark (Start: Electric); resistiert Slash.\nParty erzwungen: MC, Akihiko (Zio), Junpei (Agi) - Yukari ist NICHT dabei.\nEmpf. Level 20+.\n\nStrategie: Runde 1 alle Guard. Ab Runde 2 Fuukas Full Analysis (35 SP, kostet keinen Zug) -> aktuelle Schwaechen scannen, beide downen -> All-Out Attack. Junpei bufft DEF (Rakukaja), Akihiko heilt. MC sollte Garu/Bufu/Pierce abdecken.\nAchtung: Emperors Getsu-ei ist bei Vollmond extrem stark - mit Tarunda/guter Ruestung abfedern, sonst droht KO.\nTipp: Bei unguenstigen Schwaechen zuerst die Empress (schwaecher) fokussieren." }]},
  ]},
  { date: "9", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "stat", label: "School Clinic: Mysterious Concoction trinken", stat: "courage" },
      { kind: "social", label: "Social Link: Chariot Rang 4", answer: "P1 -> That really sucks." },
    ]},
    { slot: "Abend", items: [
      { kind: "shop", label: "Talk + 10.000 Yen an Tanaka geben" },
      { kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" },
      { kind: "stat", label: "* Courage steigt auf \"Fearless\"" },
    ]},
  ]},
  { date: "10", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Emperor Rang 5", answer: "P1 -> They're the worst." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wilduck: Mystery Burger essen", stat: "courage" }]},
  ]},
  { date: "11", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Chariot Rang 5", answer: "P1 -> Back from the hospital?\nP2 -> Take my shoulder!" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: Highschool of Youth", stat: "charm" }]},
  ]},
  { date: "12", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Moon Rang 3", answer: "P1 -> The gourmet king." }]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" },
      { kind: "social", label: "Social Link: Death Rang 1" },
    ]},
  ]},
  { date: "13", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hanged Man Rang 4", answer: "P1 -> That's great news." }]},
    { slot: "Abend", items: [{ kind: "cutscene", label: "Theurgy-Tutorial (neuer Inhalt)" }]},
  ]},
  { date: "14", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Einladungen von Kenji & Kazushi NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Brand Watch Set + Rose Bouquet fuer Request (optional)" },
      { kind: "social", label: "Social Link: Hermit Rang 7", answer: "P1 -> Well, yeah.\nP2 -> She um... what?" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Vor Tartarus erledigen", answer:
        "1) 27. Request -> mit Mitsuru reden (Fencing Epee)\n2) 28. Request -> mit Akihiko reden (Protein Powder)\n3) Rarity Fortune vom Wahrsager (Club Escapade) holen, dann Tartarus" },
      { kind: "tartarus", label: "Tartarus", answer: "Ziele: Level 25+ - Etage 69 - 90.000+ Yen - passende Social-Link-Personas" },
    ]},
  ]},
  { date: "15", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Afternoon Class", answer: "Antwort: Keen eye", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "stat", label: "School Clinic: Mysterious Concoction trinken", stat: "courage" },
      { kind: "shop", label: "Alle Tartarus-Materialien verkaufen (~90.000 Yen+)" },
      { kind: "social", label: "Social Link: Chariot Rang 6", answer: "P1 -> Show some guts, man!\nP2 -> Why go so far?\nP3 -> What about your knee?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "16", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Magician Rang 6", answer: "P1 -> I've got plans already." }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "10.000 Yen an Tanaka geben (schaltet Devil-Social-Link frei)" },
      { kind: "social", label: "Social Link: Devil Rang 1" },
    ]},
  ]},
  { date: "17", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Afternoon Class", answer: "Antwort: Shamanism", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Art Club beitreten (Art Room, 1. Etage)" },
      { kind: "social", label: "Social Link: Fortune Rang 1" },
    ]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" },
      { kind: "stat", label: "* Academics steigt auf \"Smart\"" },
    ]},
  ]},
  { date: "18", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth erklaert die Missing-Person-Mechanik" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 2 (Fortune-Persona mitbringen)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: Highschool of Youth", stat: "charm" }]},
  ]},
  { date: "19", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Magician Rang 7", answer: "P1 -> What happened?\nP2 -> Bride-To-Be?\nP3 -> Congrats!" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: House of the Deceased", stat: "courage" }]},
  ]},
  { date: "20", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Cutscene: Koromaru" }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Devil Rang 2 (Devil-Persona mitbringen)", answer: "P1 -> \"Placebo.\"\nP2 -> Wow." }]},
  ]},
  { date: "21", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Amenity Suit Set (optional)" },
      { kind: "social", label: "Chihiros Einladung annehmen", answer: "P1 -> I'd help you again." },
    ]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: neues Video (optional)" },
      { kind: "stat", label: "Wilduck: Mystery Burger essen", stat: "courage" },
    ]},
  ]},
  { date: "22", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Afternoon Class", answer: "Antwort: Witch of Agnesi", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Chariot Rang 7", answer: "P1 -> How's your knee?\nP2 -> You have to get tougher!" }]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Wilduck: Mystery Burger essen", stat: "courage" },
      { kind: "stat", label: "* Courage MAX (\"Badass\")" },
    ]},
  ]},
  { date: "23", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 3", answer: "P1 -> You've got talent." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Hagakure: Special Hagakure Bowl essen", stat: "charm" }]},
  ]},
  { date: "24", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 4", answer: "P1 -> You're quitting art club?\nP2 -> Complaining to me won't help you." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Hagakure: Special Hagakure Bowl essen", stat: "charm" }]},
  ]},
  { date: "25", slots: [
    { slot: "Tag", items: [
      { kind: "quiz", label: "Afternoon Class", answer: "Antwort: The flutter effect", stat: "charm" },
      { kind: "stat", label: "* Charm steigt auf \"Popular\" (Rang 5)" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 5", answer:
      "P1 -> I'm all ears.\nP2 -> Yeah, she's in love.\nP3 -> Happy to help.\nP4 -> Hold her hand." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "26", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Fuuka im Hallway ansprechen" },
      { kind: "social", label: "Social Link: Priestess Rang 1" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "27", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Priestess Rang 2 (Priestess-Persona mitbringen)", answer: "P1 -> Sure.\nP2 -> Sure thing." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Rarity Fortune (Club Escapade) holen" },
      { kind: "tartarus", label: "Tartarus", answer:
        "1) Vermisste auf Etage 50, 56 & 64 retten (MISSABLE Request!)\n2) Elizabeth-Requests (optional)\n3) 90.000 Yen & Level 26+\n4) passende Social-Link-Personas" },
    ]},
  ]},
  { date: "28", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Fuukas Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Polizeistation: Rette-Belohnungen abholen & Materialien verkaufen" },
      { kind: "social", label: "Social Link: Moon Rang 4", answer: "P1 -> Are you feeling sick?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "29", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Dowsing", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Chariot Rang 8", answer: "P1 -> ..... (Schweigen)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "30", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Magician Rang 8", answer: "P1 -> Are you in trouble?\nP2 -> You should go with her." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Amronion Sprout pflanzen (optional)" },
      { kind: "social", label: "Social Link: Devil Rang 3", answer: "P1 -> Maybe a little." },
    ]},
  ]},
];

const JUNE_BUDGET = {
  "1": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
  "2": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "5": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "6": { total: "20.000", items: [["Tanaka-Zahlung (Pflicht)", "20.000"]],
    income: "Grosse Tanaka-Zahlung - Teil der Devil-Social-Link-Kette." },
  "9": { total: "13.000", items: [["Tanaka-Zahlung", "10.000"], ["House of the Deceased", "3.000"]] },
  "11": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
  "12": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
  "14": { total: "Ziel: 90.000+", approx: true, items: [["—", "—"]],
    income: "Tartarus-Lauf. Verkaufswert-Ziel 90.000+ Yen - Auszahlung am 15." },
  "15": { total: "0", items: [["—", "—"]], income: "Einnahmetag: alle Materialien verkaufen (~90.000 Yen+)." },
  "16": { total: "10.000", items: [["Tanaka-Zahlung", "10.000"]],
    income: "Schaltet den Devil-Social-Link frei." },
  "17": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "18": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
  "19": { total: "3.000", items: [["House of the Deceased", "3.000"]] },
};

const JUNE_TIPS = [
  "8. Juni (Full Moon): vorher gruendlich den Arqa-Block erkunden - Schaetze, EXP & Shuffle Times mitnehmen und dabei Geld-Karten priorisieren.",
  "Persona mit Eiha (Curse) mitfuehren: die Precious Hand in diesem Bereich ist schwach gegen Curse (z. B. Gurulu).",
  "Auf Etage 54 bis zu 3 Twilight Fragments aufsparen, um Onimaru Kunitsuna zu holen - wird fuer eine Elizabeth-Request gebraucht.",
  "Tanaka kostet im Juni insgesamt 40.000 Yen (20k am 6., 10k am 9., 10k am 16.) - das schaltet seinen Devil-Social-Link frei. Fest einplanen!",
  "Am 27. die Vermissten auf Etage 50/56/64 retten - sonst verpasst du eine Request unwiederbringlich.",
];

// ───────────────────────────── JULI ─────────────────────────────
// Daten: game8 (1.-26.) + GameFAQs (27.-31.). Full-Moon-Boss am 7. vage, mit Kampf-Info.
const JULY_DAYS = [
  { date: "1", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Persona: Strength fusionieren/summonen" },
      { kind: "social", label: "Zeit mit Yuko verbringen (Strength, ohne Rang-Up)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "2", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 6", answer: "P1 -> Is it good?\nP2 -> What do you mean?" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "Revenge Site Note vom Suspicious Man (Club Escapade, optional)" },
      { kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" },
    ]},
  ]},
  { date: "3", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: About romance.", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Priestess Rang 3", answer: "P1 -> Just a dash or two.\nP2 -> Just take it slow." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "4", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Strength Rang 4", answer: "P1 -> Sure thing." }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Devil Rang 4", answer: "P1 -> Sure have!" }]},
  ]},
  { date: "5", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: YABA Chocolate Set (optional)" },
      { kind: "social", label: "Chihiros Einladung annehmen", answer: "P1 -> You can do it." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "6", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Priestess Rang 4", answer: "P1 -> You're a hard worker.\nP2 -> That's not true." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: Highschool of Youth", stat: "charm" }]},
  ]},
  { date: "7", slots: [
    { slot: "Ganzer Tag", items: [
      { kind: "boss", label: "Story: Full Moon Operation - Boss-Kampf (Hierophant- & Lovers-Arkana)", answer:
        "Zwei Bosse nacheinander - KEIN Party-Wechsel zwischen den Kaempfen (nur Heilen/Items). Mitsuru ist fest dabei; waehle Junpei & Akihiko dazu (Mitsuru ist Fire-schwach - riskant gegen Lovers' Feuer). Empf. Level ~25.\n\nHIEROPHANT: castet AoE-Light (Makouga) -> Light-resistente/-nullende Persona (Principality nullt, Shiisaa resistiert). Verteilt Fear (Doomsday Doctrine) -> Patra/Dis-Fear (Yukari kann Patra). Keine physische Resistenz: physisch + mittlere Magie (Agilao/Bufula/Zionga/Garula, Assault Dive, Fatal End) + Akihiko-Debuffs + Theurgy.\n\nLOVERS: verteilt Charm (Holy Arrow, Sexy Dance = AoE-Charm). Heartbreaker macht AoE-Schaden + DREIFACH gegen Charmte -> Charm IMMER vorher heilen (Patra/Dis-Charm/Patra Gem). Resist-Charm-Persona mitnehmen. Fokus physisch (MC + Junpei), Akihiko debufft, Theurgy." },
      { kind: "social", label: "Social Link: Fool Rang 4" },
    ]},
  ]},
  { date: "8", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Between \"time\" and \"it's\"", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "stat", label: "School Clinic: Mysterious Concoction (falls Courage nicht max)", stat: "courage" },
      { kind: "social", label: "Social Link: Hanged Man Rang 5", answer: "P1 -> That's awful.\nP2 -> They would never." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Hagakure: Special Hagakure Bowl essen", stat: "charm" }]},
  ]},
  { date: "9", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Social Disparity", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Requests (optional, empfohlen)", answer: "1) Request 42 annehmen\n2) 4x Super Cat Food (Aohige Pharmacy) kaufen\n3) Weak Cat in Port Island Station Outskirts fuettern" },
      { kind: "prereq", label: "Persona: Hierophant fusionieren/summonen" },
      { kind: "social", label: "Zeit mit Bunkichi & Mitsuko (Hierophant, ohne Rang-Up)" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Fuuka (3. Etage Dorm) ansprechen -> Poinsettia (Request 43)" },
      { kind: "stat", label: "Gruppenlernen mit Mitsuru & Akihiko", stat: "academics" },
    ]},
  ]},
  { date: "10", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Kabbalah", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Weak Cat fuettern" },
      { kind: "social", label: "Social Link: Hierophant Rang 6", answer: "P1 -> Please don't fight." },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Amronion ernten & Amronion pflanzen" },
      { kind: "stat", label: "Lernen mit Fuuka & Yukari", stat: "academics" },
    ]},
  ]},
  { date: "11", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: The Katana", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Weak Cat fuettern" },
      { kind: "social", label: "Social Link: Hanged Man Rang 6", answer: "P1 -> Calm down.\nP2 -> That should be enough." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "12", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Max Safety Shoes Set (fuer Request 40)" },
      { kind: "prereq", label: "Weak Cat fuettern" },
      { kind: "prereq", label: "Persona: Hermit fusionieren/summonen" },
      { kind: "social", label: "Social Link: Hermit Rang 8", answer: "P1 -> Hurry up and tell me.\nP2 -> What is he like?" },
    ]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" },
      { kind: "social", label: "Social Link: Death Rang 3" },
    ]},
  ]},
  { date: "13", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hanged Man Rang 7" }]},
    { slot: "Abend", items: [
      { kind: "stat", label: "Lernen mit S.E.E.S.", stat: "academics" },
      { kind: "stat", label: "* Academics steigt auf \"Intelligent\" (Rang 5)" },
    ]},
  ]},
  { date: "14", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Dowsing" }]}]},
  { date: "15", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: An error in translation" }]}]},
  { date: "16", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Taira No Masakado" }]}]},
  { date: "17", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Comma Splice" }]}]},
  { date: "18", slots: [
    { slot: "Morgen", items: [
      { kind: "cutscene", label: "Elizabeth: Tartarus wurde erweitert (Yabbashah)" },
      { kind: "exam", label: "Pruefungen: letzter Tag" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "cutscene", label: "Cutscene: Ken wird vorgestellt" }]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Paulownia Mall: Mayoido Antiques jetzt geoeffnet" },
      { kind: "prereq", label: "Persona: Devil fusionieren/summonen" },
      { kind: "social", label: "Social Link: Devil Rang 5", answer: "P1 -> Whose face?\nP2 -> It's all about the money..." },
    ]},
  ]},
  { date: "19", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Tetracone Set (optional)" },
      { kind: "prereq", label: "Persona: Hermit fusionieren/summonen" },
      { kind: "social", label: "Social Link: Hermit Rang 9", answer: "P1 -> No way!\nP2 -> What are you planning?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "20", slots: [
    { slot: "Sommerausflug (20.-22. Juli)", items: [
      { kind: "prereq", label: "Strand-Sammelobjekte (Requests)", answer: "1) Pretty Seashell - links der Holzbruecke\n2) Strange Seaweed - rechts der Bruecke im Wasser\n3) Yakushima Wood - Treibholz am Ufer bei Fuuka\n4) Small Crab - Wasser bei den Felsen nahe dem Treibholz" },
      { kind: "social", label: "Social Link: Fool Rang 5" },
    ]},
  ]},
  { date: "23", slots: [
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Amronion ernten & Buff Potato pflanzen" },
      { kind: "stat", label: "Game Parade: Highschool of Youth", stat: "charm" },
    ]},
  ]},
  { date: "24", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Pruefungsergebnisse: Bester im Jahrgang", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Persona: Priestess fusionieren/summonen" },
      { kind: "social", label: "Social Link: Priestess Rang 5", answer: "P1 -> You did a great job.\nP2 -> I'm glad I could help.\nP3 -> Can you make more sometime?" },
    ]},
    { slot: "Abend", items: [
      { kind: "shop", label: "Pruefungsbelohnung: Mitsuru -> Stat Incenses II & Mega Master Band" },
      { kind: "link", label: "Link Episode: Akihiko 2 (Iwatodai Station)", stat: "charm" },
      { kind: "stat", label: "* Charm MAX (\"Charismatic\")" },
    ]},
  ]},
  { date: "25", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Yuko im Hallway ansprechen -> schaltet Tower frei (keine Zeit mit ihr verbringen)" },
      { kind: "cutscene", label: "Hinweis: Lovers (Yukari) koennte heute starten - fuer max. Social Links aufschieben" },
      { kind: "social", label: "Zeit mit Maiko verbringen (Hanged Man, ohne Rang-Up)" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Persona: Devil fusionieren/summonen" },
      { kind: "social", label: "Social Link: Devil Rang 6", answer: "P1 -> Sounds fun." },
    ]},
  ]},
  { date: "26", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Bebes Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Brand Wallet Set (optional)" },
      { kind: "social", label: "Social Link: Hermit Rang 10 (MAX)", answer: "P1 -> Oh, no worries.\nP2 -> Is that why you're sorry?\nP3 -> I'll miss you." },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Tower freischalten", answer: "Old Monk in der VIP-Area (Club Escapade) ansprechen, dann Bartender - danach in Reihenfolge bestellen:\n1) Margarita\n2) Bloody Mary\n3) Screwdriver\n4) Oolong Tea" },
      { kind: "social", label: "Social Link: Tower Rang 1" },
    ]},
  ]},
  { date: "27", slots: [
    { slot: "Abend", items: [{ kind: "social", label: "Teestunde mit Mitsuru (Empress, ohne Rang-Up) -> Luxe Tea" }]},
  ]},
  { date: "28", slots: [
    { slot: "Abend", items: [{ kind: "social", label: "DVDs mit Yukari (Lovers, ohne Rang-Up)", answer: "Belohnung: Healing Master (Charakteristik), Charm +1, Lovers +1" }]},
  ]},
  { date: "29", slots: [
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
    { slot: "Dark Hour", items: [{ kind: "cutscene", label: "Cutscene (Story): Naganaki-Schrein (Koromaru)" }]},
  ]},
  { date: "30", slots: [
    { slot: "Abend", items: [{ kind: "stat", label: "Lesesession mit Fuuka (Weakness Buffer)", stat: "academics" }]},
    { slot: "Dark Hour", items: [{ kind: "cutscene", label: "Cutscene (Story): naechtlicher Besuch (Pharos)" }]},
  ]},
  { date: "31", slots: [
    { slot: "Abend", items: [{ kind: "social", label: "Kochen mit Yukari (Lovers +1)" }]},
  ]},
];

const JULY_BUDGET = {
  "1": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "6": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
  "11": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "23": { total: "3.000", items: [["Highschool of Youth", "3.000"]] },
  "26": { total: "~", approx: true, items: [["Tower-Freischaltung: 4 Cocktails (Club Escapade)", "~"]],
    income: "Margarita, Bloody Mary, Screwdriver, Oolong Tea in dieser Reihenfolge - startet den Tower-Social-Link." },
  "29": { total: "3.000", items: [["You're the Answer", "3.000"]] },
};

const JULY_TIPS = [
  "7. Juli (Full Moon): zwei Bosse hintereinander (Hierophant -> Lovers) OHNE Party-Wechsel dazwischen. Mitsuru ist fest dabei - waehle Junpei & Akihiko. Heilen/Items nur zwischen den Kaempfen.",
  "Patra/Dis-Fear UND Patra/Dis-Charm bereithalten: Hierophant verteilt Fear, Lovers verteilt Charm. Resist-Charm-Persona entschaerft Lovers' Heartbreaker.",
  "Ab 18. Juli ist der Yabbashah-Block offen (Tartarus erweitert) - neue Gatekeeper kommen in den Tartarus-Tab.",
  "Katze fuettern (ab 9. Juli ueber mehrere Tage): 4x Super Cat Food kaufen und den Weak Cat taeglich fuettern - Teil einer Request-Kette.",
  "Charm wird am 24. max (Charismatic) - danach gibt's den 1,51x-Bonus auf Social Links zusaetzlich zur passenden Persona.",
];

// ───────────────────────────── AUGUST ─────────────────────────────
// Daten: game8 (1.-28.). Full-Moon-Boss am 6. (Chariot & Justice) vage, mit Kampf-Info.
const AUGUST_DAYS = [
  { date: "1", slots: [
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Devil Rang 8", answer: "P1 -> Why would he say that?" }]},
  ]},
  { date: "2", slots: [
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "3", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth: zwei Vermisste sind in Tartarus" }]},
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Hanged Man Rang 8", answer: "P1 -> Hamburgers\nP2 -> You're a good girl.\nP3 -> Your dad." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Rarity Fortune vom Wahrsager (Club Escapade) holen" },
      { kind: "tartarus", label: "Tartarus (grosser Lauf)", answer: "1) Vermisste auf Etage 79 & 84 retten\n2) 100.000+ Yen & Level 35+\n3) Etage 92 erreichen\n4) Monad-Passage-Boss auf 91 (optional)\n5) passende Social-Link-Personas" },
    ]},
  ]},
  { date: "4", slots: [
    { slot: "Tag", items: [
      { kind: "prereq", label: "Gardening: Buff Potato ernten & neu pflanzen (optional)" },
      { kind: "shop", label: "Polizeistation: Materialien verkaufen + Rette-Belohnungen abholen" },
      { kind: "prereq", label: "Yukos Einladung annehmen", answer: "P1 -> You're very responsible." },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Devil Rang 9", answer: "P1 -> Are you going to donate?" }]},
  ]},
  { date: "5", slots: [
    { slot: "Tag", items: [{ kind: "prereq", label: "Kazushis Einladung annehmen", answer: "P1 -> That's just who you are." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "6", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "boss", label: "Story: Full Moon Operation - Boss-Kampf (Chariot- & Justice-Arkana)", answer:
      "Im Untergrund-Stuetzpunkt (nicht Tartarus). Strega sperrt die Tuer - du waehlst dein Team & kannst speichern. Empf. Level ~35.\n\nPHASE 1 - Tank-Form: keine ausnutzbare Schwaeche. Mit Elementar-Break-Skills die Resistenzen brechen, dann starke Angriffe/Theurgy -> spaltet die Tank-Form in Chariot & Justice. Die Tank markiert vorab einen Mitstreiter -> diesen Guard gehen lassen.\n\nPHASE 2 - getrennt: BEIDE gleichzeitig (oder direkt nacheinander) toeten! Stirbt nur einer, belebt der andere ihn per Restore/Samarecarm. Nach ~3 Runden verschmelzen sie wieder -> erneut mit Theurgy aufspalten. Theurgy waehrend der Tank-Phase aufladen (auch Fuukas).\n\nGefahren: Poison Mist (Gift), Chariot verteilt Fear/Panic, Justice nutzt Hama (Light-Insta-Kill!). Light-blockende Persona + Me Patra / Dis-Poison / Patra Gem mitbringen. Ausgewogener Phys-/Magie-Schaden." }]},
  ]},
  { date: "7", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Bebes oder Keisukes Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "prereq", label: "Hayase im Iwatodai Strip Mall ansprechen" },
      { kind: "social", label: "Social Link: Star Rang 1" },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 2", answer: "P1 -> None of your business.\nP2 -> How should I address you?" }]},
    { slot: "Nacht", items: [{ kind: "social", label: "Social Link: Death Rang 5" }]},
  ]},
  { date: "8", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth: Tartarus erweitert (Yabbashah II)" }]},
    { slot: "Tag", items: [
      { kind: "prereq", label: "Request 58 (MISSABLE)", answer: "1) Bandages an Fierce-looking Delinquent (Port Island Station Outskirts)\n2) Student Handbook an Flustered Student (Port Island Station)\n3) Irresistable Catnip an Cat-Loving Boy (Iwatodai Strip Mall), dann zu Elizabeth" },
      { kind: "social", label: "Social Link: Hanged Man Rang 9", answer: "P1 -> Friends forever." },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Devil Rang 10 (MAX)" }]},
  ]},
  { date: "9", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Isotope Soda Set (optional)" },
      { kind: "prereq", label: "Voraussetzung fuer Sun", answer: "1) Akinari (Thin Young Man) am Naganaki-Schrein ansprechen\n2) Koromaru ansprechen -> roter Fueller\n3) noch KEINE Zeit mit ihm verbringen" },
      { kind: "link", label: "Link Episode: Junpei 2 (Iwatodai Strip Mall)", stat: "charm" },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 3", answer: "P1 -> I don't have any friends." }]},
  ]},
  { date: "10", slots: [
    { slot: "Sommerschule (10.-14. August)", items: [{ kind: "stat", label: "Summer School: Academics ✦✦ (×4 Tage)", stat: "academics" }]},
  ]},
  { date: "15", slots: [
    { slot: "Morgen", items: [{ kind: "stat", label: "Summer School: letzter Tag", stat: "academics" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru mit Aigis Gassi gehen" }]},
  ]},
  { date: "16", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "cutscene", label: "Sommerfest: beliebiges Maedchen einladen (ab Rang 1)" }]},
  ]},
  { date: "17", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Curse Paper Set (optional)" },
      { kind: "prereq", label: "Gardening: Kartoffeln ernten & Buff Potato pflanzen (optional)" },
      { kind: "social", label: "Social Link: Moon Rang 5", answer: "P1 -> That's right." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Wakatsu: Seafood Full Course essen", stat: "academics" }]},
  ]},
  { date: "18", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Moon Rang 6", answer: "P1 -> Are you sick?" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Umiushi Fan Book oder Iwatodai Forum Note", stat: "academics" }]},
  ]},
  { date: "19", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" }]},
    { slot: "Tag", items: [
      { kind: "prereq", label: "Umiushi Beef Bowl (Iwatodai Strip Mall) kaufen - Request" },
      { kind: "social", label: "Social Link: Star Rang 2", answer: "P1 -> Sounds like a lot of pressure.\nP2 -> Myself." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "20", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Moon Rang 7", answer: "P1 -> The world is ending?" }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 4", answer: "P1 -> Yeah, that might look cool." }]},
  ]},
  { date: "21", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Star Rang 3", answer: "P1 -> For your teammates?\nP2 -> Sounds like fun." }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 5", answer: "P1 -> I have enough.\nP2 -> No." }]},
  ]},
  { date: "22", slots: [
    { slot: "Tag", items: [{ kind: "link", label: "Link Episode: Koromaru 1 (vor dem Dorm)", stat: "charm" }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 6", answer: "P1 -> You should go home.\nP2 -> Do you have any coworkers?" }]},
  ]},
  { date: "23", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Soul Spinach Sprout Set (optional)" },
      { kind: "prereq", label: "Akinari am Naganaki-Schrein ansprechen" },
      { kind: "social", label: "Social Link: Sun Rang 1" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru mit Akihiko Gassi gehen" }]},
  ]},
  { date: "24", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Kino mit Yukari", stat: "academics" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Koromaru", stat: "academics" }]},
  ]},
  { date: "25", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Moon Rang 8", answer: "P1 -> No you're not." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: SciFi-Roman mit Fuuka lesen", stat: "academics" }]},
  ]},
  { date: "26", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Kenjis Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Hierophant Rang 7", answer: "P1 -> What happened?\nP2 -> That's great.\nP3 -> beliebige Antwort" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Game Parade: You're the Answer", stat: "academics" }]},
  ]},
  { date: "27", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Kenjis Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Moon Rang 9" }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 7", answer: "P1 -> You probably shouldn't." }]},
  ]},
  { date: "28", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Social Link: Moon Rang 10 (MAX) - Star heute nicht verfuegbar" }]},
  ]},
  { date: "29", slots: [
    { slot: "Ferien-Endspurt (29.-31. August)", items: [{ kind: "cutscene", label: "Flexible Tage: offene Raenge (Tower/Star/Sun) & Wakatsu-Essen nachholen. Am 31. Uebergang zum September - die Schule beginnt am 1.9. (Daten hier bewusst offen gehalten)" }]},
  ]},
];

const AUGUST_BUDGET = {
  "3": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Grosser Tartarus-Lauf: 100.000+ Yen, Level 35+, Etage 92, Vermisste auf 79/84 retten. Auszahlung am 4." },
  "4": { total: "0", items: [["—", "—"]], income: "Einnahmetag: alle Materialien verkaufen + Rette-Belohnungen." },
  "5": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "19": { total: "3.000", items: [["You're the Answer", "3.000"]] },
  "26": { total: "3.000", items: [["You're the Answer", "3.000"]] },
};

const AUGUST_TIPS = [
  "6. August (Full Moon): Chariot & Justice. Erst als Tank-Form (keine Schwaeche) -> mit Theurgy/starken Angriffen aufspalten, dann BEIDE gleichzeitig toeten (sonst belebt der Ueberlebende den anderen).",
  "Status-Schutz Pflicht: Poison Mist (Gift), Chariot verteilt Fear/Panic, Justice nutzt Hama (Light-Insta-Kill!). Light-blockende Persona + Me Patra / Dis-Poison / Patra Gem mitbringen.",
  "Yabbashah II ist nach dem 6. offen (zweite Haelfte bis Etage 118) - neue Gatekeeper im Tartarus-Tab (siehe Mond-Button).",
  "Sun-Social-Link (Akinari) ab 9.8. freischaltbar: Hanged Man Rang 3 + Academics Rang 4, dann am Naganaki-Schrein + roter Fueller von Koromaru.",
  "Missable: Request 58 (8.8.) und die Vermissten auf Etage 79/84 (3.8.) - rechtzeitig erledigen, sonst weg.",
];

// ───────────────────────────── SEPTEMBER ─────────────────────────────
// Daten: game8 (1.-29.). Full-Moon-Boss am 5. (Hermit) vage, mit Kampf-Info.
const SEPT_DAYS = [
  { date: "1", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Resistance.", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Persona: Justice fusionieren/summonen" },
      { kind: "social", label: "Social Link: Justice Rang 7", answer: "P1 -> It's gotta be a misunderstanding.\nP2 -> We have to do something..." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: School X Site Note", stat: "academics" }]},
  ]},
  { date: "2", slots: [
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Buch mit Aigis lesen", stat: "charm" }]},
  ]},
  { date: "3", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Persona: Lovers fusionieren/summonen" },
      { kind: "prereq", label: "Lukewarm Taiyaki kaufen + Yukari im Klassenzimmer ansprechen" },
      { kind: "social", label: "Social Link: Lovers Rang 1" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Rarity Fortune (Club Escapade) holen" },
      { kind: "tartarus", label: "Tartarus (Yabbashah II - Abschluss)", answer: "1) Vermisste auf Etage 101, 109 & 114 retten\n2) 100.000+ Yen & Level 41+\n3) Etage 118 erreichen\n4) Monad-Passage-Bosse auf 117 (optional)\n5) passende Social-Link-Personas" },
    ]},
  ]},
  { date: "4", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Polizeistation: Materialien verkaufen + Rette-Belohnungen" },
      { kind: "prereq", label: "10 Sprouts/Seeds bei Rafflesia kaufen (Gardening) + Mitsuru: Reinstatement Forms (fuer Shinjiro-Episodes)" },
      { kind: "link", label: "Link Episode: Shinjiro 1", stat: "courage" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Chilled Taiyaki aus dem Kuehlschrank -> zu Elizabeth (Request)" },
      { kind: "social", label: "Social Link: Tower Rang 8", answer: "P1 -> Dad?\nP2 -> I was with a friend.\nP3 -> Are you running away?" },
    ]},
  ]},
  { date: "5", slots: [
    { slot: "Ganzer Tag", items: [{ kind: "boss", label: "Story: Full Moon Operation - Boss-Kampf (Hermit-Arkana)", answer:
      "Hermit haengt am Stromnetz von Club Escapade. Junpei fehlt (Story-Grund). Empf. Level ~41.\nKeine Schwaeche. Immun: Elec, Wind, Dark.\nBestes Team: Mitsuru, Ken, Shinjiro (Akihiko resistiert Elec). NICHT Yukari/Aigis (Elec-schwach).\n\nOffensive: physisch + Magie, die NICHT Elec/Wind/Light/Dark ist. Buffs (Matarukaja/Marakukaja) + Hermit debuffen (Tarunda/Rakunda). Thunder Charms (Kurosawa-Shop) helfen gegen Elec.\n\nAufladung: Hermit nutzt Initiate Charging -> Mega Spark, spaeter Accelerated Charging -> Tera Spark (riesiger Elec-AoE). Mit genug Schaden/Theurgy waehrend des Aufladens unterbrechen - Theurgy genau dafuer aufsparen. Wenn es durchlaedt: alle Guard. Shock sofort heilen." }]},
  ]},
  { date: "6", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Brand Purse Set (optional)" },
      { kind: "social", label: "Social Link: Sun Rang 3", answer: "P1 -> I couldn't say.\nP2 -> Try not to talk so much." },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 9 (alle Antworten gleich)" }]},
  ]},
  { date: "7", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 2", answer: "P1 -> Cute pink.\nP2 -> That's mean." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Garten mit Shinjiro pflegen 1" }]},
  ]},
  { date: "8", slots: [
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Koromaru 2", stat: "courage" }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Ken 1 (Dorm 2F)", stat: "academics" }]},
  ]},
  { date: "9", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Request 9 annehmen + alle Drinks holen (schaltet Request 11 frei)" },
      { kind: "social", label: "Social Link: Strength Rang 5", answer: "P1 -> It's because you teach so well.\nP2 -> I trust whatever you decide Yuko." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Big Eater Challenge (Wilduck Burger) - alle Stats ✦✦", answer: "1) Von den Burgern wegschauen\n2) Ohne Pause essen\n3) Sich etwas Saures vorstellen" }]},
  ]},
  { date: "10", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: To reveal a secret.", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Request 68 -> Shinjiro abends ansprechen (Fruit Knife) + Request 54 starten (bis 12.9. taeglich zum Schrein)" },
      { kind: "social", label: "Social Link: Lovers Rang 3" },
    ]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Elizabeth: Tartarus erweitert (Tziah)" },
      { kind: "prereq", label: "Gardening: Soul Spinach ernten & neu pflanzen + Request 69 (Aigis -> Machine Oil)" },
      { kind: "social", label: "Social Link: Tower Rang 10 (MAX)", answer: "P1 -> Awesome!" },
    ]},
  ]},
  { date: "11", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: The Hermetica", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Priestess Rang 6", answer: "P1 -> Of course.\nP2 -> That's the spirit" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Yukari" }]},
  ]},
  { date: "12", slots: [
    { slot: "Morgen", items: [
      { kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" },
      { kind: "class", label: "Morning Class: wach bleiben", stat: "academics" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Strength Rang 6", answer: "P1 -> You guys got this!\nP2 -> As long as we believe in them." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Shinjiro" }]},
    { slot: "Dark Hour", items: [{ kind: "social", label: "Social Link: Death Rang 6" }]},
  ]},
  { date: "13", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Fuukas/Yukaris Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Emergency Vest Set (optional)" },
      { kind: "prereq", label: "Requests: Queen Elizabeth (Que Sera Sera, R56); Mahjong Tile (Red Hawk -> Schere, R67); Lukewarm Taiyaki kuehlen (R38)" },
      { kind: "link", label: "Link Episode: Shinjiro 2", stat: "charm" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Buch mit Mitsuru lesen", stat: "academics" }]},
  ]},
  { date: "14", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Their soulmate.", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Priestess Rang 7", answer: "P1 -> That's messed up.\nP2 -> Is that the only reason? (Beziehung beginnt)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Garten mit Shinjiro pflegen 2" }]},
  ]},
  { date: "15", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 8", answer: "P1 -> I know you're innocent." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Yukari", stat: "charm" }]},
  ]},
  { date: "16", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Strength Rang 7", answer: "P1 -> Are you relieved?\nP2 -> Let's do it." }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Ken 2", stat: "courage" }]},
  ]},
  { date: "17", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 5", answer: "P1 -> You should tell your dad." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: SciFi-Roman mit Fuuka lesen 2", stat: "academics" }]},
  ]},
  { date: "18", slots: [
    { slot: "Taifun (18.-20. September)", items: [
      { kind: "cutscene", label: "Story: Taifun beginnt" },
      { kind: "cutscene", label: "Velvet Room: neue Spezial-Fusionen freigeschaltet" },
    ]},
  ]},
  { date: "21", slots: [
    { slot: "Tag", items: [{ kind: "link", label: "Link Episode: Shinjiro 3", stat: "academics" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Koromaru 3", stat: "academics" }]},
  ]},
  { date: "22", slots: [
    { slot: "Morgen", items: [
      { kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" },
      { kind: "prereq", label: "Yukos/Kenjis Einladung NICHT annehmen" },
    ]},
    { slot: "Tag", items: [
      { kind: "prereq", label: "Gardening: Soul Spinach ernten & neu pflanzen" },
      { kind: "link", label: "Link Episode: Koromaru 3" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Rarity Fortune (Club Escapade) holen" },
      { kind: "tartarus", label: "Tartarus (Tziah I)", answer: "1) Vermisste auf Etage 120, 135 & 140 retten\n2) 100.000+ Yen & Level 50+\n3) Etage 144 erreichen\n4) Monad-Passage-Boss auf 143 (optional)\n5) passende Social-Link-Personas" },
    ]},
  ]},
  { date: "23", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Polizeistation: Materialien verkaufen + Rette-Belohnungen" },
      { kind: "prereq", label: "Keisukes Einladung NICHT annehmen" },
      { kind: "link", label: "Link Episode: Koromaru 4", stat: "courage" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru mit Shinjiro Gassi gehen" }]},
  ]},
  { date: "24", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Mitsuru ansprechen -> \"Wait a minute.\" (schaltet Shinjiro LE4 frei)" },
      { kind: "social", label: "Zeit mit Chihiro verbringen (ohne Rang-Up)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: SciFi-Roman mit Fuuka 3 lesen", stat: "academics" }]},
  ]},
  { date: "25", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Zeit mit Fuuka verbringen (ohne Rang-Up)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Yukari 2" }]},
  ]},
  { date: "26", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Tetractys", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Strength Rang 8", answer: "P1 -> A boy / A girl." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Shinjiro 2" }]},
  ]},
  { date: "27", slots: [
    { slot: "Morgen", items: [{ kind: "shop", label: "Tanaka: R/C Geta Set (optional)" }]},
    { slot: "Tag", items: [{ kind: "link", label: "Link Episode: Shinjiro 4", stat: "courage" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru mit Akihiko Gassi gehen" }]},
  ]},
  { date: "28", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Emperor Rang 6", answer: "P1 -> But I just got here..." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Garten mit Shinjiro pflegen 3" }]},
  ]},
  { date: "29", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Chariot Rang 9", answer: "P1 -> I don't mind at all." }]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: neue Videos" },
      { kind: "stat", label: "Garten mit Fuuka pflegen" },
    ]},
  ]},
  { date: "30", slots: [
    { slot: "Hinweis", items: [{ kind: "cutscene", label: "Letzter September-Tag - game8-Seite hier abgeschnitten; wahrscheinlich Social-Link-/Story-Tag. Im Spiel pruefen (Daten offen gehalten)." }]},
  ]},
];

const SEPT_BUDGET = {
  "3": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Grosser Tartarus-Lauf: Etage 118, Level 41+, Vermisste auf 101/109/114. Auszahlung am 4." },
  "4": { total: "0", items: [["—", "—"]], income: "Einnahmetag: Materialien verkaufen + Rette-Belohnungen." },
  "22": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Tartarus-Lauf (Tziah I): Etage 144, Level 50+, Vermisste auf 120/135/140. Auszahlung am 23." },
  "23": { total: "0", items: [["—", "—"]], income: "Einnahmetag: Materialien verkaufen + Rette-Belohnungen." },
};

const SEPT_TIPS = [
  "5. September (Full Moon): Hermit. Keine Schwaeche, immun gegen Elec/Wind/Dark. Junpei fehlt (Story). Bestes Team: Mitsuru, Ken, Shinjiro/Akihiko. Physisch + Buffs/Debuffs; Theurgy fuers Unterbrechen der Aufladung aufsparen.",
  "MISSABLE Hierophant: Bunkichi verschwindet um den 12.9. in Tartarus - bis spaetestens 3.10. retten, sonst ist der Hierophant-Link blockiert.",
  "Tziah oeffnet ab ~10.9. (Tartarus erweitert): neue Mechaniken Dark Zones & Greedy Shadows - Block kommt in den Tartarus-Tab (Mond-Button).",
  "Neue Teammitglieder: Ken & Shinjiro stossen dazu (plus Koromaru) - viele neue Link Episodes & Theurgies.",
  "Zwei grosse Tartarus-Laeufe: 3.9. (bis Etage 118, Lvl 41) und 22.9. (bis Etage 144, Lvl 50) - jeweils Vermisste retten.",
];

// ───────────────────────────── OKTOBER ─────────────────────────────
// Daten: game8 (1.-31.). VARIANTE 3: spoiler-lastige Tage sind mit spoiler:true markiert.
const OCT_DAYS = [
  { date: "1", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 9", answer:
      "P1 -> Don't worry, she'll help us.\nP2 -> You need to tell her yourself\nP3 -> What's gotten into you?\nP4 -> I feel the same, Chihiro. (Beziehung beginnt)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Buch mit Fuuka lesen", stat: "academics" }]},
  ]},
  { date: "2", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 4", answer: "P1 -> Are you alright?" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Yukari 3 -> Charakteristik \"Healing Master\"" }]},
  ]},
  { date: "3", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 10 (MAX)", answer: "P1 -> Thank you." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Shinjiro 3 -> Charakteristik \"Auto Heat Riser\"" }]},
  ]},
  { date: "4", spoiler: true, slots: [
    { slot: "Ganzer Tag", items: [{ kind: "boss", label: "Story: Full Moon Operation - Boss-Kampf (Strength- & Fortune-Arkana)", answer:
      "Zwei Bosse in EINEM Kampf. Ken & Shinjiro sind nicht verfuegbar. Empf. Level ~58.\nStrength schirmt Fortune ab -> Fortune ist unangreifbar, bis Strength faellt (Fortune greift dich aber an).\n\nSTRENGTH: keine Schwaeche. Resistiert Slash & Pierce, SPIEGELT Strike (!). Also KEINE physischen Angriffe - nur Magie. Starke Einzelziel-Elementarskills (Agidyne/Bufudyne/Garudyne/Ziodyne), Concentrate + Charge, Rakunda/Tarunda drauf, Matarukaja/Marakukaja auf die Party. Theurgy hier einsetzen (Fuuka buffen, Yukari & Akihiko fuer Schaden).\n\nFORTUNE: schwach gegen Strike & Elec. Absorbiert Fire, Ice, Wind, Light. Nutzt Wind-Magie und das \"Wheel of Fortune\" (Zufallseffekt, teils ~200-300 Schaden an allen, ignoriert Immunitaeten).\n\nTeam: Yukari (Wind-resistent, Heilung) + Akihiko (Strike/Elec fuer Fortune). Aigis (keine Elementarskills) und Junpei (Wind-schwach) eher meiden. Bei ~300 HP Verlust sofort heilen." }]},
  ]},
  { date: "5", spoiler: true, slots: [
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: neue Videos" },
      { kind: "prereq", label: "Gardening: Soul Spinach ernten & neu pflanzen" },
      { kind: "link", label: "Link Episode (Story-relevant)", answer: "Shinjiros Zimmer (2. Etage) betreten und den Schreibtisch untersuchen -> 5. Link Episode" },
      { kind: "stat", label: "Dorm: Koromaru mit Aigis Gassi gehen" },
    ]},
  ]},
  { date: "6", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Neue Elizabeth-Requests verfuegbar" },
      { kind: "prereq", label: "Fortune fuer Yuko ziehen (Strength)" },
    ]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Elizabeth: Tartarus wurde erweitert" },
      { kind: "stat", label: "Dorm-PC: Veggie Farmer Sim" },
      { kind: "social", label: "Social Link: Death Rang 8" },
    ]},
  ]},
  { date: "7", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Dopamine", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Star Rang 5", answer: "P1 -> Are you okay?\nP2 -> I'll come back here with you." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Request 76 annehmen -> mit Shuji reden (Gag Glasses)" },
      { kind: "shop", label: "Veggie Garden URL vom Suspicious Man kaufen + am Dorm-PC nutzen" },
    ]},
  ]},
  { date: "8", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Golden Tomato Sprouts fuer die naechste Ernte kaufen" },
      { kind: "prereq", label: "Fortune fuer Yukari ziehen (Lovers)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Iwatodai Forum Note", stat: "academics" }]},
  ]},
  { date: "9", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Star Rang 6", answer: "P1 -> Don't worry, it's okay." }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Akihiko 3", stat: "charm" }]},
  ]},
  { date: "10", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Helena Blavatsky", stat: "charm" }]},
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Persona: Hierophant fusionieren/summonen" },
      { kind: "social", label: "Social Link: Hierophant Rang 9", answer: "P1 -> What does the letter say?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Koromaru mit Ken Gassi gehen" }]},
  ]},
  { date: "11", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Paring Knife Set (optional)" },
      { kind: "social", label: "Social Link: Sun Rang 4", answer: "P1 -> I'd say so.\nP2 -> I stop if I get bored." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Security Site Note", stat: "courage" }]},
  ]},
  { date: "12", slots: [
    { slot: "Tag", items: [{ kind: "prereq", label: "Fortune fuer Yukari ziehen (Lovers)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Gruppenlernen mit allen Dorm-Bewohnern", stat: "academics" }]},
  ]},
  { date: "13", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Addiction" }]}]},
  { date: "14", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Pythagoras" }]}]},
  { date: "15", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Superconductivity" }]}]},
  { date: "16", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: To reveal a secret" }]}]},
  { date: "17", slots: [
    { slot: "Morgen", items: [{ kind: "exam", label: "Pruefungen: letzter Tag" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Strength Rang 9", answer:
      "P1 -> You're so hardworking.\nP2 -> An instructor?\nP3 -> It's because I love you. (Beziehung beginnt)" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Soul Spinach ernten & Golden Tomato pflanzen" },
      { kind: "stat", label: "Dorm: Kochen mit Akihiko 2" },
    ]},
  ]},
  { date: "18", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Einladungen von Kazushi, Keisuke & Kenji NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Instant Curry Set (optional)" },
      { kind: "social", label: "Social Link: Sun Rang 5", answer: "P1 -> You need to listen to your body." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Strength Social Link ✦✦✦)" }]},
  ]},
  { date: "19", slots: [
    { slot: "Tag", items: [
      { kind: "stat", label: "Pruefungsergebnisse: Bester im Jahrgang", stat: "charm" },
      { kind: "quiz", label: "Afternoon Class", answer: "Antwort: India", stat: "charm" },
    ]},
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Pruefungsbelohnung: Mitsuru -> Stat-III-Incenses & Pendant of Unity" },
      { kind: "social", label: "Social Link: Lovers Rang 4", answer: "P1 -> Are you okay?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Buch mit Mitsuru lesen 2", stat: "academics" }]},
  ]},
  { date: "20", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 5", answer: "P1 -> Sure.\nP2 -> Just stay in Japan!" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Yukari 2", stat: "charm" }]},
  ]},
  { date: "21", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 5", answer: "P1 -> I'm sorry." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kochen mit Akihiko 3 -> Charakteristik \"Buff Boost\"" }]},
  ]},
  { date: "22", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Venus", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 6", answer: "P1 -> Anytime.\nP2 -> I wouldn't mind." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: SciFi-Roman mit Fuuka lesen" }]},
  ]},
  { date: "23", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Star Rang 7", answer:
      "P1 -> It's no problem at all.\nP2 -> Sounds pretty rough.\nP3 -> Don't give up yet." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Ken", stat: "courage" }]},
  ]},
  { date: "24", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 7", answer: "P1 -> Sounds good." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Fortune Social Link ✦✦✦)" }]},
  ]},
  { date: "25", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Einladungen von Yukari & Yuko NICHT annehmen" }]},
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Pumpkin Mask Set (optional)" },
      { kind: "social", label: "Social Link: Sun Rang 6", answer: "P1 -> Sounds fine to me.\nP2 -> It sounds interesting." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Star Social Link ✦✦✦)" }]},
  ]},
  { date: "26", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Morning Class", answer: "Antwort: Izumo", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 8", answer: "P1 -> All right." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Baseball-Manga mit Junpei lesen", stat: "courage" }]},
  ]},
  { date: "27", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 6", answer: "P1 -> It's your choice now." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Fuuka pflegen 2" }]},
  ]},
  { date: "28", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 9", answer: "P1 -> ...... (Schweigen)\nP2 -> I love you. (Beziehung beginnt)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Yakuza-Roman mit Aigis lesen 2", stat: "charm" }]},
  ]},
  { date: "29", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Magician Rang 9", answer: "P1 -> Let me handle this!" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Junpei pflegen" }]},
  ]},
  { date: "30", slots: [
    { slot: "Morgen", items: [
      { kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" },
      { kind: "quiz", label: "Morning Class", answer: "Antwort: Beta-amylase", stat: "charm" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 6", answer:
      "P1 -> Why not take a break?\nP2 -> Let's do it.\nP3 -> I have your back!" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Vor Tartarus erledigen", answer: "1) Rarity Fortune vom Wahrsager (Club Escapade) holen\n2) Neue URLs vom Suspicious Man (Club Escapade) kaufen" },
      { kind: "tartarus", label: "Tartarus (Tziah II - Abschluss)", answer: "1) Vermisste auf Etage 146, 159 & 165 retten\n2) 100.000+ Yen & Level 58+\n3) Etage 172 erreichen\n4) Monad-Passage-Bosse auf 171 (optional)\n5) passende Social-Link-Personas fuer November" },
    ]},
  ]},
  { date: "31", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Polizeistation: Materialien verkaufen + Rette-Belohnungen" },
      { kind: "social", label: "Social Link: Priestess Rang 8", answer: "P1 -> I believe in myself.\nP2 -> Not at all." },
    ]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: neues Video" },
      { kind: "stat", label: "Dorm: DVD mit Akihiko", stat: "courage" },
    ]},
  ]},
];

const OCT_BUDGET = {
  "30": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Grosser Tartarus-Lauf: Etage 172, Level 58+, Vermisste auf 146/159/165. Auszahlung am 31." },
  "31": { total: "0", items: [["—", "—"]], income: "Einnahmetag: Materialien verkaufen + Rette-Belohnungen." },
};

const OCT_TIPS = [
  "4. Oktober (Full Moon): Strength & Fortune. Strength SPIEGELT Strike und resistiert Slash/Pierce -> nur Magie! Fortune ist erst angreifbar, wenn Strength faellt; danach schwach gegen Strike & Elec.",
  "Arkana fuer Oktober: Magician, Priestess, Hierophant, Lovers, Justice, Fortune, Strength, Temperance, Star, Sun.",
  "Golden Hands (Etage 145-172) sind schwach gegen ELECTRICITY - nicht gegen Light (game8 hat das im Tipp-Text falsch, die Kommentare korrigieren es). Ziodyne-Persona mitnehmen.",
  "Ken ist trotzdem stark im Tartarus: Kouha-Fokus, Theurgy mit schwerem Light-Schaden und passive SP-Regeneration ueber seine Charakteristik.",
  "Drei Social Links erreichen im Oktober Rang 10 bzw. Beziehungsstart: Justice (3.10.), Strength (17.10.), Lovers (28.10.) - Antworten sind hinterlegt.",
  "MISSABLE-Erinnerung: Bunkichi (Hierophant) muss bis 3.10. aus Tartarus gerettet sein, Maiko (Hanged Man) verschwindet ~21.10. und braucht Rettung bis 3.11.",
];

// ───────────────────────────── NOVEMBER ─────────────────────────────
// Daten: GameFAQs (TenSquare3, Volltext-Dialoge) + samurai-gamers als Gegencheck.
// game8 November-Seite war beim Abruf nicht erreichbar. VARIANTE 3: spoiler:true markiert.
const NOV_DAYS = [
  { date: "1", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Become-a-Samurai Set (39.800) - ueberspringen" },
      { kind: "social", label: "Social Link: Sun Rang 4", answer: "P1 -> I'd say so\nP2 -> I stop if I get bored" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Yukari kommt mit)" }]},
  ]},
  { date: "2", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 7", answer: "P1 -> Sounds good" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "WICHTIG: Kampf-Personas VOR der Abend-Aktivitaet ausruesten" },
      { kind: "social", label: "Social Link: Fool Rang 6 (Story)" },
      { kind: "stat", label: "Dorm-PC: Veggie Blog Note (schaltet Golden Tomato Sprouts frei)" },
    ]},
  ]},
  { date: "3", spoiler: true, slots: [
    { slot: "Dark Hour", items: [{ kind: "boss", label: "Story: letzter Arkana-Boss (Hanged Man) + Strega", answer:
      "Zwei Wellen. Dazwischen darfst du ausruhen, speichern und die Party neu waehlen.\n\nWELLE 1 - STREGA (Jin & Takaya): keine Elementarschwaechen. Takaya spiegelt Light und absorbiert Dark, Jin spiegelt Fire und Dark. Koromaru und Ken daher besser draussen lassen. Mit Buffs/Debuffs + Theurgy arbeiten.\n\nWELLE 2 - HANGED MAN (Moonlight Bridge): keine Schwaeche. Nullt Fire, SPIEGELT Dark, resistiert Strike -> kein Fire, kein Dark, moeglichst kein Strike.\nPhase 1: drei Statuen zuerst. Jede hat je eine physische UND eine magische Schwaeche und resistiert alles andere - Fuukas Scan nutzen. Achtung: eine All-Out Attack laesst sie bei 1 HP stehen, Megido-Skills raeumen sie komplett. Der Boss beschwoert sie mehrfach nach, die Schwaechen koennen sich aendern.\nPhase 2: Rakunda auf den Boss, Matarukaja/Masukukaja auf die Party, dann Theurgy + staerkste Physisch-/Wind-/Ice-Skills. Grim Transcendence gibt ihm drei Extra-Aktionen -> Dekaja gegen seine Buffs, Debuffs mildern den Schaden.\nPhase 3 (~33% HP): eine grosse Statue, resistent gegen ALLES und mit Almighty-Schaden -> Theurgy oder Break-Skills.\nTeam-Empfehlung: Yukari, Mitsuru, Akihiko (oder Aigis)." }]},
  ]},
  { date: "4", spoiler: true, slots: [
    { slot: "Frueher Morgen", items: [{ kind: "social", label: "Social Link: Death Rang 10 (MAX)" }]},
    { slot: "Nach der Schule", items: [{ kind: "cutscene", label: "Keine Aktivitaet moeglich - Klassenzimmer verlassen, zurueck ins Wohnheim" }]},
    { slot: "Abend", items: [{ kind: "cutscene", label: "Story-Event (Fool Rang 7)" }]},
  ]},
  { date: "5", spoiler: true, slots: [
    { slot: "Nach der Schule", items: [{ kind: "cutscene", label: "Story-Event" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "Club Escapade: Ninja Fansite Note kaufen" },
      { kind: "social", label: "Social Link: Tower Rang 4", answer: "P1 -> Yeah, that might look cool" },
    ]},
  ]},
  { date: "6", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Neue Elizabeth-Requests annehmen", answer:
        "82. Retrieve the last old document\n84. Create a Persona with Tempest Slash\n86. Fusion Series #8: Death, Alice\n88. Defeat a Greedy Shadow\n89. Bring me a Rai Kunimitsu\n92. Go clean a restroom\n93. Go water the flowers\n94. Bring me food for a furry friend\n96. I'd like to try Oden Juice" },
      { kind: "prereq", label: "Requests erledigen", answer:
        "1) Port Island Station: Toilette putzen (Treppe hoch, rechts)\n2) 5x Golden Tomato Sprout bei Rafflesia kaufen\n3) Dach von Gekkoukan: Pflanzen neben den Baenken giessen\n4) Friendly Student am Persimonenbaum ansprechen" },
      { kind: "social", label: "Social Link: Temperance Rang 8", answer: "P1 -> He'll definitely agree!" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Koromaru ansprechen" },
      { kind: "shop", label: "Mayoido Antiques: Ausruestung aufwerten", answer:
        "Heute Mikazuki Munechika holen (falls noch nicht geschehen) und die Growth-3-Karte mitnehmen.\nFuer die beste Ausruestung brauchst du spaeter viele Growth 3 (ca. 30) - jetzt schon anfangen lohnt sich." },
      { kind: "prereq", label: "Requests 73, 92, 93, 94 bei Elizabeth abgeben -> schaltet 95 frei; danach Ken ansprechen und 95 abgeben" },
      { kind: "social", label: "Social Link: Tower Rang 5", answer: "P1 -> I have enough\nP2 -> No" },
    ]},
  ]},
  { date: "7", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: The Upanishads", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Junpei 3", stat: "academics" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Mamoru / Star ✦✦✦)" }]},
  ]},
  { date: "8", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Mystery Doll Set (9.800) - KAUFEN" },
      { kind: "shop", label: "Rafflesia: White Flower kaufen" },
      { kind: "prereq", label: "Zeit mit Elizabeth verbringen + Request 81 abgeben" },
      { kind: "social", label: "Social Link: Sun Rang 5", answer: "P1 -> You need to listen to your body" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "White Flower an Junpei geben" },
      { kind: "prereq", label: "Tipp: Siegfried als Persona ausruesten (fuer morgen)" },
      { kind: "stat", label: "Koromaru Gassi gehen (Yuko / Strength ✦✦✦)" },
    ]},
  ]},
  { date: "9", slots: [
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Ryoji 1 (automatisch) - Stats der ausgeruesteten Persona +1" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Ninja Fansite Note (verkuerzt die Ambush-Zeit)" }]},
  ]},
  { date: "10", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Justice Rang 10 (MAX)" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: ernten & Golden Tomato Sprout pflanzen" },
      { kind: "social", label: "Social Link: Devil Rang 5", answer: "P1 -> Whose face?\nP2 -> beliebige Antwort\nP3 -> It's all about the money" },
    ]},
  ]},
  { date: "11", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Lukewarm Taiyaki im Schulladen kaufen" },
      { kind: "social", label: "Social Link: Strength Rang 9", answer:
        "P1 -> beliebige Antwort\nP2 -> An instructor?\nP3 -> beliebige Antwort\nFreundschaft: It's because you're a close friend -> Okay, I will\nBeziehung: It's because I love you -> I love you, Yuko" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Lukewarm Taiyaki in den Kuehlschrank legen" },
      { kind: "link", label: "Link Episode: Ken 3", stat: "charm" },
    ]},
  ]},
  { date: "12", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: Her favourite time in winter", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Ryoji 2 (Siegfried ausruesten empfohlen)" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "5x Dating Site Note vom Suspicious Man kaufen (je einmalig, +2 auf einen Social Link)" },
      { kind: "social", label: "Social Link: Tower Rang 6", answer: "P1 -> You should go home\nP2 -> Do you have any coworkers?" },
    ]},
  ]},
  { date: "13", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 9", answer: "P1 -> Aren't you homesick?" }]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 7", answer: "P1 -> You probably shouldn't" }]},
  ]},
  { date: "14", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Strength Rang 10 (MAX)" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Kuehlschrank pruefen -> 1x Chilled Taiyaki" },
      { kind: "stat", label: "Koromaru Gassi gehen (Chihiro ✦✦✦)" },
    ]},
  ]},
  { date: "15", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Bodybuilder's Support Set (39.800) - KAUFEN (Sid's Jacket + 8x Mega Protein)" },
      { kind: "social", label: "Social Link: Sun Rang 6", answer: "P1 -> Sounds fine to me\nP2 -> It sounds interesting" },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Tower Rang 8", answer:
      "P1 -> Dad?\nP2 -> None of your business\nP3 -> beliebige Antwort\nP4 -> Are you running away?" }]},
  ]},
  { date: "16", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 8", answer: "P1 -> All right\nP2 -> beliebige Antwort" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "Sid's Jacket an Akihiko + Champion Gloves durch Kaiser Knuckles/Rapid Bands ersetzen" },
      { kind: "stat", label: "Dorm-PC: Dating Site Note -> Fuuka (Social Link +2)" },
    ]},
  ]},
  { date: "17", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Story-Event (Klassenfahrt beginnt)" }]},
    { slot: "Abend", items: [
      { kind: "shop", label: "EINMALIGE Gelegenheit: Souvenir beim 6HARA-Verkaeufer + Getraenke aus dem Automaten (2. Etage) kaufen" },
      { kind: "prereq", label: "Alle drei Etagen ablaufen, Leute ansprechen, dann aufs Zimmer" },
    ]},
  ]},
  { date: "18", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Story-Event" }]},
    { slot: "Abend", items: [{ kind: "prereq", label: "Ryoji fuer morgen zusagen (Siegfried ausruesten empfohlen), dann aufs Zimmer" }]},
  ]},
  { date: "19", slots: [
    { slot: "Tag", items: [{ kind: "link", label: "Link Episode: Ryoji 3 - Stats der ausgeruesteten Persona +1" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Umsehen, dann Junpei ansprechen, dann aufs Zimmer" },
      { kind: "quiz", label: "Heisse Quellen: unbemerkt entkommen", answer:
        "P1 -> We'll hide in the steam\nP2 -> Use the duck as a red herring\nP3 -> Just follow my lead" },
    ]},
  ]},
  { date: "20", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Story-Event" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Souvenir an Ken geben" },
      { kind: "stat", label: "Koromaru Gassi gehen (Ken kommt mit)" },
    ]},
  ]},
  { date: "21", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Friendly Student am Persimonenbaum ansprechen, Getraenk fuer 5.000 Yen kaufen, Request 96 abgeben" },
      { kind: "social", label: "Social Link: Empress Rang 1 (Mitsuru, Flur vor dem Lehrerzimmer)" },
    ]},
    { slot: "Abend", items: [{ kind: "social", label: "Social Link: Devil Rang 6", answer: "P1 -> Sounds fun" }]},
  ]},
  { date: "22", spoiler: true, slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Enticing Jewelry Set (49.800) - nur bei Restgeld" },
      { kind: "social", label: "Social Link: Sun Rang 7", answer: "P1 -> It sounds really depressing" },
    ]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: neues Video" },
      { kind: "stat", label: "Kaffee mit Ken" },
    ]},
    { slot: "Dark Hour", items: [{ kind: "boss", label: "Story: Boss-Kampf", answer:
      "Details bewusst offen gelassen - dieser Kampf haengt eng an einer Story-Wendung.\nSag Bescheid, wenn du Schwaechen & Strategie willst, dann liefere ich sie separat nach." }]},
  ]},
  { date: "23", slots: [
    { slot: "Tag", items: [
      { kind: "prereq", label: "Velvet Room: Hecatoncheires summonen" },
      { kind: "social", label: "Social Link: Moon Rang 7", answer: "P1 -> The world is ending?\nP2 -> beliebige Antwort" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Dating Site Note -> Girl at the Shrine (Social Link +2)" }]},
  ]},
  { date: "24", slots: [
    { slot: "Berufspraktikum (24.-26. November)", items: [{ kind: "cutscene", label: "Career Experience Week - keine Aktivitaeten am Nachmittag moeglich" }]},
  ]},
  { date: "27", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Career Experience (letzter Tag)" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: ernten & Golden Tomato Sprout pflanzen" },
      { kind: "prereq", label: "Request 94 (Frist 30.11.): Koromaru ansprechen -> Dog Food; Belohnung: Bone" },
      { kind: "social", label: "Social Link: Tower Rang 9", answer: "P1 -> Why not take a break\nP2 -> Time to retire?\nP3 -> What's this about?" },
    ]},
  ]},
  { date: "28", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 2", answer: "P1 -> Is this your first time?" }]},
    { slot: "Abend", items: [
      { kind: "social", label: "Social Link: Fool Rang 9 (Story)" },
      { kind: "social", label: "Social Link: Devil Rang 7", answer: "P1 -> Sort of...\nP2 -> The organic one" },
      { kind: "tartarus", label: "Tartarus (Harabah) - optional, Zweitquelle", answer:
        "Laut samurai-gamers alternativ heute Abend: Rarity Fortune holen, dann Tartarus bis Etage 198, Monad-Passage erreichen und Truhe auf 197 oeffnen, 100.000+ Yen sammeln, 2 Vermisste retten.\n⚠ Nicht durch game8 gegengeprueft - Reihenfolge kann je nach Route abweichen." },
    ]},
  ]},
  { date: "29", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Become-a-Spy Set (39.800) - KAUFEN (Shoes of Bane fuer den Geheimboss)" },
      { kind: "shop", label: "Polizeistation: Materialien verkaufen + Rette-Belohnungen abholen" },
      { kind: "social", label: "Social Link: Sun Rang 8", answer: "P1 -> Take as long as you need\nP2 -> Why did you stop?" },
    ]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Request 95 (Frist 30.11.): Ken ansprechen -> Featherman R Action Figure; Belohnung: Sacrificial Idol" },
      { kind: "stat", label: "Kaffee mit Ken -> Charakteristik \"Spirit Restore\" (10 SP pro Runde)" },
    ]},
  ]},
  { date: "30", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: The cherry blossom", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Priestess Rang 8", answer: "P1 -> I believe in myself\nP2 -> Not at all" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Part-Time Master (mehr Yen bei Nebenjobs)" }]},
  ]},
];

const NOV_BUDGET = {
  "8": { total: "9.800", items: [["Mystery Doll Set (Tanaka)", "9.800"], ["White Flower (Rafflesia)", "wenige 100"]] },
  "12": { total: "~", approx: true, items: [["5x Dating Site Note", "~"]],
    income: "Je Note einmalig nutzbar, gibt +2 auf einen gewaehlten Social Link." },
  "15": { total: "39.800", items: [["Bodybuilder's Support Set", "39.800"]] },
  "21": { total: "5.000", items: [["Getraenk fuer Request 96", "5.000"]] },
  "22": { total: "49.800", approx: true, items: [["Enticing Jewelry Set (optional)", "49.800"]] },
  "28": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Optionaler Tartarus-Lauf (Zweitquelle): Etage 198, 100.000+ Yen, 2 Vermisste. Auszahlung am 29." },
  "29": { total: "39.800", items: [["Become-a-Spy Set", "39.800"]],
    income: "Einnahmetag: Materialien verkaufen + Rette-Belohnungen." },
};

const NOV_TIPS = [
  "3. November: letzter Arkana-Boss, davor noch Strega. Zwischen den beiden Wellen darfst du speichern und die Party neu waehlen - nutze das.",
  "Kein Fire, kein Dark gegen den Hanged Man (nullt bzw. spiegelt beides), Strike wird resistiert. Gegen Strega Koromaru & Ken draussen lassen.",
  "17.-20. November ist die Klassenfahrt: Souvenir und Automaten-Getraenke sind eine EINMALIGE Kaufgelegenheit (u. a. fuer Request 96).",
  "24.-27. ist Berufspraktikum - nachmittags laeuft nichts. Plane Social Links davor und danach.",
  "Dating Site Notes (ab 12.11. beim Suspicious Man) sind Joker: je +2 auf einen Social Link deiner Wahl - gut, um Rueckstaende aufzuholen.",
  "Fristen 30.11.: Request 94 (Dog Food von Koromaru) und Request 95 (Featherman-Figur von Ken).",
  "Quelle: game8s November-Seite war beim Erstellen nicht erreichbar - dieser Monat stammt aus GameFAQs (Volltext-Dialoge), gegengeprueft mit samurai-gamers. Wenn dir etwas auffaellt, sag Bescheid.",
];

// ───────────────────────────── DEZEMBER ─────────────────────────────
// Daten: game8 (1.-31.). VARIANTE 3: spoiler:true markiert.
// Arkana fuer Dezember: Empress, Emperor, Temperance, Star, Sun.
const DEC_DAYS = [
  { date: "1", slots: [
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Ryoji 3" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Yukari 3 -> Charakteristik \"Healing Apex\"", stat: "charm" }]},
  ]},
  { date: "2", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 3", answer:
      "P1 -> Why not give it a try?\nP2 -> Are you happy?\nP3 -> Maybe you're anxious.\nP4 -> I heard nothing." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Junpei pflegen" }]},
  ]},
  { date: "3", slots: [
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Dating Site Note -> Bunkichi & Mitsuko (Hierophant ✦✦)" }]},
  ]},
  { date: "4", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "prereq", label: "Request 97 annehmen -> Eccentric Man im Iwatodai Strip Mall ansprechen (Santa Hat & Christmas Present)" },
      { kind: "social", label: "Social Link: Empress Rang 4", answer: "P1 -> Did something happen?\nP2 -> It's all for love." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Koromaru buersten 2" }]},
  ]},
  { date: "5", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 5", answer:
      "P1 -> Glad you enjoyed it.\nP2 -> A motorcycle?\nP3 -> Let's go for a ride." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Golden Tomatoes ernten & neu pflanzen" },
      { kind: "stat", label: "Dorm-PC: Dating Site Note -> Nozomi (Moon ✦✦)" },
    ]},
  ]},
  { date: "6", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Hogyoku Apple Set (optional)" },
      { kind: "social", label: "Social Link: Sun Rang 10 (MAX)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Koromaru buersten 3 -> Charakteristik \"Auto Masukunda\"" }]},
  ]},
  { date: "7", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: The ozone layer", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 6", answer:
      "P1 -> Need some help?\nP2 -> I didn't know...\nP3 -> I'll do something about it." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Muscle Boot Camp", stat: "courage" }]},
  ]},
  { date: "8", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 7", answer: "P1 -> I don't mind at all." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Justice ✦✦✦)" }]},
  ]},
  { date: "9", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: Kido", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 8", answer:
      "P1 -> Vent all you want.\nP2 -> That's up to you. (Romance-Flag)\nP3 -> I'll do something about it.\nP4 -> Don't insult her father!\nP5 -> Don't give in." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Gruppenlernen mit Koromaru & Ken (optional)", stat: "academics" }]},
  ]},
  { date: "10", slots: [
    { slot: "Morgen", items: [{ kind: "cutscene", label: "Elizabeth: Tartarus wurde erweitert" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 9", answer:
      "P1 -> It made me happy.\nP2 -> I love you too. (Beziehung beginnt)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Part-time Master" }]},
  ]},
  { date: "11", slots: [
    { slot: "Tag", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: Lives", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Empress Rang 10 (MAX)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Gruppenlernen mit Akihiko & Mitsuru (optional)", stat: "academics" }]},
  ]},
  { date: "12", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Hierophant Rang 10 (MAX)", answer: "P1 -> But... why?" }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Akihiko 4 (Iwatodai Station)" }]},
  ]},
  { date: "13", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Victory Headband Set (optional)" },
      { kind: "social", label: "Social Link: Star Rang 10 (MAX)", answer: "P1 -> You're leaving today?" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Gruppenlernen mit allen (optional)", stat: "academics" }]},
  ]},
  { date: "14", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: The number zero" }]}]},
  { date: "15", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Maltose" }]}]},
  { date: "16", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Venus" }]}]},
  { date: "17", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Murasaki-no-Ue" }]}]},
  { date: "18", slots: [{ slot: "Ganzer Tag", items: [{ kind: "exam", label: "Pruefung", answer: "Antwort: Geeses" }]}]},
  { date: "19", slots: [
    { slot: "Morgen", items: [{ kind: "exam", label: "Pruefungen: letzter Tag" }]},
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Junpei 4 (Klassenzimmer)", stat: "courage" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Koromaru Gassi gehen (Magician ✦✦)" }]},
  ]},
  { date: "20", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Pink Duffle Coat Set (optional)" },
      { kind: "prereq", label: "Gardening: Golden Tomatoes ernten & neu pflanzen" },
      { kind: "social", label: "Social Link: Moon Rang 10 (MAX)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Sengoku Chronicles" }]},
  ]},
  { date: "21", slots: [
    { slot: "Tag", items: [
      { kind: "stat", label: "Pruefungsergebnisse: Bester im Jahrgang", stat: "charm" },
      { kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" },
    ]},
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Pruefungsbelohnung: Mitsuru -> Master Incenses & Phoenix Charm" },
      { kind: "social", label: "Social Link: Priestess Rang 10 (MAX)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Roman mit Mitsuru lesen 3 -> Charakteristik \"Ailment Burst\"" }]},
  ]},
  { date: "22", slots: [
    { slot: "Morgen", items: [
      { kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" },
      { kind: "quiz", label: "Unterricht", answer: "Antwort: Euphoria", stat: "charm" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 8", answer: "P1 -> He'll definitely agree!" }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Ken 4 (Dorm 4. Etage)" }]},
  ]},
  { date: "23", slots: [
    { slot: "Tag", items: [{ kind: "prereq", label: "Fortune fuer Bebe ziehen (Temperance ✦✦)" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Rarity Fortune vom Wahrsager (Club Escapade) holen" },
      { kind: "tartarus", label: "Tartarus (Harabah)", answer:
        "1) Vermisste auf Etage 209 & 221 retten\n2) 100.000+ Yen & Level 74+\n3) Etage 226 erreichen\n4) Monad-Passage-Bosse auf 225 (optional)\n5) Emperor-, Temperance-, Fortune- und Aeon-Persona dabeihaben" },
    ]},
  ]},
  { date: "24", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "cutscene", label: "Heiligabend: Date mit deiner Partnerin (ablehnbar - dann stattdessen Fortune-Social-Link)" }]},
  ]},
  { date: "25", slots: [
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Polizeistation: Materialien verkaufen + Rette-Belohnungen" },
      { kind: "social", label: "Social Link: Chariot Rang 10 (MAX)" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Ken 2", stat: "courage" }]},
  ]},
  { date: "26", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Lovers Rang 10 (MAX)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Akihiko 2" }]},
  ]},
  { date: "27", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Tanaka: Ruby Set (optional)" },
      { kind: "stat", label: "Nebenjob: Screenshot" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Kaffee mit Ken 3 -> Charakteristik \"Spirit Refresh\"" }]},
  ]},
  { date: "28", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Nebenjob: Be Blue V" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Tee mit Mitsuru 2" }]},
  ]},
  { date: "29", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Nebenjob: Screenshot" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Nebenjob: Chagall Cafe" }]},
  ]},
  { date: "30", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Nebenjob: Screenshot" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Nebenjob: Chagall Cafe" }]},
  ]},
  { date: "31", spoiler: true, slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Nebenjob: Screenshot" }]},
    { slot: "Abend", items: [
      { kind: "boss", label: "Story-Entscheidung: bestimmt, welches Ende du bekommst", answer:
        "⚠ Diese Entscheidung legt den Ausgang des Spiels fest.\n\nGutes Ende: die Person verschonen und alles so lassen, wie es ist.\nSchlechtes Ende: die Person toeten und alles vergessen.\n\nFuer den regulaeren Weg (Januar + wahres Ende) waehlst du die erste Variante." },
      { kind: "link", label: "Link Episode: Ryoji 4" },
      { kind: "social", label: "Social Link: Fool Rang 10 (MAX) + Judgement Rang 1" },
    ]},
  ]},
];

const DEC_BUDGET = {
  "23": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Tartarus-Lauf (Harabah): Etage 226, Level 74+, Vermisste auf 209/221. Auszahlung am 25." },
  "25": { total: "0", items: [["—", "—"]], income: "Einnahmetag: Materialien verkaufen + Rette-Belohnungen." },
  "27": { total: "0", items: [["—", "—"]], income: "Ab hier Nebenjobs: Screenshot, Be Blue V, Chagall Cafe (27.-31.)." },
};

const DEC_TIPS = [
  "Arkana fuer Dezember: Empress, Emperor, Temperance, Star, Sun. Empress laeuft vom 2. bis 11. praktisch taeglich auf Rang 10 durch.",
  "Almighty-Skill mitbringen: die Miracle Hand im Dezember-Tartarus absorbiert ALLE Angriffe - nur Almighty (z. B. Megidola) wirkt. Alice und Loki lernen so etwas von selbst; alternativ Koromaru mit Virus Breath.",
  "Greedy Hand fuer eine Request: Fuukas Tartarus Search garantiert den Kampf, wenn du einer begegnest - ihre SP also oben halten.",
  "Loki auf Level 75 fuer eine Request: Loki kommt beim Fusionieren maximal auf 73. Trick: Daisoujou mit einer Justice-Persona fusionieren, damit Loki Growth 3 erbt und schnell nachlevelt.",
  "Sechs Social Links erreichen im Dezember Rang 10: Sun (6.), Empress (11.), Hierophant (12.), Star (13.), Moon (20.), Priestess (21.), dazu Chariot (25.) und Lovers (26.).",
  "27.-31. sind reine Nebenjob-Tage - gute Gelegenheit, Geld und offene Stats nachzuholen.",
];

// ───────────────────────────── JANUAR ─────────────────────────────
// Daten: game8 (1.-31. + Epilog). VARIANTE 3: spoiler:true markiert.
// Arkana fuer Januar: Emperor, Fortune, Temperance, Aeon.
const JAN_DAYS = [
  { date: "1", slots: [
    { slot: "Tag", items: [{ kind: "cutscene", label: "Schrein-Neujahrsfest: mit allen reden, dann Mitsuru ansprechen zum Gehen" }]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Elizabeth: Tartarus wurde erweitert + neue Requests" },
      { kind: "shop", label: "Club Escapade: Believer's Blog Note vom Suspicious Man kaufen" },
      { kind: "stat", label: "Dorm: DVD mit Ken 3 -> Charakteristik \"Spirit Restore\"" },
    ]},
  ]},
  { date: "2", slots: [
    { slot: "Tag", items: [
      { kind: "shop", label: "Rafflesia: Simple Herb Sprout kaufen" },
      { kind: "stat", label: "Nebenjob: Screenshot" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: DVD mit Akihiko 3 -> Charakteristik \"Buff Amp\"" }]},
  ]},
  { date: "3", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Dorm-PC: Believer's Blog Note" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Sage Brain Training" }]},
  ]},
  { date: "4", slots: [
    { slot: "Tag", items: [{ kind: "social", label: "Keisukes Einladung annehmen (Fortune ✦✦✦)", answer: "P1 -> Okay, Brother." }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Gardening: Golden Tomatoes ernten & Simple Herb Sprout pflanzen" },
      { kind: "cutscene", label: "Command Room: neue Videos" },
      { kind: "stat", label: "Dorm: Tee mit Mitsuru 3 -> Charakteristik \"Ailment Surge\"" },
    ]},
  ]},
  { date: "5", slots: [
    { slot: "Morgen", items: [{ kind: "prereq", label: "Bebes Einladung NICHT annehmen" }]},
    { slot: "Tag", items: [{ kind: "link", label: "Link Episode: Koromaru (Abschluss)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm-PC: Pickup Line Master" }]},
  ]},
  { date: "6", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Arcade: Edgar's House of Fortune (+Magie)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Edgar's House of Fortune (+Magie)" }]},
  ]},
  { date: "7", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Arcade: Punch Boxer (+Staerke)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Koromaru mit Aigis Gassi gehen" }]},
  ]},
  { date: "8", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: The underworld.", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Emperor Rang 9", answer: "P1 -> Don't blame yourself." }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Akihiko (Abschluss)" }]},
  ]},
  { date: "9", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 1" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Aigis pflegen" }]},
  ]},
  { date: "10", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Arcade: beliebiges Spiel" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Aigis pflegen 2" }]},
  ]},
  { date: "11", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Arcade: Punch Boxer (+Staerke)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Punch Boxer (+Staerke)" }]},
  ]},
  { date: "12", slots: [
    { slot: "Tag", items: [{ kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 9", answer: "P1 -> You can't go!" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Real Wheel Racer (+Beweglichkeit)" }]},
  ]},
  { date: "13", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 9", answer: "P1 -> Aren't you homesick?" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Yakuza-Roman mit Aigis lesen", stat: "charm" }]},
  ]},
  { date: "14", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Fortune Rang 10 (MAX)" }]},
    { slot: "Abend", items: [{ kind: "prereq", label: "Club Escapade: Suspicious Man ansprechen, dann Messiah aufsuchen" }]},
  ]},
  { date: "15", slots: [
    { slot: "Tag", items: [
      { kind: "cutscene", label: "Elizabeth: Vermisste in Tartarus" },
      { kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" },
    ]},
    { slot: "Nach der Schule", items: [{ kind: "link", label: "Link Episode: Junpei (Abschluss)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Real Wheel Racer (+Beweglichkeit)" }]},
  ]},
  { date: "16", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 2", answer: "P1 -> I like it." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Junpei pflegen 2" }]},
  ]},
  { date: "17", slots: [
    { slot: "Tag", items: [
      { kind: "prereq", label: "Gardening: Kraeuter ernten & erneut Simple Herb Sprout pflanzen" },
      { kind: "stat", label: "Arcade: beliebiges Spiel" },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Aigis pflegen 3 -> Charakteristik \"Phys Amp\"" }]},
  ]},
  { date: "18", slots: [
    { slot: "Morgen", items: [{ kind: "quiz", label: "Unterricht", answer: "Antwort: Circe", stat: "charm" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 3", answer: "P1 -> That's not true." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Baseball-Manga mit Junpei lesen 3 -> Charakteristik \"Critical Boost\"" }]},
  ]},
  { date: "19", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 4", answer: "P1 -> All right." }]},
    { slot: "Abend", items: [{ kind: "link", label: "Link Episode: Ken (Abschluss)" }]},
  ]},
  { date: "20", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 5", answer: "P1 -> You might be right." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Edgar's House of Fortune (+Magie)" }]},
  ]},
  { date: "21", slots: [
    { slot: "Nach der Schule", items: [{ kind: "cutscene", label: "Event - nur wenn du Junpei im November die White Flowers gegeben hast" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Punch Boxer (+Staerke)" }]},
  ]},
  { date: "22", slots: [
    { slot: "Tag", items: [{ kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 6", answer: "P1 -> He thought I was your boyfriend." }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Arcade: Real Wheel Racer (+Beweglichkeit)" }]},
  ]},
  { date: "23", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 7" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Garten mit Junpei pflegen 3 -> Charakteristik \"Critical Amp\"" }]},
  ]},
  { date: "24", slots: [
    { slot: "Tag", items: [{ kind: "stat", label: "Arcade: beliebiges Spiel" }]},
    { slot: "Abend", items: [
      { kind: "prereq", label: "Rarity Fortune vom Wahrsager (Club Escapade) holen" },
      { kind: "tartarus", label: "Tartarus (Adamah) - letzter grosser Lauf", answer:
        "1) Vermisste auf Etage 232 & 250 retten\n2) 100.000+ Yen & Level 80+\n3) Etage 256 erreichen\n4) Monad-Passage-Bosse auf 255 (optional)\n5) Aeon-Persona dabeihaben\n6) Reaper besiegen (optional)" },
    ]},
  ]},
  { date: "25", slots: [
    { slot: "Tag", items: [{ kind: "class", label: "Afternoon Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [
      { kind: "shop", label: "Polizeistation: alle Materialien verkaufen + Rette-Belohnungen abholen" },
      { kind: "social", label: "Social Link: Emperor Rang 10 (MAX)", answer: "P1 -> Not too shabby." },
    ]},
    { slot: "Abend", items: [{ kind: "stat", label: "Frei: fehlende Dorm-Aktivitaeten nachholen oder Arcade" }]},
  ]},
  { date: "26", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 8", answer: "P1 -> I'm doing it now.\nP2 -> It's love. (Romance-Flag)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Frei: fehlende Dorm-Aktivitaeten oder Arcade" }]},
  ]},
  { date: "27", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Temperance Rang 10 (MAX)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Frei: fehlende Dorm-Aktivitaeten oder Arcade" }]},
  ]},
  { date: "28", slots: [
    { slot: "Morgen", items: [{ kind: "class", label: "Morning Class: wach bleiben", stat: "academics" }]},
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 9", answer: "P1 -> You're right.\nP2 -> I love you, too. (Beziehung beginnt)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Frei: fehlende Dorm-Aktivitaeten oder Arcade" }]},
  ]},
  { date: "29", slots: [
    { slot: "Nach der Schule", items: [{ kind: "social", label: "Social Link: Aeon Rang 10 (MAX)" }]},
    { slot: "Abend", items: [{ kind: "stat", label: "Dorm: Koromaru mit allen Gassi gehen" }]},
  ]},
  { date: "30", slots: [
    { slot: "Nach der Schule", items: [{ kind: "prereq", label: "LETZTER Tag fuer alles Offene aus dem Walkthrough" }]},
    { slot: "Abend", items: [
      { kind: "cutscene", label: "Command Room: neue Videos" },
      { kind: "prereq", label: "Gardening: Kraeuter ernten & eine letzte Pflanze setzen" },
      { kind: "tartarus", label: "Offene Requests heute in Tartarus abschliessen" },
      { kind: "prereq", label: "Koromaru fertig buersten, falls noch offen" },
      { kind: "boss", label: "Geheimboss: Ultimate Adversary (nur wenn ALLE Requests erledigt sind)", answer:
        "Optionaler Superboss - nur verfuegbar, wenn saemtliche Elizabeth-Requests abgeschlossen sind.\nSag Bescheid, wenn du dazu Schwaechen & Strategie willst, dann liefere ich sie separat." },
    ]},
  ]},
  { date: "31", spoiler: true, slots: [
    { slot: "Tag", items: [{ kind: "shop", label: "Letzte Gelegenheit: Ausruestung aufwerten und Verbrauchsgueter kaufen" }]},
    { slot: "Dark Hour", items: [{ kind: "boss", label: "Story: finaler Boss-Kampf", answer:
      "Der Gegner wird nacheinander in mehreren Arkana-Formen bekaempft - es ist EIN durchgehender Kampf.\n\nAblauf: Mit jeder besiegten Arkana wird er staerker; sein Skillset wechselt mit der aktiven Arkana. Beispiel Hanged Man: zusaetzliche Zuege mit physischen Skills sowie Concentrate + Megidolaon bzw. Charge + Sweep.\nDie HP je Stufe sind nicht extrem hoch, aber fast alle Angriffe machen schweren Schaden, seine Crit-Rate ist ordentlich, und sobald er eure Schwaechen kennt, zielt er gezielt darauf.\n\nGrundregeln: Schwaechen der Party per Ausruestung/Resist-Skillkarten abdecken, Buffs & Debuffs dauerhaft halten, Theurgy fuer die spaeteren Formen aufsparen, immer genug Heilung und SP-Items dabeihaben. Je schneller du Schaden machst, desto kuerzer der Kampf.\n\n(Details je Arkana kann ich dir separat nachliefern - sag einfach Bescheid.)" }]},
  ]},
  { date: "4.3.", spoiler: true, slots: [
    { slot: "Epilog", items: [
      { kind: "social", label: "Alle Social-Link-Enden ansehen" },
      { kind: "cutscene", label: "Epilog: Yukari ansprechen, dann das Foto anschauen" },
      { kind: "prereq", label: "Gardening: die letzte Pflanze ernten" },
    ]},
  ]},
];

const JAN_BUDGET = {
  "2": { total: "0", items: [["—", "—"]], income: "Einnahmetag: Nebenjob Screenshot." },
  "24": { total: "Ziel: 100.000+", approx: true, items: [["—", "—"]],
    income: "Letzter grosser Tartarus-Lauf: Etage 256, Level 80+, Vermisste auf 232/250. Auszahlung am 25." },
  "25": { total: "0", items: [["—", "—"]], income: "Einnahmetag: alle Materialien verkaufen + Rette-Belohnungen." },
  "31": { total: "offen", approx: true, items: [["Ausruestung & Verbrauchsgueter", "Rest ausgeben"]],
    income: "Letzte Einkaufsgelegenheit - Geld hat danach keinen Nutzen mehr." },
};

const JAN_TIPS = [
  "Arkana fuer Januar: Emperor, Fortune, Temperance und AEON. Aeon (Aigis) ist Pflicht - eine Aeon-Persona ist kein Extra mehr, sondern noetig.",
  "Aeon laeuft vom 9. bis 29. fast durchgehend (Rang 1-10) - der wichtigste Link des Monats. Antworten sind alle hinterlegt.",
  "Resist-Skillkarten gibt es jetzt bei Mayoido Antiques: damit die Schwaechen deiner Personas abdecken - fuer den Endkampf sehr wertvoll.",
  "Growth 3 weiter kopieren: fuer die beste Endausruestung brauchst du im Monatsverlauf rund 30 Stueck.",
  "Am 30. ist der letzte Tag fuer alles Offene. Wer alle Elizabeth-Requests fertig hat, kann den Geheimboss angehen.",
  "Am 31. ist Geld nutzlos - vorher alles in Ausruestung und Verbrauchsgueter stecken.",
  "Der Epilog-Eintrag (4. März) schliesst den Kalender ab: Social-Link-Enden, Yukari ansprechen, letzte Ernte.",
];

// ── Monats-Container ──
const MONTHS = {
  Apr: { label: "April", mon: "APR", days: DAYS, budget: BUDGET, tips: TIPS },
  Mai: { label: "Mai", mon: "MAI", days: MAY_DAYS, budget: MAY_BUDGET, tips: MAY_TIPS },
  Jun: { label: "Juni", mon: "JUN", days: JUNE_DAYS, budget: JUNE_BUDGET, tips: JUNE_TIPS },
  Jul: { label: "Juli", mon: "JUL", days: JULY_DAYS, budget: JULY_BUDGET, tips: JULY_TIPS },
  Aug: { label: "August", mon: "AUG", days: AUGUST_DAYS, budget: AUGUST_BUDGET, tips: AUGUST_TIPS },
  Sep: { label: "September", mon: "SEP", days: SEPT_DAYS, budget: SEPT_BUDGET, tips: SEPT_TIPS },
  Okt: { label: "Oktober", mon: "OKT", days: OCT_DAYS, budget: OCT_BUDGET, tips: OCT_TIPS },
  Nov: { label: "November", mon: "NOV", days: NOV_DAYS, budget: NOV_BUDGET, tips: NOV_TIPS },
  Dez: { label: "Dezember", mon: "DEZ", days: DEC_DAYS, budget: DEC_BUDGET, tips: DEC_TIPS },
  Jan: { label: "Januar", mon: "JAN", days: JAN_DAYS, budget: JAN_BUDGET, tips: JAN_TIPS },
};
const MONTH_KEYS = ["Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan"];

// ───────────────────────────── TARTARUS ─────────────────────────────
const ELEM = {
  Fire: "#ff6b3f", Ice: "#43c6ff", Elec: "#ffd23f", Wind: "#7df9a8",
  Light: "#fff0a0", Dark: "#b98cff", Curse: "#9a6cff",
  Slash: "#c9d2e6", Strike: "#c9d2e6", Pierce: "#c9d2e6", "—": "#5d6b92",
};

const ARQA_COMMON = [
  ["Heat Balance", ["Elec", "Wind"]], ["Laughing Table", ["Elec", "Wind"]], ["Grieving Tiara", ["Fire"]],
  ["Black Raven", ["Light"]], ["Spurious Book", ["Elec"]], ["Corrupt Tower", ["Elec"]],
  ["Phantom Mage", ["Light"]], ["Soul Dancer", ["Wind"]], ["Venus Eagle", ["Pierce", "Ice"]],
  ["Vicious Raven", ["Ice"]], ["Sky Balance", ["Fire", "Ice"]], ["Bronze Dice", ["Elec"]],
  ["Haughty Maya", ["Dark"]], ["Steel Gigas", ["Elec"]], ["Maniacal Book", ["Fire"]],
  ["Crying Table", ["Ice"]], ["Dark Eagle", ["Wind", "Light"]], ["Jealous Cupid", ["Ice"]],
  ["Adamant Beetle", ["—"]], ["Phantom Master", ["Light"]], ["Killing Hand", ["Wind"]],
  ["Enslaved Beast", ["Fire"]],
];

const YABBASHAH_COMMON = [
  ["Indolent Maya", ["Strike", "Wind"]], ["Creation Relic", ["Strike", "Pierce"]], ["Killer Twins", ["Light"]],
  ["Lustful Snake", ["Ice"]], ["Ardent Dancer", ["Pierce", "Fire"]], ["Golden Beetle", ["Dark"]],
  ["Mach Wheel", ["Elec"]], ["Devoted Cupid", ["Fire", "Ice"]], ["Silent Book", ["Slash", "Wind"]],
  ["Dogmatic Tower", ["Strike"]], ["Jupiter Eagle", ["Pierce", "Dark"]], ["Avenger Knight", ["Fire", "Light"]],
  ["Justice Sword", ["Dark"]], ["Insidious Maya", ["Ice"]], ["Mind Dice", ["Elec"]],
  ["Furious Gigas", ["Dark"]], ["Wild Drive", ["Elec"]], ["Shouting Tiara", ["Dark"]],
  ["Almighty Hand", ["Wind"]], ["Minotaur IV", ["Ice"]], ["Phantom Lord", ["Fire", "Light"]],
  ["Jotun of Power", ["Pierce"]],
];

const TZIAH_COMMON = [
  ["Blue Sigil", ["Strike"]], ["Ill-Fated Maya", ["Slash", "Fire"]], ["Death Twins", ["Light"]],
  ["Constancy Relic", ["Ice"]], ["Tranquil Idol", ["Pierce", "Wind"]], ["Champion Knight", ["Dark"]],
  ["Writhing Tiara", ["Dark"]], ["Killer Drive", ["Pierce", "Elec"]], ["Elegant Mother", ["Light"]],
  ["Brave Wheel", ["Ice"]], ["Magical Magus", ["Strike"]], ["Arcane Turret", ["Elec"]],
  ["Death Seeker", ["Light"]], ["Growth Relic", ["Strike"]], ["Liberating Idol", ["Elec"]],
  ["Hakurou Musha", ["Light", "Dark"]], ["Flowing Sand", ["Slash", "Strike", "Pierce"]],
  ["Order Giant", ["Ice"]], ["Solid Castle", ["Wind"]], ["Regal Mother", ["Elec"]],
  ["Wondrous Magus", ["Fire"]], ["Conviction Sword", ["Dark"]], ["Minotaur III", ["Elec"]],
  ["Mighty Cyclops", ["—"]],
];

const HARABAH_COMMON = [
  ["Kaiden Musha", ["Wind"]], ["Imprudent Maya", ["Pierce", "Elec"]], ["Crazy Twins", ["Dark"]],
  ["Apostate Tower", ["Fire"]], ["Mighty Beast", ["Light"]], ["Gracious Cupid", ["Strike"]],
  ["Ruinous Idol", ["Wind"]], ["Battle Wheel", ["—"]], ["Immoral Snake", ["Slash", "Pierce"]],
  ["Hell Knight", ["Wind"]], ["Power Castle", ["Ice"]], ["Red Sigil", ["Ice"]],
  ["Desirous Maya", ["Fire"]], ["Angry Table", ["Slash", "Wind"]], ["Fate Seeker", ["Pierce", "Light"]],
  ["Pistil Mother", ["Ice"]], ["Curse Dice", ["Elec"]], ["Judgment Sword", ["Dark"]],
  ["Wrathful Book", ["Fire"]], ["Perpetual Sand", ["Slash", "Strike", "Pierce"]], ["Jotun of Blood", ["Dark"]],
  ["Stasis Giant", ["Wind"]], ["Iron Dice", ["Elec"]], ["Minotaur II", ["Ice"]],
  ["Slaughter Drive", ["Elec"]], ["Prime Magus", ["Fire"]], ["Mad Cyclops", ["Light"]],
];

const ADAMAH_COMMON = [
  ["Bigoted Maya", ["Light"]], ["Amenti Raven", ["Pierce", "Dark"]], ["Royal Dancer", ["Strike", "Wind"]],
  ["Doom Sword", ["Fire", "Dark"]], ["Death Dice", ["Elec"]], ["Carnal Snake", ["Strike", "Ice"]],
  ["Light Balance", ["Fire", "Wind"]], ["Omen Musha", ["Light"]], ["Devious Maya", ["Dark"]],
  ["Infinite Sand", ["Slash", "Strike", "Pierce"]], ["Green Sigil", ["Elec"]], ["Emperor Beetle", ["—"]],
  ["Eternal Eagle", ["Pierce", "Ice"]], ["Death Castle", ["Wind"]], ["Noble Seeker", ["Light"]],
  ["Minotaur I", ["Dark"]], ["Platinum Dice", ["Elec"]], ["Jotun of Evil", ["Slash", "Strike", "Pierce"]],
  ["Fierce Cyclops", ["Slash", "Pierce"]],
];

const TARTARUS = [
  {
    id: "thebel", name: "Thebel", sub: "Block 1 · April",
    floors: "2 – 22F", goal: "Etage 22 (April)", level: "~9–13",
    light: "Die meisten Gegner sind hier physisch oder gegen ein einzelnes Element schwach. Du brauchst zuverlässig Fire (Agi), Wind (Garu) und ab Etage 17 Electric (Zio).",
    common: [
      ["Cowardly Maya", ["Slash", "Fire"]], ["Merciless Maya", ["Ice"]], ["Muttering Tiara", ["Wind"]],
      ["Magic Hand", ["Fire"]], ["Obsessed Cupid", ["Ice"]], ["Trance Twins", ["Elec", "Light"]],
      ["Grave Beetle", ["Wind"]], ["Wealth Hand (Geld)", ["Strike"]],
    ],
    gatekeepers: [
      { floor: "5F", name: "Ruthless Ice Raven ×2", weak: ["Fire"], res: "Resist: Ice, Wind", support: "treten zu zweit auf",
        strat: "Beide mit Agi gleichzeitig downen → All-Out Attack. Sie greifen mit Bufu/Mabufu an; Apsaras (Ice-resistent) als Schutz ausrüsten, zum Angreifen zurück auf Orpheus." },
      { floor: "11F", name: "Barbaric Beast Wheel", weak: ["Wind"], res: "Resist: Fire", support: "+ 2 Magic Hands (Fire)",
        strat: "Erst die Magic Hands mit Fire downen, dann das Wheel mit Garu. Solange das Wheel gestunnt am Boden liegt, kein Garu nachlegen." },
      { floor: "17F", name: "Swift Axle", weak: ["Elec"], res: "Resist: Slash, Strike, Wind", support: "allein",
        strat: "Zio ist Pflicht! Pixie auf Level 4 (lernt Zio) oder eine Zio-Persona fusionieren (z. B. Lilim). Auf 17F schaltet die Große Uhr frei (Vollheilung für 7 Twilight Fragments)." },
    ],
    tips: [
      "Glühende Statuen zerschlagen — geben Loot und respawnen bei jedem Neubetreten.",
      "Vor jedem Gatekeeper speichern (Teleporter auf der Etage nutzen).",
      "Odd Morsel aus einer Truhe sichern — Social-Link-Voraussetzung.",
    ],
  },
  {
    id: "arqa1", name: "Arqa I", sub: "Block 2 · Mai",
    floors: "22 – 43F", goal: "Etage 43 (Mai)", level: "~20",
    light: "Bring eine Persona mit Light (Kouha) mit — viele Arqa-Gegner sind schwach dagegen. Yukaris Wind (Garu) deckt einen großen Teil ab.",
    common: ARQA_COMMON,
    gatekeepers: [
      { floor: "34F", name: "Will-o-Wisp Raven", weak: ["Ice"], res: "Resist: Wind · Drain: Fire (!)", support: "+ 2 Lightning Eagles (Wind)",
        strat: "Raven mit Eis, Eagles mit Wind downen. NIEMALS Fire benutzen — der Raven absorbiert es. Er castet Agilao (Fire), die Eagles Zio." },
      { floor: "35F", name: "Heretic Magus", weak: ["Elec"], res: "Resist: Wind", support: "+ 2 Grievous Tables (Ice, Fire genullt)",
        strat: "Magus mit Elec, Tables mit Ice. Achtung auf die Wind-Angriffe des Magus (gefährlich für Junpei). Kein Speichern zwischen 35F & 36F!" },
      { floor: "36F", name: "Disturbing Dice", weak: [], res: "Resist: Fire · keine Schwäche", support: "+ 2 Slaughter Twins (Elec/Light)",
        strat: "Würfel hat keine Schwäche — per physischem Crit downen versuchen. Twins mit Zio/Light. Der Würfel verteilt Status-Effekte (z. B. Wechsel-Sperre)." },
      { floor: "42F", name: "Clairvoyant Relic", weak: [], res: "Nullt: Light, Dark · keine Schwäche", support: "allein",
        strat: "Härtester Arqa-Kampf. Castet alle 4 Elemente gezielt auf eure Schwächen + Marakunda (-DEF). Tarunda/Sukunda dauerhaft halten, durchgehend heilen. Status (Distress via Akihikos Sonic Punch, oder Poison) hilft enorm." },
    ],
    tips: [
      "Persona ohne Schwäche gegen Fire/Ice/Elec/Wind mitbringen — speziell für Clairvoyant Relic (z. B. Tam Lin Lv 13, Principality Lv 16).",
      "Tarunda & Sukunda sind in diesem Block Gold wert. Akihiko bringt Tarunda auf Level 15 mit.",
      "Vor 42F speichern; bei 34–36F gibt es keine Speicherpause zwischen den Kämpfen.",
    ],
  },
  {
    id: "arqa2", name: "Arqa II", sub: "Block 2 · Juni",
    floors: "43 – 69F", goal: "Etage 69 (Juni)", level: "~26",
    light: "Zweite Arqa-Hälfte, erst nach dem Juni-Vollmond zugänglich. Theurgy ist jetzt verfügbar — für die zähen Gatekeeper aufsparen. Precious Hand ist schwach gegen Curse (Eiha, z. B. Gurulu).",
    common: ARQA_COMMON,
    gatekeepers: [
      { floor: "47F", name: "Servant Tower", weak: ["Dark"], res: "Resist: Ice, Wind · Nullt: Fire, Light · Spiegelt: Elec (!)", support: "+ 2 Enslaved Cupids (Elec)",
        strat: "Nur gegen Dark schwach. Die Cupids sind Elec-schwach — aber der Tower SPIEGELT Elec, also Cupids gezielt einzeln (kein Mazio). Tower sonst physisch/Pierce angehen. Er beschwört Cupids nach." },
      { floor: "54F", name: "Lascivious Lady", weak: [], res: "Nullt ALLE Elemente · keine Schwäche", support: "+ 2 Profligate Gigas (Strike/Wind)",
        strat: "Blockt jeden elementaren Schaden → nur physisch. Castet Stagnant Air (macht euch anfällig für Status) + Charm/Distress. Gigas mit Wind. Idealer Moment für Theurgy." },
      { floor: "60F", name: "Fleetfooted Cavalry", weak: [], res: "Wind HEILT sie · Nullt: Light, Dark · keine Schwäche", support: "allein",
        strat: "Keine Schwäche, hoher HP-Pool (~1400). Niemals Wind (heilt sie), Light/Dark wirkungslos. Reiner Abnutzungskampf: physisch + Buffs/Debuffs, lange durchhalten." },
    ],
    tips: [
      "Auf Etage 54 bis zu 3 Twilight Fragments aufsparen — für Onimaru Kunitsuna (Elizabeth-Request).",
      "Am 27. Juni die Vermissten auf Etage 50/56/64 retten — sonst eine Request unwiederbringlich verpasst.",
      "Theurgy gezielt gegen Lascivious Lady & Fleetfooted Cavalry einsetzen.",
    ],
  },
  {
    id: "yab1", name: "Yabbashah I", sub: "Block 3 · Juli",
    floors: "70 – 89F", goal: "Etage 89 (Juli)", level: "~30",
    light: "Erreichbar nach den Sommerferien (ab 26.7.), freigeschaltet ab 18.7. Vermeide Fire-Verwundbarkeit - der erste Gatekeeper spiegelt Feuer. Hier triffst du die erste Monad-Tuer (staerkere Shadows, dafuer Waffen-/Ruestungs-Bauplaene).",
    common: YABBASHAH_COMMON,
    gatekeepers: [
      { floor: "77F", name: "Ochlocratic Sand ×3", weak: ["Ice"], res: "Resist: Light, Dark · Nullt: Elec, Wind · Spiegelt: Fire (!)", support: "treten zu dritt auf",
        strat: "Mit Eis downen (spammen). NIEMALS Fire - wird gespiegelt. Sie casten Agilao/Maragion (AoE-Fire, Mitsuru-Schwaeche!). Lege deine Fire-Verwundbarkeit ab, nimm Junpei (Fire-resistent) mit. Theurgy laedt schnell und raeumt je einen Sand." },
      { floor: "82F", name: "Arcanist Decapitator", weak: [], res: "Nullt: Ice, Wind · keine Schwaeche", support: "+ Heat Overseer (Elec/Wind) & Sky Overseer (Ice/Fire)",
        strat: "Decapitator hat keine Schwaeche -> Theurgy (Jack Brothers koennen downen). Overseers ueber ihre Schwaechen downen; sie debuffen euch, damit der Decapitator Extra-Schaden macht." },
    ],
    tips: [
      "Grosse Uhr nutzen, um zurueckgebliebene Party-Mitglieder schnell aufzuleveln (groesserer Bonus bei groesserem Level-Abstand).",
      "Erste Monad-Tuer hier: optionaler Bonus-Kampf gegen einen staerkeren Shadow, dafuer Bauplaene fuer Mayoido Antiques.",
      "Persona mit Ice (Bufu-Reihe) ist im ganzen Block Gold wert.",
    ],
  },
  {
    id: "yab2", name: "Yabbashah II", sub: "Block 3 · August",
    floors: "89 – 118F", goal: "Etage 118 (August)", level: "~35",
    light: "Zweite Haelfte - erst nach dem August-Vollmond (Chariot & Justice) zugaenglich. Auf 91F liegt eine Monad-Passage (optionaler 3-Kampf-Bonus). Imposing Skyscraper auf 112F absorbiert Elec - niemals Blitz.",
    common: YABBASHAH_COMMON,
    gatekeepers: [
      { floor: "91F", name: "Controlling & Dependent Partner", weak: ["Pierce"], res: "Dependent: immun gegen Elementar · Controlling: blockt Slash/Strike/Light/Dark, keine Schwaeche", support: "Paar (Monad-Passage-Etage)",
        strat: "Dependent ist Pierce-schwach, ignoriert aber alle Elementar-Skills. Controlling hat keine Schwaeche und blockt Slash/Strike/Light/Dark. Beide heilen; Dependent legt dem Controlling einen Magie-Reflekt-Schild auf. Mit Pierce/Physisch arbeiten und beide gleichzeitig kleinhalten." },
      { floor: "99F", name: "Venomous Magus", weak: ["Elec"], res: "vergiftet die ganze Party", support: "+ Five Fingers of Blight (Dark)",
        strat: "Magus mit Elec downen, die Five Fingers mit Dark. Der Magus vergiftet + trifft alle mit Fire; die Finger debuffen euch und buffen den Magus mit Ice. Vergiftet kein All-Out Attack -> Poison sofort heilen." },
      { floor: "105F", name: "Bloody Maria", weak: [], res: "verteilt Fear · keine klare Schwaeche", support: "+ Executioner's Crown",
        strat: "Fear-resistente/-immune Persona mitbringen (Dark-Immunitaet hilft). Pierce & Fire empfohlen. Gute Mitstreiter: Aigis, Yukari, Junpei." },
      { floor: "112F", name: "Imposing Skyscraper", weak: [], res: "Resist: Pierce, Wind · Absorbiert: Elec (!)", support: "allein",
        strat: "Keine Schwaeche, absorbiert Elec (NIEMALS Blitz). Startet mit Stagnant Air (anfaellig fuer Status), dann Mazionga -> Shock (du kannst nicht kontern). Mit Sukunda die Mazionga-Treffer senken, Marakunda per Dekunda/Marakukaja entfernen, dann beste physische Skills + Theurgy." },
    ],
    tips: [
      "Imposing Skyscraper absorbiert Elec - Blitz-Skills komplett vermeiden.",
      "Monad-Passage auf 91F: optionaler 3-Kampf-Bonus mit guter Beute (Persona ohne Dark-Schwaeche + Ice/Wind mitbringen).",
      "Dekaja/Dekunda bereithalten - viele Gegner hier arbeiten stark mit Buffs/Debuffs.",
    ],
  },
  {
    id: "tziah1", name: "Tziah I", sub: "Block 4 · September",
    floors: "119 – 144F", goal: "Etage 144 (September)", level: "~50",
    light: "Etage 119 erreichst du ab dem 10.9. Zwei neue Mechaniken: Dark Zones (ganze Etage dunkel, Fuuka kann keine Karte geben - dafuer sehen dich die Shadows nicht; alle Relikte dort geben Twilight Fragments) und Greedy Shadows (riesige Treasure Hands, denen du dreimal korrekt folgen musst). 5 Gatekeeper in dieser Haelfte.",
    common: TZIAH_COMMON,
    gatekeepers: [
      { floor: "125F", name: "Heartless Relic + 2× Rampaging Sand", weak: ["Elec", "Strike"], res: "Relic: Resist Light, Dark · Sands: Resist Fire, Ice, Elec, Wind", support: "Relic bufft, die Sands schlagen zu",
        strat: "Relic mit Elec downen, die beiden Sands mit Strike. Die Sands (Neuro Slash, Fatal End) verteilen Status - Confuse & Fear oeffnen dich fuer Selbstschaden, also Me Patra bereithalten. Das Relic selbst kaempft kaum, bufft aber (Marakukaja/Matarukaja) -> Dekaja. Ausser Elec gegen das Relic keine Elementarskills nutzen." },
      { floor: "126F", name: "Raging Turret", weak: ["Wind"], res: "Nullt: Slash", support: "allein (direkt nach 125F)",
        strat: "Direkt eine Etage ueber dem vorigen Kampf - vorher heilen und speichern. Mit Wind downen; Slash ist wirkungslos." },
      { floor: "132F", name: "Terminal Table", weak: [], res: "Nullt: Strike · Absorbiert: Light · keine Schwaeche", support: "allein",
        strat: "Setzt komplett auf Instant-Kills: Hamaon & Mahama, dazu Foul Breath und Masukunda, um dich anfaelliger zu machen. Eine Light-IMMUNE Persona schuetzt dich vollstaendig. Kein Strike, kein Light - alles andere ist erlaubt. Charge/Concentrate + Theurgy verkuerzen den Kampf." },
      { floor: "136F", name: "Jotun of Authority + beide Haende", weak: ["Ice", "Elec", "Fire"], res: "Jotun: Nullt Fire, draint Slash · Rechte Hand: spiegelt Dark, draint Strike · Linke Hand: spiegelt Light, draint Pierce", support: "Purging Right Hand & Subservient Left Hand",
        strat: "Jotun mit Ice, rechte Hand mit Elec, linke Hand mit Fire. Achtung auf die Reflektionen: kein Dark auf die rechte, kein Light auf die linke Hand. Slash/Strike/Pierce werden jeweils absorbiert - physisch also nur sehr gezielt." },
      { floor: "143F", name: "Isolated Castle", weak: [], res: "Nullt ALLE Elemente (Fire, Ice, Elec, Wind, Light, Dark) · keine Schwaeche", support: "allein (vor Monad-Tuer & Treppe)",
        strat: "Elementarmagie ist komplett wirkungslos -> reiner Physisch-Kampf. Beste Slash/Strike/Pierce-Skills, Buffs/Debuffs und Theurgy. Steht kurz vor der Monad-Tuer und der Treppe zur Blockade-Etage." },
    ],
    tips: [
      "Dark Zones lohnen sich: alle zerschlagbaren Relikte dort geben Twilight Fragments - mit aktivem Devil-Arkana besonders ergiebig.",
      "Greedy Shadows: den riesigen Treasure Hands dreimal korrekt folgen (auf die Hinweise der Party hoeren), dann sind sie angreifbar.",
      "MISSABLE: Bunkichi (Hierophant) verschwindet ~12.9. hier drin - bis spaetestens 3.10. retten.",
      "Light-immune Persona fuer Etage 132 einpacken - Terminal Table geht ausschliesslich auf Instant-Kills.",
    ],
  },
  {
    id: "tziah2", name: "Tziah II", sub: "Block 4 · Oktober",
    floors: "145 – 172F", goal: "Etage 172 (Oktober)", level: "~58",
    light: "Zweite Haelfte, erst nach dem Oktober-Vollmond zugaenglich. Dark Zones & Greedy Shadows kommen hier nochmal vor. Golden Hands (145-172F) sind schwach gegen ELECTRICITY - eine Ziodyne-Persona lohnt sich. Auf 171F endet der Block Richtung Adamah.",
    common: TZIAH_COMMON,
    gatekeepers: [
      { floor: "151F", name: "Pagoda of Disaster + 2× Tome of Persecution", weak: ["Strike", "Dark"], res: "Pagoda: draint Elec & Wind · Tomes: drainen Ice", support: "Pagoda mit zwei Tomes",
        strat: "Pagoda mit Strike downen, die Tomes mit Dark. Niemals Elec oder Wind auf die Pagoda (wird absorbiert) und kein Ice auf die Tomes." },
      { floor: "155F", name: "Dancing Beast Wheel", weak: [], res: "Nullt: Ice · Resist: Light · keine Schwaeche", support: "allein",
        strat: "Reiner Physik-Angreifer: bufft sich mit Heat Riser und schlaegt dann mit Blade of Fury / Deathbound zu. Kein Ice, kein Light. Heat Riser mit Dekaja entfernen oder vorab debuffen; eigene Defense hochhalten (Tetracone/Attack Mirror helfen)." },
      { floor: "161F", name: "Demented Knight ×2", weak: ["Wind"], res: "starke Elec- & Dark-Angriffe", support: "treten zu zweit auf",
        strat: "Beide mit Wind downen -> All-Out Attack. Sie buffen ihren Angriff und nutzen Concentrate - danach kommt ein harter Elec-/Dark-Schlag, also rechtzeitig Dekaja oder Guard." },
      { floor: "170F", name: "Cruel Greatsword + 2× Serpent of Absurdity", weak: ["Light", "Ice"], res: "Sword: immun gegen Slash & Dark · Serpents: absorbieren Fire", support: "Status-Spezialisten",
        strat: "Sword mit Light, Serpents mit Ice. Der ganze Kampf dreht sich um Status: Serpents verteilen Charm & Poison und ziehen dir per Spirit Drain SP ab, das Sword verteilt Confuse (Party) und Fear (einzeln). Schwaechen schnell ausnutzen, bevor sie zuschlagen; Status-Heilung mitbringen." },
      { floor: "171F", name: "Invigorated Gigas", weak: [], res: "Resist: Ice · Nullt: Light, Dark · keine Schwaeche", support: "allein (direkt nach 170F, vor Monad & Treppe)",
        strat: "Letzter Tziah-Gatekeeper. Bufft sich mit Heat Riser bzw. Revolution und praegelt dann per Heat Wave; nach einem Crit folgt Gigantic Fist auf das getroffene Mitglied. Angriff & Verteidigung debuffen, HP durchgehend oben halten, geduldig runterarbeiten." },
    ],
    tips: [
      "Golden Hands (145-172F) sind schwach gegen Electricity - game8 schreibt im Oktober-Tipp faelschlich Light; die Kommentare korrigieren das.",
      "170F und 171F kommen direkt hintereinander - vorher voll heilen und SP auffuellen.",
      "MISSABLE: Maiko (Hanged Man) verschwindet ~21.10. - bis 3.11. retten.",
      "Nach der Monad-Tuer auf 171F geht es ueber die letzte Treppe zur Grenz-Etage des naechsten Blocks (Adamah).",
    ],
  },
  {
    id: "hara1", name: "Harabah I", sub: "Block 5 · November",
    floors: "173 – 197F", goal: "Etage 198 (November)", level: "~65",
    light: "Grelle Farben, verwinkelte Gaenge, die staendig zurueckfuehren - hier verlaeuft man sich leicht. Vier Gatekeeper in dieser Haelfte. Fuuka lernt auf Level 64 Tartarus Search: garantiert den Kampf, wenn du einer Greedy Shadow begegnest (wichtig fuer eine Dezember-Request) - ihre SP also oben halten.",
    common: HARABAH_COMMON,
    gatekeepers: [
      { floor: "179F", name: "Cultist of the Storm", weak: ["Dark"], res: "Resist: Fire · Immun: Strike", support: "allein",
        strat: "Mit Dark schnell downen, dann All-Out Attack - der Kampf ist vorbei, bevor er zurueckschlaegt. Er spammt Magarudyne und legt Masukunda nach, sobald jemand am Boden liegt. Junpei (Wind-schwach) zu Hause lassen, Yukari und eine Wind-absorbierende Persona machen den Kampf harmlos. Koromaru liefert das Dark; Dekunda/Masukukaja hebt Masukunda auf." },
      { floor: "184F", name: "Merciless Judge + Executive Greatsword", weak: ["Fire"], res: "Judge: keine Schwaeche, blockt Slash/Strike/Ice, resistiert Elec · Greatsword: schwach gegen Fire", support: "Judge mit Greatsword",
        strat: "Das Greatsword mit Fire downen. Der Judge selbst hat keine Schwaeche und blockt fast alles Physische - hier hilft nur Magie ausserhalb seiner Resistenzen, dazu Buffs/Debuffs und Theurgy." },
      { floor: "188F", name: "Chaos Panzer + 2× Resentful Surveillant", weak: ["Slash"], res: "Panzer: keine Schwaeche, immun Fire & Wind, SPIEGELT Light · Surveillants: schwach Slash, resistieren Elec, immun Dark", support: "Panzer mit zwei Surveillants",
        strat: "Zuerst die Surveillants mit Slash ausschalten - sie sind die eigentliche Gefahr: sie senken deine Verteidigung (Marakunda) und buffen den Panzer (Matarukaja), dazu Agidyne/Eigaon. Der Panzer nimmt den Angriffsbuff, laedt mit Charge auf und trifft alle mit Myriad Arrows; liegt jemand am Boden, folgt Vile Assault. Kein Light auf den Panzer (wird gespiegelt)." },
      { floor: "193F", name: "Necromachinery", weak: [], res: "Nullt: Slash, Elec · SPIEGELT Light · keine Schwaeche", support: "allein (letzter Gatekeeper der ersten Haelfte)",
        strat: "Keine Schwaeche, blockt Slash und Elec und spiegelt Light - also kein Light, kein Elec, kein Slash. Sie greift selbst mit Light- und Almighty-Skills an (Almighty laesst sich nicht blocken). Mit Strike/Pierce, Fire/Ice/Wind, Debuffs und Theurgy arbeiten." },
    ],
    tips: [
      "Fuuka auf Level 64 bringen (Tartarus Search) - macht die Greedy-Shadow-Request planbar.",
      "Wind-absorbierende oder -resistente Persona fuer 179F, Light-freie Strategie fuer 188F und 193F.",
      "Der November-Lauf endet laut Plan auf Etage 198 - danach ist die Monad-Passage auf 197 offen (Truhe nicht vergessen).",
    ],
  },
  {
    id: "hara2", name: "Harabah II", sub: "Block 5 · Dezember",
    floors: "197 – 226F", goal: "Etage 226 (Dezember)", level: "~74",
    light: "Zweite Haelfte mit vier weiteren Gatekeepern. Die Miracle Hand hier ABSORBIERT alle Angriffe - nur Almighty (z. B. Megidola) wirkt; Alice und Loki lernen so etwas von selbst, alternativ Koromaru mit Virus Breath. Nach Minotaur Nulla auf 225F wartet eine letzte Monad-Tuer vor dem Schlussblock Adamah.",
    common: HARABAH_COMMON,
    gatekeepers: [
      { floor: "203F", name: "Icebreaker Lion + Luckless Cupid", weak: ["Fire", "Elec"], res: "Lion: Resist Dark, immun Strike & Ice · Cupid: absorbiert Fire, SPIEGELT Light", support: "Loewe mit Cupid",
        strat: "Lion mit Fire, Cupid mit Elec - beide Schwaechen sind leicht zu treffen, ein paar All-Out Attacks reichen. Aufpassen: kein Fire auf den Cupid (absorbiert), kein Light (spiegelt er). Der Cupid lenkt mit Charm (Marin Karin) ab, waehrend der Lion mit Bufudyne/Mabufudyne und Gigantic Fist zuschlaegt - Charm sofort heilen, sonst schlagen deine eigenen Leute zu. Buffs (Heat Riser) mit Dekaja entfernen." },
      { floor: "212F", name: "Drei Geschwister", weak: ["Ice", "Wind"], res: "Eldest: keine Schwaeche (Dark & Fear) · Middle: schwach Ice (Fire) · Youngest: schwach Wind (Elec)", support: "drei Gegner mit getrennten Plaenen",
        strat: "Sieht schlimmer aus, als es ist - die drei arbeiten NICHT zusammen. Middle mit Ice, Youngest mit Wind downen; der Eldest hat keine Schwaeche, was All-Out Attacks erschwert. Youngest nimmt dir per Elec Break die Blitz-Resistenz und trifft mit Getsu-ei/Ziodyne (Shock-Gefahr), Middle bufft alle und geht auf Crits, Eldest verteilt Fear (Evil Touch/Evil Smile) und nutzt Vorpal Blade. Revolution wirkt in beide Richtungen - auch deine Crit-Rate steigt." },
      { floor: "218F", name: "Scornful Dice", weak: [], res: "DRAINT Slash, Strike und Pierce · keine Schwaeche", support: "allein",
        strat: "Physische Angriffe heilen ihn - hier zaehlt ausschliesslich Magie. Keine Schwaeche, also Buffs/Debuffs, staerkste Elementarskills und Theurgy." },
      { floor: "225F", name: "Minotaur Nulla", weak: [], res: "SPIEGELT Strike · Resist Light · Immun Elec · keine Schwaeche", support: "allein (letzter Harabah-Gatekeeper)",
        strat: "Kein Strike (wird gespiegelt), kein Elec, kein Light. Er schlaegt mit starken Elec- und Physisch-Angriffen zu. Setz auf kraeftige Magie und Theurgy. Trick: mit Freeze einfrieren, dann per Slash downen - das oeffnet eine All-Out Attack." },
    ],
    tips: [
      "Almighty-Skill fuer die Miracle Hand mitbringen (Megidola) - sie absorbiert sonst alles.",
      "218F ist reiner Magie-Kampf: die Scornful Dice heilt sich an allem Physischen.",
      "Nach 225F letzte Monad-Tuer, danach beginnt Adamah - der Schlussblock.",
      "⚠ thegamer zaehlt neun Gatekeeper fuer Harabah; acht davon sind hier dokumentiert. Falls dir unterwegs ein weiterer begegnet, sag Bescheid, dann ergaenze ich ihn.",
    ],
  },
  {
    id: "adamah", name: "Adamah", sub: "Block 6 · Januar",
    floors: "227 – 263F", goal: "Etage 256 (Januar)", level: "~80",
    light: "Der Schlussblock. Etage 227 erreichst du am 1.1. Besonderheit: Der JUDGEMENT-Social-Link steigt hier nicht durch Treffen, sondern indem du die Gatekeeper besiegst - Adamah-Fortschritt ist also direkt Social-Link-Fortschritt. Alle Gatekeeper geben ausserdem sehr viel EXP fuers Endgame-Team.",
    common: ADAMAH_COMMON,
    gatekeepers: [
      { floor: "230F", name: "Obsessive Sand", weak: [], res: "Resistiert ALLE sechs Elemente · keine Schwaeche · heilt sich per Diarahan", support: "allein",
        strat: "Der Kampf wirkt leicht - und ist es auch, WENN du schnell genug bist. Unter 50 % HP heilt er sich per Diarahan komplett voll und schlaegt danach jede Runde mit starken Angriffen zu (Kouga, Makougaon, Divine Judgement, Vorpal Blade).\nPlan: auf ca. 49 % herunterarbeiten, dann in einem Zug wegburstern - Debilitate, danach Charge + staerkster physischer Angriff. Elementarmagie bringt kaum etwas, Concentrate + Megidolaon ist schwaecher als der physische Weg.\nKoromaru zu Hause lassen (Light-schwach), Yukari als Heilerin, Mitsuru kann ihn einfrieren.\nDanach: Judgement steigt auf Rang 3; zwei Truhen - die verschlossene (3 Twilight Fragments) enthaelt die Antimatter Cannon." },
      { floor: "236F", name: "Comeback Castle + 2× Foot & 2× Mage Soldier", weak: ["Pierce", "Fire"], res: "Castle: keine Schwaeche, resistiert Ice & Elec, SPIEGELT Slash · Mage Soldier: schwach Pierce, nullt Elec, spiegelt Fire, draint Dark · Foot Soldier: schwach Fire, resistiert Strike & Wind, nullt Ice, spiegelt Light, draint Pierce",
        support: "Burg mit vier Begleitern",
        strat: "Vorsicht mit Flaechenzaubern - die drei Gegnertypen haben gegensaetzliche Affinitaeten. Mage Soldiers gezielt mit Pierce, Foot Soldiers gezielt mit Fire. Kein Slash auf die Burg (spiegelt), kein Fire auf die Mages, kein Light/Pierce auf die Foot Soldiers." },
      { floor: "241F", name: "Overseer of Creation", weak: [], res: "SPIEGELT Light und Dark · keine Schwaeche", support: "allein",
        strat: "Weder Light noch Dark benutzen - beides kommt zurueck. Sonst ein klassischer Abnutzungskampf: Buffs/Debuffs halten, physisch und mit den uebrigen Elementen arbeiten, Theurgy einsetzen." },
      { floor: "246F", name: "Appropriating Noble + 2× Invasive Serpent", weak: ["Ice", "Strike"], res: "Noble: resistiert Strike, nullt Light · Serpents: resistieren Wind, drainen Fire", support: "Noble mit zwei Schlangen",
        strat: "Noble mit Ice, Serpents mit Strike downen. Kein Fire auf die Schlangen (heilt sie), kein Light auf den Noble. Direkt danach folgt auf 247F der naechste Kampf - vorher heilen." },
      { floor: "247F", name: "High Judge of Hell", weak: [], res: "Resistiert Slash, Pierce, Dark · Nullt Strike, Ice, Wind · keine Schwaeche", support: "allein (direkt nach 246F)",
        strat: "Extrem defensiv: gegen fast alles resistent oder immun. Uebrig bleiben Fire, Elec, Light und Almighty. Er greift mit diverser Magie an, setzt Slash-Angriffe nach und bufft sich selbst - Dekaja bereithalten und mit Theurgy Druck machen." },
      { floor: "253F", name: "Cultist of Death", weak: ["Wind"], res: "Resistiert Ice & Elec · DRAINT Light und Dark", support: "allein",
        strat: "Endlich wieder eine echte Schwaeche: Wind downen und All-Out Attack. Er kontert mit Almighty-Angriffen, die sich nicht blocken lassen - also HP oben halten. Niemals Light oder Dark (heilt ihn)." },
      { floor: "254F", name: "Hedonistic Sinner ×2", weak: [], res: "Nullt Fire · SPIEGELT Slash und Pierce · draint Elec · keine Schwaeche", support: "treten zu zweit auf (direkt nach 253F)",
        strat: "Kein Slash, kein Pierce (kommt zurueck), kein Fire, kein Elec. Uebrig bleiben Strike, Ice, Wind, Light, Dark und Almighty. Zu zweit und ohne Schwaeche ein zaeher Kampf - Debuffs und Theurgy sind hier am wertvollsten." },
      { floor: "255F", name: "Genocidal Mercenary", weak: [], res: "⚠ Affinitaeten in meinen Quellen nicht dokumentiert", support: "allein (letzter Gatekeeper, direkt nach 254F)",
        strat: "Der letzte Gatekeeper des Spiels, kommt unmittelbar nach den Hedonistic Sinners - vorher unbedingt heilen und SP auffuellen.\n⚠ Zu seinen Schwaechen/Resistenzen habe ich keine belastbaren Angaben gefunden. Fuuka scannen lassen und dann reagieren; wenn du es im Spiel siehst, sag Bescheid, dann trage ich es nach.\nAuf 255F wartet ausserdem die letzte Monad-Tuer." },
    ],
    tips: [
      "Judgement-Social-Link steigt ausschliesslich ueber besiegte Adamah-Gatekeeper - wer hier vorankommt, treibt automatisch den Link voran.",
      "Rage-Immunitaet einpacken: Die zweite Monad-Tuer (~232F) fuehrt zur Reckoning Dice - sie absorbiert Slash, Strike und Pierce, verhaengt per Infuriate Rage und raeumt dich dann mit Megidolaon ab.",
      "Obsessive Sand auf ~49 % bringen und dann in einem Zug toeten - sonst heilt er sich voll.",
      "246F/247F und 253F/254F/255F kommen jeweils direkt hintereinander - dazwischen heilen, aber nicht speichern koennen.",
      "Major-Arcana-Karten und der Wahrsager im Club Escapade erhoehen Beute und EXP - im Januar besonders lohnend.",
    ],
  },
];

// ── Verkaufbare Schaetze (Valuables) · Quelle: game8.co ──
// p = Verkaufspreis bei Officer Kurosawa. p: null = laut game8 noch unbekannt (selbst eintragen).
// Hinweis: Preise koennen je nach Schwierigkeitsgrad abweichen - jeder Preis ist editierbar.
const TREASURE_KEY = "p3r-treasure-calc-v1";

const TREASURES = [
  { n: "Thebel Glass Shard", p: 70, b: "Thebel", s: "Statuen zerschlagen" },
  { n: "Thebel Stone Piece", p: 80, b: "Thebel", s: "Statuen zerschlagen" },
  { n: "Mask of Cowardice", p: 100, b: "Thebel", s: "Shadows besiegen" },
  { n: "Thebel Iron Fence", p: 105, b: "Thebel", s: "Statuen zerschlagen" },
  { n: "Mask of Cruelty", p: 120, b: "Thebel", s: "Shadows besiegen" },
  { n: "Hushing Tiara", p: 130, b: "Thebel", s: "Shadows besiegen" },
  { n: "Thebel Lantern", p: 140, b: "Thebel", s: "Statuen zerschlagen" },
  { n: "Hellish Bowtie", p: 150, b: "Thebel", s: "Shadows besiegen" },
  { n: "Arrowhead of Desire", p: 160, b: "Thebel", s: "Shadows besiegen" },
  { n: "Shackles of Ecstasy", p: 200, b: "Thebel", s: "Shadows besiegen" },
  { n: "Vanguard's Horn", p: 220, b: "Thebel", s: "Grave Beetles" },
  { n: "Iron-Lined Pants", p: 600, b: "—", s: "Fundort unklar" },
  { n: "Thebel Crystal", p: 1000, b: "Thebel", s: "Statuen zerschlagen" },
  { n: "Worldly Coin", p: 1000, b: "alle", s: "Rare Shadows" },
  { n: "Shaft Fragment", p: 2000, b: "Thebel", s: "Gatekeeper 17F" },
  { n: "Wealth Coin", p: 3000, b: "Thebel", s: "Wealth Hand" },
  { n: "Empress's Mask", p: 3000, b: "Thebel", s: "Venus Eagle (5F)" },
  { n: "Vibrant Cloth", p: 3000, b: "Arqa", s: "Crying Table (25F)" },
  { n: "Odd Coin", p: 3750, b: "Arqa", s: "Precious Hand" },
  { n: "Golden Beard", p: 7000, b: "Yabbashah", s: "Furious Gigas (72F)" },
  { n: "Treasure Coin", p: 10000, b: "Arqa", s: "Treasure Hand" },
  { n: "Beetle Horn", p: 10000, b: "Arqa", s: "Golden Beetle (47F)" },
  { n: "Rustic Coin", p: 10500, b: "Yabbashah", s: "Supreme Hand" },
  { n: "Shadow Shard", p: 15000, b: "Yabbashah", s: "Normale Truhen" },
  { n: "Massive Wheel", p: 20000, b: "Tziah", s: "Arcane Turret (122F)" },
  { n: "Supreme Coin", p: 25200, b: "Yabbashah", s: "Supreme Hand" },
  { n: "Dense Rock", p: 38000, b: "spaet", s: "Judgement Sword (171F)" },
  { n: "Steel Right Arm", p: 50000, b: "DLC", s: "Immortal Gigas (Malebolge 8F)" },
  { n: "Broken Heart", p: 80000, b: "spaet", s: "Royal Dancer (201F)" },
  { n: "Shadow Crystal", p: 100000, b: "Tziah", s: "Normale Truhen" },
  { n: "Opulent Coin", p: 100000, b: "Tziah", s: "Opulent Hand" },
  { n: "Luxury Coin", p: 165000, b: "Harabah", s: "Luxury Hand" },
  { n: "Glorious Coin", p: 580000, b: "Adamah", s: "Glorious Hand" },
  { n: "Fine Statuette", p: 2000000, b: "spaet", s: "Jotun of Grief (252F)" },
  // ── Preis laut Guide unbekannt -> selbst eintragen (game8-Liste ist erklaertermassen unvollstaendig) ──
  { n: "Arqa Shell", p: null, b: "Arqa", s: "Statuen zerschlagen" },
  { n: "Arqa Ivy", p: null, b: "Arqa", s: "Statuen zerschlagen" },
  { n: "Arqa Wall Piece", p: null, b: "Arqa", s: "Statuen zerschlagen" },
  { n: "Arqa Luminary", p: null, b: "Arqa", s: "Statuen zerschlagen" },
  { n: "Dusk Lantern", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Iron Cutlery", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Mask of Vanity", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Beastly Fur", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Wizard's Candlestick", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Crown of Vice", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Ostentatious Plume", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Book of Fabrication", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Lamenting Tiara", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Dancer's Necklace", p: null, b: "Arqa", s: "Shadows besiegen" },
  { n: "Copper Coin", p: null, b: "Arqa", s: "Rare Shadow / Hand" },
  { n: "Red-Blue Plates", p: null, b: "Arqa", s: "Fundort unklar" },
  { n: "Purple-Green Plates", p: null, b: "—", s: "Fundort unklar" },
  // ── Edelsteine: laut Guide kauft Kurosawa sie NICHT an (fuer Mayoido Antiques) ──
  { n: "Amethyst", p: null, b: "Edelstein", s: "Mayoido — Kurosawa kauft laut Guide keine Gems" },
  { n: "Turquoise", p: null, b: "Edelstein", s: "Mayoido — Kurosawa kauft laut Guide keine Gems" },
  { n: "Malachite", p: null, b: "Edelstein", s: "Mayoido — Kurosawa kauft laut Guide keine Gems" },
];

// ── Elizabeth-Requests ──
// Quelle: rpgsite.net Elizabeth-Requests-Guide
const ELIZABETH_KEY = "p3r-elizabeth-tracker-v1";
const ELIZABETH_REQUESTS = [
  { id: 1, name: "Bring mir ein Muscle Drink", available: "10.5.", deadline: null, prereq: null, req: "Im Aohige-Pharmacy kaufen oder in Tartarus finden.", reward: "Soul Drop x5" },
  { id: 2, name: "Hol das erste alte Dokument", available: "10.5.", deadline: null, prereq: null, req: "Lila Truhe auf Thebel Block, Floor 22 öffnen.", reward: "10.000 ¥" },
  { id: 3, name: "Shadow-Jagd-Meilenstein", available: "10.5.", deadline: null, prereq: null, req: "Insgesamt 100 Shadows besiegen.", reward: "Cure Water x3" },
  { id: 4, name: "Schatzsuche-Meilenstein", available: "10.5.", deadline: null, prereq: null, req: "Insgesamt 50 Schatztruhen öffnen.", reward: "Snuff Soul x2" },
  { id: 5, name: "Erstelle eine Persona ab Level 13", available: "10.5.", deadline: null, prereq: null, req: "Persona ab Level 13 fusionieren oder finden.", reward: "Bufula Gem x3" },
  { id: 6, name: "Erstelle eine Persona mit Kouha", available: "10.5.", deadline: null, prereq: "Quest 5", req: "Persona mit der Fähigkeit Kouha fusionieren.", reward: "Fierce Sutra" },
  { id: 7, name: "Bring mir einen Juzumaru", available: "10.5.", deadline: null, prereq: null, req: "Boss auf Tartarus Floor 36 besiegen, Truhe öffnen.", reward: "Makouha (Skill Card)" },
  { id: 8, name: "Probier Wahrsagerei aus", available: "10.5.", deadline: null, prereq: null, req: "Courage steigern für Zugang zu Club Escapade, Wahrsagerin für Rarity Fortune bezahlen, in Tartarus kämpfen.", reward: "Speed Incense I x3" },
  { id: 9, name: "Ich möchte alle Getränke probieren", available: "10.5.", deadline: null, prereq: null, req: "12 verschiedene Getränke aus Automaten sammeln (Iwatodai Strip Mall 3F, Wohnheim ×2, Port Island Station).", reward: "Media (Skill Card)" },
  { id: 10, name: "Ich möchte eine Beef Bowl probieren", available: "10.5.", deadline: null, prereq: null, req: "Umiushi-Mitglied im Manga Star Netcafe werden, Beef Bowl bestellen.", reward: "Male Uniforms (W)" },
  { id: 11, name: "Bestehe die Big-Eater-Challenge", available: "10.5.", deadline: null, prereq: "Quest 1", req: "Big-Eater-Challenge bei Wilduck Burgers mit den richtigen Dialogoptionen gewinnen.", reward: "Twilight Fragment x3" },
  { id: 12, name: "Bring mir Kiefernharz", available: "10.5.", deadline: "6.6.", prereq: null, req: "Mit Yukari sprechen, um Pine Resin zu erhalten.", reward: "Toy Bow (für Yukari)" },
  { id: 13, name: "Bring mir eine Handheld-Spielkonsole", available: "10.5.", deadline: "6.6.", prereq: "Quest 12", req: "Mit Junpei sprechen, um die Konsole zu erhalten.", reward: "Pixel Vest (Männer-Rüstung)" },
  { id: 14, name: "Hol das zweite alte Dokument", available: "10.5.", deadline: null, prereq: null, req: "Lila Truhe auf Arqa Block, Floor 43 öffnen.", reward: "20.000 ¥" },
  { id: 15, name: "Shadow-Jagd-Meilenstein #2", available: "10.5.", deadline: null, prereq: "Quest 3", req: "Insgesamt 200 Shadows besiegen.", reward: "Umugi Water x3" },
  { id: 16, name: "Schatzsuche-Meilenstein #2", available: "10.5.", deadline: null, prereq: "Quest 4", req: "Insgesamt 100 Schatztruhen öffnen.", reward: "Chewing Soul x2" },
  { id: 17, name: "Fusionsreihe #1: Emperor, Oberon", available: "10.5.", deadline: null, prereq: "Quest 5", req: "Emperor-Social-Link auf Rang 2 bringen, Valkyrie + Jack Frost zu Oberon fusionieren.", reward: "Female Uniforms (W)" },
  { id: 18, name: "Ich möchte einen Blumenstrauß geschenkt bekommen", available: "13.6.", deadline: null, prereq: null, req: "Rose Bouquet besorgen (Shopping TV am 3.5. bestellen oder beim Blumenladen an der Port Island Station für 2.000 ¥ kaufen).", reward: "Female Winter Garb" },
  { id: 19, name: "Ich will Jack-Frost-Puppen", available: "13.6.", deadline: null, prereq: null, req: "3 Jack-Frost-Puppen am Greifautomaten in der Paulownia Mall gewinnen.", reward: "Twilight Fragment x3" },
  { id: 20, name: "Bring mir starke Medizin", available: "13.6.", deadline: null, prereq: null, req: "Potent Medicine im Krankenzimmer der Schule besorgen.", reward: "Steel Pipe (MC-Waffe)" },
  { id: 21, name: "Hol das dritte alte Dokument", available: "13.6.", deadline: null, prereq: "Quest 14", req: "Lila Truhe auf Arqa Block, Floor 69 öffnen.", reward: "30.000 ¥" },
  { id: 22, name: "Shadow-Jagd-Meilenstein #3", available: "10.5.", deadline: null, prereq: "Quest 15", req: "Insgesamt 300 Shadows besiegen.", reward: "Bead x3" },
  { id: 23, name: "Fusions-Meilenstein", available: "13.6.", deadline: null, prereq: null, req: "Insgesamt 20 Persona-Fusionen durchführen.", reward: "Twilight Fragment x5" },
  { id: 24, name: "Erstelle eine Persona ab Level 23", available: "13.6.", deadline: null, prereq: null, req: "Persona ab Level 23 besitzen.", reward: "Sugar Key" },
  { id: 25, name: "Fusionsreihe #2: Chariot, Mithras", available: "10.5.", deadline: null, prereq: "Quest 17", req: "Chariot-Social-Link auf Rang 5 bringen, Oberon + Tam Lin zu Mithras ab Level 26 fusionieren.", reward: "Male Winter Garb" },
  { id: 26, name: "Bring mir eine Onimaru Kunitsuna", available: "13.6.", deadline: null, prereq: null, req: "Boss auf Tartarus Floor 54 besiegen, seltene Truhe mit Twilight Fragments öffnen.", reward: "Crit Rate Boost (Skill Card)" },
  { id: 27, name: "Bring mir ein Dreieck-Schwert", available: "13.6.", deadline: "5.7.", prereq: null, req: "Mit Mitsuru sprechen, um das Schwert zu erhalten.", reward: "Gallant Sneakers" },
  { id: 28, name: "Ich will schick aussehen", available: "13.6.", deadline: "5.7.", prereq: "Quest 27", req: "Mit Akihiko sprechen, um Protein zu erhalten.", reward: "Spiked Bat" },
  { id: 29, name: "Ich will schick aussehen (2)", available: "13.6.", deadline: "5.7.", prereq: null, req: "150.000 ¥ für eine Brille zahlen, oder Black Quartz besorgen für Rabatt (Lustful Snake ab Floor 57, oder Floor-60-Boss).", reward: "Power Incense x5" },
  { id: 30, name: "Hol das vierte alte Dokument", available: "9.7.", deadline: null, prereq: "Quest 21", req: "Lila Truhe auf Yabbashah Block, Floor 91 öffnen.", reward: "40.000 ¥" },
  { id: 31, name: "Shadow-Jagd-Meilenstein #4", available: "10.5.", deadline: null, prereq: "Quest 22", req: "Insgesamt 450 Shadows besiegen.", reward: "Kamimusubi Water x2" },
  { id: 32, name: "Schatzsuche-Meilenstein #3", available: "10.5.", deadline: null, prereq: "Quest 16", req: "Insgesamt 150 Schatztruhen öffnen.", reward: "Snuff Soul x6" },
  { id: 33, name: "Fusions-Meilenstein #2", available: "13.6.", deadline: null, prereq: "Quest 23", req: "Insgesamt 35 Persona-Fusionen durchführen.", reward: "Twilight Fragment x5" },
  { id: 34, name: "Erstelle eine Persona mit Torrent Shot", available: "9.7.", deadline: null, prereq: null, req: "Persona mit der Fähigkeit Torrent Shot fusionieren oder finden.", reward: "Attack Mirror x3" },
  { id: 35, name: "Fusionsreihe #3: Hermit, Mothman", available: "9.7.", deadline: null, prereq: null, req: "Mothman mit Agilao fusionieren oder Agilao-Skill-Card nutzen.", reward: "Maid Outfit" },
  { id: 36, name: "Besiege eine seltene Shadow #1", available: "9.7.", deadline: null, prereq: null, req: "Seltene Shadow auf Yabbashah Block besiegen (magieresistent — Theurgy sparen).", reward: "Onyx x7" },
  { id: 37, name: "Durchquere die Monad-Passage", available: "9.7.", deadline: null, prereq: "Monad-Tür auf Floor 80 durchquert", req: "Monad-Tür auf Floor 91 durchqueren.", reward: "Black Sword" },
  { id: 38, name: "Ich will gekühlten Taiyaki essen", available: "9.7.", deadline: null, prereq: "Quest 10", req: "Iwatodai-Forum-Notiz im Club Escapade kaufen, Shared Computer nutzen, Lukewarm Taiyaki im Schulladen kaufen, über Nacht kühlen.", reward: "Nihil Cloth" },
  { id: 39, name: "Lass mich Musik hören, die typisch für Gekkokan ist", available: "9.7.", deadline: null, prereq: null, req: "Im PA-Raum neben dem Klassenzimmer nachsehen.", reward: "Female Uniform (S)" },
  { id: 40, name: "Ich möchte ein Paar Max Safety Shoes sehen", available: "9.7.", deadline: null, prereq: null, req: "Über Shopping TV am 12.7. bestellen.", reward: "Twilight Fragment x3" },
  { id: 41, name: "Bring mir das Autogramm der mysteriösen Person", available: "9.7.", deadline: null, prereq: "Quest 40", req: "Tanakas Visitenkarte besitzen (aus dem Devil-Social-Link).", reward: "Nihil Bible" },
  { id: 42, name: "Bitte füttere die Katze", available: "9.7.", deadline: null, prereq: null, req: "Katze am Station Outskirt finden, an 4 Tagen mit Super Cat Food (Apotheke) füttern.", reward: "Male Summer Garb" },
  { id: 43, name: "Bring mir einen Weihnachtsstern", available: "9.7.", deadline: "4.8.", prereq: null, req: "Abends mit Fuuka sprechen.", reward: "Jack's Gloves" },
  { id: 44, name: "Ich möchte das Meer spüren", available: "9.7.", deadline: "4.8.", prereq: null, req: "4 Items während des Yakushima-Ausflugs am Strand sammeln.", reward: "Amethyst x5" },
  { id: 45, name: "Hol das fünfte alte Dokument", available: "8.8.", deadline: null, prereq: "Quest 30", req: "Lila Truhe auf Yabbashah Block, Floor 118 öffnen.", reward: "50.000 ¥" },
  { id: 46, name: "Shadow-Jagd-Meilenstein #5", available: "10.5.", deadline: null, prereq: "Quest 31", req: "Insgesamt 600 Shadows besiegen.", reward: "Bead Chain x2" },
  { id: 47, name: "Schatzsuche-Meilenstein #4", available: "10.5.", deadline: null, prereq: "Quest 32", req: "Insgesamt 200 Schatztruhen öffnen.", reward: "Precious Egg x2" },
  { id: 48, name: "Fusions-Meilenstein #3", available: "13.6.", deadline: null, prereq: "Quest 33", req: "Insgesamt 50 Persona-Fusionen durchführen.", reward: "Twilight Fragment x5" },
  { id: 49, name: "Erstelle eine Persona ab Level 38", available: "10.5.", deadline: null, prereq: "Quest 31", req: "Persona ab Level 38 besitzen.", reward: "Marionette (ermöglicht Nebiros-Fusion)" },
  { id: 50, name: "Führe „King and I“ aus", available: "8.8.", deadline: null, prereq: "Quest 31", req: "King-and-I-Fusionsspell durch Fusion von King Frost + Black Frost auslösen.", reward: "Guard Incense II x3" },
  { id: 51, name: "Bring mir eine Outenta Mitsuyo", available: "8.8.", deadline: null, prereq: null, req: "Im Antique Shop craften (Start-Rezept).", reward: "Multi-Target Boost (Skill Card)" },
  { id: 52, name: "Ich möchte ein selbstgekochtes Essen probieren", available: "8.8.", deadline: null, prereq: "Quest 38", req: "Mit jemandem im Wohnheim kochen.", reward: "Legendary Cleaver" },
  { id: 53, name: "Ich möchte eine mysteriöse Kartoffel sehen", available: "8.8.", deadline: null, prereq: "Quest 52", req: "Mit jemandem gärtnern; Tarukaja Potato erhalten.", reward: "Ergotite Shard" },
  { id: 54, name: "Versuche hundert Schrein-Besuche", available: "8.8.", deadline: null, prereq: null, req: "Schrein-Altar 3-mal prüfen, um 500-Yen-Schein zu finden.", reward: "Lime Swim Wear" },
  { id: 55, name: "Ich möchte einen Beweis einer Bindung sehen", available: "8.8.", deadline: null, prereq: null, req: "Item von einem maximierten Social Link erhalten.", reward: "Space Badge" },
  { id: 56, name: "Such nach dem Getränk mit meinem Namen", available: "8.8.", deadline: null, prereq: null, req: "Hoher Charm-Rang nötig, Que-Sera-Sera-Bar an den Station Outskirts besuchen.", reward: "As Generic Material" },
  { id: 57, name: "Ich möchte Aojiru probieren", available: "8.8.", deadline: null, prereq: null, req: "Hinweise in der Apotheke holen, 2× Topaz + 1× Turquoise gegen Vintage Yagen beim Antiquitätenladen tauschen, zur Apotheke bringen.", reward: "Twilight Fragment x8" },
  { id: 58, name: "Ich wünsche mir, ein Stroh-Millionär zu werden", available: "8.8.", deadline: "31.8.", prereq: null, req: "Eingewickelte Bandage von Elizabeth an den Stationen Port Island Outskirt und Iwatodai Strip Mall eintauschen, bis man das Cat Headband erhält.", reward: "Turquoise x20" },
  { id: 59, name: "Hol das sechste alte Dokument", available: "10.9.", deadline: null, prereq: "Quest 45", req: "Lila Truhe auf Yabbashah Block, Floor 144 öffnen.", reward: "70.000 ¥" },
  { id: 60, name: "Shadow-Jagd-Meilenstein #6", available: "8.8.", deadline: null, prereq: "Quest 46", req: "Insgesamt 800 Shadows besiegen.", reward: "Soma" },
  { id: 61, name: "Erstelle eine Persona ab Level 46", available: "10.9.", deadline: null, prereq: "Quest 49", req: "Persona ab Level 46 besitzen.", reward: "Atrophying Sutra" },
  { id: 62, name: "Fusionsreihe #4: Lovers, Titania", available: "10.9.", deadline: null, prereq: "Quest 35", req: "Titania mit der Fähigkeit Matarukaja besitzen.", reward: "Male Uniform (S)" },
  { id: 63, name: "Fusionsreihe #5: Magician, Rangda", available: "10.9.", deadline: null, prereq: "Quest 50", req: "Rangda ab Level 54 besitzen (am maximierten Magician-Social-Link fusionieren).", reward: "Female Summer Garb" },
  { id: 64, name: "Besiege eine seltene Shadow #2", available: "10.9.", deadline: null, prereq: "Quest 49", req: "Seltene Shadow „Tziah“ im vierten Block besiegen, Sumptuous Coin einsammeln.", reward: "Topaz x7" },
  { id: 65, name: "Bring mir eine Ote-gine", available: "10.9.", deadline: null, prereq: null, req: "Schatztruhe auf Tartarus Floor 143 nach dem Boss öffnen.", reward: "Quality Nihil Ore" },
  { id: 66, name: "Bring mir eine große, gruselige Puppe", available: "10.9.", deadline: null, prereq: "Quest 39", req: "Im Laboratory auf 1F nachsehen.", reward: "Quality Nihil Blade" },
  { id: 67, name: "Find mir eine schöne Fliese", available: "10.9.", deadline: null, prereq: "Quest 54", req: "Mahjong-Salon „Red Hawk“ an den Station Outskirts besuchen (maximierter Courage-Rang nötig).", reward: "Scrub Brush (Ken-Waffe)" },
  { id: 68, name: "Bring mir ein Obstmesser", available: "10.9.", deadline: "2.10.", prereq: null, req: "Mit Shinjiro sprechen.", reward: "Bus Stop Sign (Shinji-Waffe)" },
  { id: 69, name: "Bring mir Öl", available: "10.9.", deadline: "2.10.", prereq: "Quest 68", req: "Mit Aigis sprechen.", reward: "Rocket Punch (Aigis-Waffe)" },
  { id: 70, name: "Hol das siebte alte Dokument", available: "6.10.", deadline: null, prereq: "Quest 59", req: "Lila Truhe auf Tziah Block, Floor 172 öffnen.", reward: "90.000 ¥" },
  { id: 71, name: "Fusionsreihe #6: Strength, Siegfried", available: "6.10.", deadline: null, prereq: "Quest 62", req: "Siegfried mit der Fähigkeit Endure fusionieren (Skill Card aus Quest 73 nutzen).", reward: "Sky Sundress" },
  { id: 72, name: "Fusionsreihe #7: Hierophant, Daisoujou", available: "6.10.", deadline: null, prereq: "Quest 63", req: "Daisoujou mit Regenerate 3 fusionieren (Suzaku vom Temperance-Social-Link holen, Suzaku + Hell Biker fusionieren).", reward: "Blue Shorts" },
  { id: 73, name: "Bring mir eine Mikazuki Munechika", available: "6.10.", deadline: null, prereq: null, req: "Craften aus Quality Nihil Blade + 3× Emerald + 2× Silver Quartz.", reward: "Endure (Skill Card)" },
  { id: 74, name: "Ich möchte Sushi probieren", available: "6.10.", deadline: null, prereq: "Quest 53", req: "Naganaki-Schrein besuchen, Inari-Schrein prüfen (Academics-Rang 4+ nötig).", reward: "Ergotite Chunk" },
  { id: 75, name: "Bring mir einen Sengoku-Zeit-Helm", available: "6.10.", deadline: null, prereq: "Quest 66", req: "Mehrfach an mehreren Tagen im Faculty Office bei Mr. Ono vorbeischauen.", reward: "Twilight Fragment x7" },
  { id: 76, name: "Bring mir ein Brillenputztuch", available: "6.10.", deadline: "1.11.", prereq: null, req: "Abends mit Rektor Shuji sprechen.", reward: "Garnet x5" },
  { id: 77, name: "Ich möchte durch die Paulownia Mall bummeln", available: "10.5.", deadline: null, prereq: "15 Elizabeth-Requests abgeschlossen", req: "Elizabeth zum Ausgehen einladen.", reward: "Small Cheongsam (ermöglicht Hua-Po-Fusion)" },
  { id: 78, name: "Ich möchte die Iwatodai Station besuchen", available: "10.5.", deadline: null, prereq: "30 Elizabeth-Requests abgeschlossen", req: "Elizabeth zum Ausgehen einladen.", reward: "Book of the Ancients (ermöglicht Thoth-Fusion)" },
  { id: 79, name: "Ich möchte den Naganaki-Schrein besuchen", available: "8.8.", deadline: null, prereq: "45 Elizabeth-Requests abgeschlossen", req: "Elizabeth zum Ausgehen einladen.", reward: "Vitality Sash" },
  { id: 80, name: "Ich möchte die Gekkoukan High besuchen", available: "6.10.", deadline: null, prereq: "70 Elizabeth-Requests abgeschlossen", req: "Elizabeth zum Ausgehen einladen.", reward: "Sorcerer's Mark" },
  { id: 81, name: "Ich möchte dein Zimmer besuchen", available: "6.11.", deadline: null, prereq: "80 Elizabeth-Requests abgeschlossen", req: "Elizabeth zum Ausgehen einladen.", reward: "Tyrant's Horn (ermöglicht Lucifer-Fusion)" },
  { id: 82, name: "Hol das letzte alte Dokument", available: "6.11.", deadline: null, prereq: "Quest 70", req: "Lila Truhe auf Harabah Block, Floor 198 öffnen.", reward: "120.000 ¥" },
  { id: 83, name: "Hol den Fortschrittsbericht", available: "4.12.", deadline: null, prereq: "Quest 82", req: "Lila Truhe auf Adamah Block, Floor 226 öffnen.", reward: "150.000 ¥" },
  { id: 84, name: "Erstelle eine Persona mit Tempest Slash", available: "6.11.", deadline: null, prereq: null, req: "Chernobog besorgen (Level-56-Persona mit Tempest Slash, ab Floor 199 zu finden).", reward: "Empowering Sutra x3" },
  { id: 85, name: "Erstelle eine Persona mit Auto-Maraku", available: "4.12.", deadline: null, prereq: "Quest 84", req: "Hochstufige Lovers-Persona (Raphael, Cybele) mit Auto-Maraku fusionieren.", reward: "Debilitor Sutra x3" },
  { id: 86, name: "Fusionsreihe #8: Death, Alice", available: "6.11.", deadline: null, prereq: null, req: "Spezialfusion aus Pixie + Lilim + Narcissus + Titania.", reward: "Maid Outfit" },
  { id: 87, name: "Fusionsreihe #9: Fool, Loki", available: "7.12.", deadline: null, prereq: "Quest 72", req: "Loki ab Level 69 fusionieren (Gabriel + Siegfried oder Gabriel + Kali).", reward: "Masakados (ermöglicht Masakados-Fusion)" },
  { id: 88, name: "Besiege eine gierige Shadow", available: "6.11.", deadline: null, prereq: null, req: "Wahrsagerin nutzen, um Erscheinungschance zu erhöhen, 3× die Richtung der Shadow erraten.", reward: "Life Aid (Skill Card)" },
  { id: 89, name: "Bring mir eine Rai Kunimitsu", available: "6.11.", deadline: null, prereq: null, req: "Verschlossene Schatztruhe auf Floor 184 nach dem Boss öffnen.", reward: "Prime Nihil Ore" },
  { id: 90, name: "Bring mir eine Dojigiri Yasutsuna", available: "4.12.", deadline: null, prereq: null, req: "Verschlossene Schatztruhe auf Floor 212 nach dem Boss öffnen.", reward: "AS Refined Material" },
  { id: 91, name: "Bring mir eine Tonbo-kiri", available: "2.1.", deadline: null, prereq: null, req: "⚠ Anforderungen in der Quelle nicht dokumentiert.", reward: "⚠ Belohnung in der Quelle nicht dokumentiert." },
  { id: 92, name: "Geh und reinige eine Toilette", available: "6.11.", deadline: null, prereq: null, req: "Toilette über dem Theater an der Port Island Station prüfen.", reward: "Maid Outfit" },
  { id: 93, name: "Geh und gieß die Blumen", available: "6.11.", deadline: null, prereq: null, req: "Blumen auf dem Schuldach gießen.", reward: "Maid Outfit" },
  { id: 94, name: "Bring mir Futter für einen pelzigen Freund", available: "6.11.", deadline: "30.11.", prereq: null, req: "Mit Koromaru sprechen, um Gourmet Dog Food zu erhalten.", reward: "Bone (Koromaru-Waffe)" },
  { id: 95, name: "Bring mir eine Featherman-R-Actionfigur", available: "6.11.", deadline: "30.11.", prereq: "Quest 94", req: "Mit Ken sprechen.", reward: "Sacrificial Idol" },
  { id: 96, name: "Ich möchte Oden-Saft probieren", available: "6.11.", deadline: null, prereq: null, req: "Mit dem freundlichen Studenten am Kakibaum sprechen, Kyoto-Ausflug abschließen, Kansai-Softdrinks am Automaten kaufen.", reward: "Winter Uniform" },
  { id: 97, name: "Bring mir mein Weihnachtsgeschenk", available: "4.12.", deadline: "25.12.", prereq: null, req: "Ab Juni vermisste Personen retten, Dankesbrief erhalten, mit dem Mann in der Iwatodai Strip Mall 2F sprechen.", reward: "Ruby x3" },
  { id: 98, name: "Fusionsreihe #10: Tower, Masakado", available: "6.1.", deadline: null, prereq: null, req: "Siegfried (mit Charge) + Vasuki oder Hecatonaires zu Koumokuten (mit Charge) fusionieren, dann mit Zouchouten, Jikokuten, Bishamonten kombinieren.", reward: "Nihil White Model x2" },
  { id: 99, name: "Besiege die Shadow des Leerraums", available: "6.1.", deadline: null, prereq: null, req: "Floor 255 (Monad-Passage) abschließen, Endboss besiegen (300 HP/Runde Heilung einplanen); volle Theurgies + Einzelziel-Schaden nutzen.", reward: "Nihil White Model x2" },
  { id: 100, name: "Bring mir einen Bloody Button", available: "2.1.", deadline: null, prereq: null, req: "Insta-Heal-Accessoire ausrüsten, Persona mit Salvation, Koromaru mit Debilitate; Reaper per Hinterhalt besiegen.", reward: "Divine Pillar (Accessoire, 50% Schadensreduktion, kein Ausweichen)" },
  { id: 101, name: "Besiege den ultimativen Widersacher", available: "6.1.", deadline: null, prereq: null, req: "⚠ Anforderungen in der Quelle nicht dokumentiert (nur „Good luck!“ genannt).", reward: "Omnipotent Orb" },
];

const yen = (v) => (v || 0).toLocaleString("de-DE");

const STORAGE_KEY = "p3r-april-checklist-v1";

function taskId(mk, di, si, ii) { return `${mk}-${di}-${si}-${ii}`; }

// erster Tag (ueber alle Monate, in Reihenfolge), der noch nicht komplett abgehakt ist
function firstIncomplete(doneObj) {
  for (const mk of MONTH_KEYS) {
    const days = MONTHS[mk].days;
    for (let di = 0; di < days.length; di++) {
      let all = true;
      days[di].slots.forEach((s, si) => s.items.forEach((_, ii) => {
        if (!doneObj[taskId(mk, di, si, ii)]) all = false;
      }));
      if (!all) return { mk, page: di };
    }
  }
  return null; // alles erledigt
}

export default function App() {
  const [done, setDone] = useState({});
  const [mode, setMode] = useState("calendar"); // "calendar" | "tartarus" | "treasure" | "elizabeth"
  const [monthKey, setMonthKey] = useState("Apr");
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);   // Basis: alle Antworten zu
  const [openAnswers, setOpenAnswers] = useState({}); // pro Task ueberschreibbar
  const [, setLoaded] = useState(false);
  const stripRefs = useRef({});

  const M = MONTHS[monthKey];
  const D = M.days, B = M.budget, T = M.tips;
  const TIPS_PAGE = 0;         // Tipps sind die erste Seite jedes Monats
  const LAST_PAGE = D.length;  // Tage liegen auf Seite 1..D.length

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) {
          const raw = JSON.parse(r.value);
          // Migration: alte IDs ohne Monats-Praefix (z.B. "5-0-0") -> "Apr-5-0-0"
          const migrated = {};
          for (const k of Object.keys(raw)) {
            migrated[/^\d+-\d+-\d+$/.test(k) ? `Apr-${k}` : k] = raw[k];
          }
          setDone(migrated);
          // Auto-Sprung zum ersten noch offenen Tag (nur beim Laden)
          const t = firstIncomplete(migrated);
          if (t) { setMonthKey(t.mk); setPage(t.page + 1); }
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  }, []);

  const toggle = (id) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) delete next[id];
      persist(next);
      return next;
    });
  };

  const allIds = useMemo(() => {
    const ids = [];
    D.forEach((d, di) => d.slots.forEach((s, si) => s.items.forEach((_, ii) => ids.push(taskId(monthKey, di, si, ii)))));
    return ids;
  }, [D, monthKey]);
  const total = allIds.length;
  const completed = allIds.filter((id) => done[id]).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const dayProgress = (di) => {
    const ids = [];
    D[di].slots.forEach((s, si) => s.items.forEach((_, ii) => ids.push(taskId(monthKey, di, si, ii))));
    return { c: ids.filter((id) => done[id]).length, t: ids.length };
  };

  // alle Aufgaben eines Tages auf einmal setzen/loeschen
  const setDayAll = (di, value) => {
    const ids = [];
    D[di].slots.forEach((s, si) => s.items.forEach((_, ii) => ids.push(taskId(monthKey, di, si, ii))));
    setDone((prev) => {
      const next = { ...prev };
      for (const id of ids) { if (value) next[id] = true; else delete next[id]; }
      persist(next);
      return next;
    });
  };

  const switchMonth = (mk) => { setMonthKey(mk); setPage(0); setOpenAnswers({}); };

  const reset = () => {
    if (!window.confirm(`Allen ${M.label}-Fortschritt zuruecksetzen?`)) return;
    setDone((prev) => {
      const next = {};
      for (const k of Object.keys(prev)) if (!k.startsWith(`${monthKey}-`)) next[k] = prev[k];
      persist(next);
      return next;
    });
  };

  // aktives Datum in die Sicht scrollen
  useEffect(() => {
    const el = stripRefs.current[page];
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [page, monthKey]);

  const go = (delta) => setPage((p) => Math.max(0, Math.min(LAST_PAGE, p + delta)));

  // Antwort offen? per-Task-Override schlaegt die Basis (showAll)
  const isAnswerOpen = (id) => (id in openAnswers ? openAnswers[id] : showAll);
  const toggleAnswer = (id) =>
    setOpenAnswers((p) => ({ ...p, [id]: !(id in p ? p[id] : showAll) }));
  // Master: setzt Basis neu und loescht alle Overrides
  const toggleAll = () => { setShowAll((v) => !v); setOpenAnswers({}); };

  const ANSWER_LABEL = {
    social: "Optimale Antworten",
    prereq: "Schritte anzeigen",
    tartarus: "Ziele anzeigen",
    quiz: "Antwort anzeigen",
    boss: "Schwaechen & Strategie",
  };

  const onTips = page === TIPS_PAGE;
  const day = onTips ? null : D[page - 1];
  const dp = onTips ? null : dayProgress(page - 1);
  const dayDone = dp && dp.c === dp.t && dp.t > 0;

  return (
    <div style={mode === "calendar" ? S.root : S.rootDark}>
      <style>{css}</style>

      {mode === "tartarus" ? (
        <TartarusTab mode={mode} setMode={setMode} />
      ) : mode === "treasure" ? (
        <div>
          <header style={TH.header}>
            <div style={TH.titleRow}>
              <span style={TH.moon}>¥</span>
              <div>
                <div style={TH.eyebrow}>SCHÄTZE</div>
                <h1 style={TH.h1}>Schatz-Rechner</h1>
              </div>
              <div style={{ marginLeft: "auto" }}><BurgerMenu mode={mode} setMode={setMode} /></div>
            </div>
          </header>
          <main style={TH.main}><TreasureCalc /></main>
        </div>
      ) : mode === "elizabeth" ? (
        <div>
          <header style={TH.header}>
            <div style={TH.titleRow}>
              <span style={TH.moon}>📖</span>
              <div>
                <div style={TH.eyebrow}>ELIZABETH</div>
                <h1 style={TH.h1}>Requests</h1>
              </div>
              <div style={{ marginLeft: "auto" }}><BurgerMenu mode={mode} setMode={setMode} /></div>
            </div>
          </header>
          <main style={TH.main}><ElizabethTab /></main>
        </div>
      ) : (
        <>
      {/* ── Sticky Kopf ── */}
      <header style={S.header}>
        <div style={S.topRow}>
          <div style={S.topLeft}>
            <ModeButton mode={mode} setMode={setMode} />
            <div style={S.eyebrow}>PERSONA&nbsp;3&nbsp;RELOAD · {M.label.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.totalProg}>
              <span style={{ color: "#29c5f6", fontWeight: 700 }}>{completed}</span>
              <span style={{ opacity: .45 }}>/{total} · {pct}%</span>
            </div>
            <BurgerMenu mode={mode} setMode={setMode} />
          </div>
        </div>

        {/* Monats-Umschalter */}
        <div style={S.monthSwitch}>
          {MONTH_KEYS.map((mk) => (
            <button
              key={mk}
              onClick={() => switchMonth(mk)}
              style={{ ...S.monthBtn, ...(mk === monthKey ? S.monthBtnOn : {}) }}
            >
              {MONTHS[mk].label}
            </button>
          ))}
        </div>

        <div style={S.headTrack}><div style={{ ...S.headFill, width: `${pct}%` }} /></div>

        {/* Datumsleiste */}
        <div style={S.strip} className="hide-scroll">
          <button
            ref={(el) => (stripRefs.current[TIPS_PAGE] = el)}
            onClick={() => setPage(TIPS_PAGE)}
            style={{ ...S.pill, ...S.pillTips, ...(onTips ? S.pillTipsActive : {}) }}
          >
            <span style={{ ...S.pillNum, color: onTips ? "#06121f" : "#b98cff", fontSize: 20 }}>✦</span>
            <span style={{ ...S.pillMon, color: onTips ? "#06121f" : "#b98cff" }}>TIPPS</span>
          </button>
          {D.map((d, i) => {
            const { c, t } = dayProgress(i);
            const full = c === t && t > 0;
            const p = i + 1;
            const active = p === page;
            return (
              <button
                key={i}
                ref={(el) => (stripRefs.current[p] = el)}
                onClick={() => setPage(p)}
                style={{ ...S.pill, ...(active ? S.pillActive : {}), ...(full && !active ? S.pillDone : {}) }}
              >
                <span style={S.pillMon}>{M.mon}</span>
                <span style={{ ...S.pillNum, ...(active ? { color: "#06121f" } : full ? { color: "#7df9a8" } : {}) }}>{d.date}</span>
                <span style={{ ...S.pillDot, background: full ? "#7df9a8" : c > 0 ? "#29c5f6" : "#33406b" }} />
                {B[d.date] && <span style={{ ...S.pillYen, color: active ? "#06121f" : "#ffd34d" }}>¥</span>}
                {d.spoiler && <span style={{ ...S.pillWarn, color: active ? "#06121f" : "#ff8f97" }}>⚠</span>}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Inhalt: ein Tag bzw. Tipps ── */}
      <main style={S.main} key={page}>
        {onTips ? (
          <section style={S.sheet}>
            <div style={S.dayHero}>
              <div style={{ ...S.heroDate, background: "linear-gradient(160deg,#241a4a,#160e30)", borderColor: "#3a2c6e" }}>
                <span style={{ ...S.heroNum, color: "#b98cff", fontSize: 30 }}>✦</span>
              </div>
              <div>
                <h1 style={{ ...S.heroTitle, color: "#cdb8ff" }}>Monats-Tipps</h1>
                <div style={S.heroMeta}>Das Wichtigste fuer den {M.label}</div>
              </div>
            </div>
            <div style={S.slot}>
              {T.map((t, i) => (
                <div key={i} style={S.tip}>
                  <span style={S.tipNum}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <button style={S.resetInline} onClick={reset}>Fortschritt zuruecksetzen</button>
          </section>
        ) : (
          <section style={{ ...S.sheet, ...(dayDone ? S.sheetDone : {}) }}>
            <div style={S.dayHero}>
              <div style={{ ...S.heroDate, ...(dayDone ? { borderColor: "rgba(125,249,168,.5)" } : {}) }}>
                <span style={S.heroMon}>{M.mon}</span>
                <span style={{ ...S.heroNum, ...(dayDone ? { color: "#7df9a8" } : {}) }}>{day.date}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={S.heroTitle}>{day.date}. {M.label}</h1>
                <div style={S.heroMeta}>
                  {dayDone
                    ? <span style={{ color: "#7df9a8", fontWeight: 700 }}>✓ Tag erledigt</span>
                    : <span style={{ opacity: .6 }}>{dp.c} / {dp.t} erledigt</span>}
                </div>
              </div>
              <button style={{ ...S.miniToggle, ...(showAll ? S.miniToggleOn : {}) }} onClick={toggleAll}>
                {showAll ? "Antw. alle zu" : "Antw. alle auf"}
              </button>
            </div>

            <button
              style={{ ...S.dayAllBtn, ...(dayDone ? S.dayAllBtnDone : {}) }}
              onClick={() => setDayAll(page - 1, !dayDone)}
            >
              {dayDone ? "↺ Tag zuruecksetzen" : "✓ Alle ToDos abhaken"}
            </button>

            {day.spoiler && (
              <div style={S.spoilerBand}>
                <span style={S.spoilerIcon}>⚠</span>
                <span>Story-lastiger Tag — hier passiert Handlungsrelevantes. Details stehen nur in den aufklappbaren Feldern.</span>
              </div>
            )}

            {B[day.date] && (() => {
              const b = B[day.date];
              return (
                <div style={S.budget}>
                  <div style={S.budgetHead}>
                    <span style={S.budgetCoin}>¥</span>
                    <span>Grob noetig: <b style={{ color: "#ffd34d" }}>{b.total} ¥</b>{b.approx ? " (ca.)" : ""}</span>
                  </div>
                  <div style={S.budgetItems}>
                    {b.items.map(([name, val], i) => (
                      <div key={i} style={S.budgetRow}>
                        <span style={{ opacity: .85 }}>{name}</span>
                        <span style={S.budgetDots} />
                        <span style={{ color: "#ffe08a", fontVariantNumeric: "tabular-nums" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {b.income && <div style={S.budgetIncome}>+ {b.income}</div>}
                  {b.tip && <div style={S.budgetTip}>{b.tip}</div>}
                </div>
              );
            })()}

            {day.slots.map((slot, si) => (
              <div key={si} style={S.slot}>
                <div style={S.slotLabel}>{slot.slot}</div>
                {slot.items.map((item, ii) => {
                  const id = taskId(monthKey, page - 1, si, ii);
                  const checked = !!done[id];
                  const k = KIND[item.kind] || KIND.cutscene;
                  const st = item.stat ? STAT[item.stat] : null;
                  return (
                    <div key={ii} style={S.task}>
                      <button aria-pressed={checked} onClick={() => toggle(id)} style={{ ...S.check, ...(checked ? S.checkOn : {}) }}>
                        {checked ? "✓" : ""}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...S.taskLabel, ...(checked ? S.taskLabelDone : {}) }}>{item.label}</div>
                        <div style={S.chips}>
                          <span style={{ ...S.chip, color: k.color, borderColor: k.color + "55" }}>{k.tag}</span>
                          {st && (
                            <span style={{ ...S.chip, color: st.color, borderColor: st.color + "55", boxShadow: `0 0 0 1px ${st.glow} inset` }}>
                              {st.label} ✦
                            </span>
                          )}
                        </div>
                        {!item.answer && item.kind === "social" && (
                          <div style={S.noChoice}>Keine Antwortwahl bei diesem Rang</div>
                        )}
                        {item.answer && (() => {
                          const open = isAnswerOpen(id);
                          const isBoss = item.kind === "boss";
                          const label = ANSWER_LABEL[item.kind] || "Details anzeigen";
                          return (
                            <div style={{ marginTop: 8 }}>
                              <button
                                onClick={() => toggleAnswer(id)}
                                aria-expanded={open}
                                style={{ ...S.answerToggle, ...(open ? (isBoss ? S.bossToggleOn : S.answerToggleOn) : {}), ...(isBoss ? S.bossToggle : {}) }}
                              >
                                <span style={{ ...S.answerChevron, transform: open ? "rotate(90deg)" : "none" }}>{isBoss ? "⚔" : "›"}</span>
                                {open ? (isBoss ? "Boss-Info ausblenden" : "Antworten ausblenden") : label}
                              </button>
                              {open && <div style={isBoss ? S.bossInfo : S.answer}>{item.answer}</div>}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* ── Sticky Blätter-Navigation ── */}
      <nav style={S.nav}>
        <button onClick={() => go(-1)} disabled={page === 0} style={{ ...S.navBtn, ...(page === 0 ? S.navOff : {}) }}>
          <span style={S.navArrow}>‹</span> Zurueck
        </button>
        <div style={S.navCenter}>
          {onTips ? "Tipps" : `${day.date}. ${M.label}`}
          <span style={S.navCount}>{onTips ? "Extra" : `${page}/${D.length}`}</span>
        </div>
        <button onClick={() => go(1)} disabled={page === LAST_PAGE} style={{ ...S.navBtn, ...(page === LAST_PAGE ? S.navOff : {}) }}>
          Weiter <span style={S.navArrow}>›</span>
        </button>
      </nav>
        </>
      )}
    </div>
  );
}

// ── Runder Umschalt-Button (zeigt das Ziel an) ──
function ModeButton({ mode, setMode }) {
  const toTartarus = mode === "calendar";
  return (
    <button
      onClick={() => setMode(toTartarus ? "tartarus" : "calendar")}
      aria-label={toTartarus ? "Zu Tartarus wechseln" : "Zum Kalender wechseln"}
      title={toTartarus ? "Zu Tartarus" : "Zum Kalender"}
      style={{ ...S.fab, ...(toTartarus ? S.fabTar : S.fabCal) }}
    >
      {toTartarus ? "🌙" : "📅"}
    </button>
  );
}

// ── Burger-Menü ──
const MENU_ITEMS = [
  { key: "calendar", icon: "📅", label: "Tagesplaner" },
  { key: "tartarus", icon: "🌙", label: "Tartarus" },
  { key: "treasure", icon: "¥", label: "Schatzrechner" },
  { key: "elizabeth", icon: "📖", label: "Elizabeth-Requests" },
];

function BurgerMenu({ mode, setMode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menü"
        aria-expanded={open}
        title="Menü"
        style={{ ...S.fab, ...MENU.fab }}
      >
        ☰
      </button>
      {open && (
        <>
          <div style={MENU.backdrop} onClick={() => setOpen(false)} />
          <div style={MENU.panel}>
            {MENU_ITEMS.map((it) => (
              <button
                key={it.key}
                onClick={() => { setMode(it.key); setOpen(false); }}
                style={{ ...MENU.item, ...(it.key === mode ? MENU.itemOn : {}) }}
              >
                <span style={MENU.itemIcon}>{it.icon}</span>
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ── Element-Chip ──
function Elem({ name }) {
  const c = ELEM[name] || "#9fb6e6";
  return <span style={{ ...TH.elem, color: c, borderColor: c + "66" }}>{name}</span>;
}

// ── Schatz-Rechner ──
function TreasureCalc() {
  const [calc, setCalc] = useState({ qty: {}, price: {}, goal: 90000, custom: [] });
  const [q, setQ] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(TREASURE_KEY);
        if (r && r.value) {
          const d = JSON.parse(r.value);
          setCalc({
            qty: d.qty || {}, price: d.price || {},
            goal: typeof d.goal === "number" ? d.goal : 90000,
            custom: Array.isArray(d.custom) ? d.custom : [],
          });
        }
      } catch (e) {}
    })();
  }, []);

  const update = (fn) => setCalc((prev) => {
    const next = fn(prev);
    (async () => { try { await window.storage.set(TREASURE_KEY, JSON.stringify(next)); } catch (e) {} })();
    return next;
  });

  const num = (v) => { const x = parseInt(String(v).replace(/[^\d]/g, ""), 10); return isNaN(x) ? 0 : Math.max(0, x); };

  const setQty = (n, v) => update((p) => {
    const qty = { ...p.qty }; const x = num(v);
    if (x > 0) qty[n] = x; else delete qty[n];
    return { ...p, qty };
  });
  const setPrice = (n, v) => update((p) => {
    const price = { ...p.price }; const raw = String(v).trim();
    if (raw === "") delete price[n]; else price[n] = num(v);
    return { ...p, price };
  });
  const setGoal = (v) => update((p) => ({ ...p, goal: num(v) }));

  const addCustom = () => {
    const n = newName.trim();
    if (!n) return;
    const exists = TREASURES.some((t) => t.n.toLowerCase() === n.toLowerCase())
      || (calc.custom || []).some((c) => c.n.toLowerCase() === n.toLowerCase());
    if (exists) { window.alert("\"" + n + "\" steht schon in der Liste."); return; }
    const p0 = newPrice.trim() === "" ? null : num(newPrice);
    update((p) => ({ ...p, custom: [...(p.custom || []), { n, p: p0, b: "eigen", s: "selbst hinzugefuegt" }] }));
    setNewName(""); setNewPrice("");
  };
  const removeCustom = (n) => {
    if (!window.confirm("\"" + n + "\" aus der Liste entfernen?")) return;
    update((p) => {
      const qty = { ...p.qty }; delete qty[n];
      const price = { ...p.price }; delete price[n];
      return { ...p, qty, price, custom: (p.custom || []).filter((c) => c.n !== n) };
    });
  };

  const ALL = TREASURES.concat((calc.custom || []).map((c) => ({ ...c, custom: true })));

  const priceOf = (t) => (calc.price[t.n] != null ? calc.price[t.n] : (t.p != null ? t.p : 0));
  const total = ALL.reduce((s, t) => s + (calc.qty[t.n] || 0) * priceOf(t), 0);
  const picked = ALL.filter((t) => (calc.qty[t.n] || 0) > 0).length;
  const pct = calc.goal > 0 ? Math.min(100, Math.round((total / calc.goal) * 100)) : 0;
  const rest = Math.max(0, calc.goal - total);
  const reached = calc.goal > 0 && total >= calc.goal;

  const needle = q.trim().toLowerCase();
  const list = needle
    ? ALL.filter((t) => (t.n + " " + t.b + " " + t.s).toLowerCase().includes(needle))
    : ALL;

  const clearAll = () => {
    if (!window.confirm("Alle eingetragenen Mengen zuruecksetzen? (Preise & Ziel bleiben erhalten)")) return;
    update((p) => ({ ...p, qty: {} }));
  };

  return (
    <div>
      {/* Summe & Ziel */}
      <section style={{ ...TH.card, ...(reached ? TH.calcCardOk : {}) }}>
        <div style={TH.calcTotalRow}>
          <div>
            <div style={TH.ovLabel}>Verkaufswert</div>
            <div style={{ ...TH.calcTotal, ...(reached ? { color: "#b6f07a" } : {}) }}>{yen(total)} ¥</div>
            <div style={TH.calcMeta}>{picked} {picked === 1 ? "Schatz" : "Schaetze"} eingetragen</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={TH.ovLabel}>Ziel</div>
            <input
              inputMode="numeric" value={calc.goal === 0 ? "" : calc.goal}
              onChange={(e) => setGoal(e.target.value)}
              style={TH.goalInput} aria-label="Geldziel"
            />
            <div style={TH.calcMeta}>{reached ? "erreicht ✓" : "noch " + yen(rest) + " ¥"}</div>
          </div>
        </div>
        <div style={TH.calcTrack}>
          <div style={{ ...TH.calcFill, width: pct + "%", ...(reached ? TH.calcFillOk : {}) }} />
        </div>
        <div style={TH.calcPct}>{pct}%</div>
      </section>

      {/* Suche + Reset */}
      <div style={TH.calcTools}>
        <div style={TH.searchWrap}>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Schatz suchen (Name oder Block)…"
            style={TH.search} aria-label="Schatz suchen"
          />
          {q && <button onClick={() => setQ("")} style={TH.searchClear} aria-label="Suche leeren">×</button>}
        </div>
        <button onClick={clearAll} style={TH.resetBtn}>Zuruecksetzen</button>
      </div>

      {/* Liste */}
      <section style={TH.card}>
        {list.length === 0 && <div style={TH.calcEmpty}>Kein Schatz gefunden.</div>}
        {list.map((t, i) => {
          const qv = calc.qty[t.n] || 0;
          const pv = priceOf(t);
          const sub = qv * pv;
          const unknown = t.p == null && calc.price[t.n] == null;
          return (
            <div key={t.n} style={{ ...TH.trRow, borderTop: i === 0 ? "none" : "1px solid #1d2a12", ...(qv > 0 ? TH.trRowOn : {}) }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={TH.trName}>{t.n}{unknown && <span style={TH.trWarn} title="Preis laut Guide unbekannt">⚠</span>}</div>
                <div style={TH.trSrc}>{t.b} · {t.s}</div>
                <div style={TH.trInputs}>
                  <input
                    inputMode="numeric" value={calc.price[t.n] != null ? calc.price[t.n] : (t.p != null ? t.p : "")}
                    onChange={(e) => setPrice(t.n, e.target.value)}
                    placeholder="Preis" style={TH.priceInput} aria-label={"Preis " + t.n}
                  />
                  <span style={TH.trTimes}>¥ ×</span>
                  <input
                    inputMode="numeric" value={qv === 0 ? "" : qv}
                    onChange={(e) => setQty(t.n, e.target.value)}
                    placeholder="0" style={{ ...TH.qtyInput, ...(qv > 0 ? TH.qtyInputOn : {}) }} aria-label={"Anzahl " + t.n}
                  />
                </div>
              </div>
              <div style={{ ...TH.trSub, ...(qv > 0 ? { color: "#b6f07a" } : {}) }}>{qv > 0 ? yen(sub) + " ¥" : "—"}</div>
              {t.custom && (
                <button onClick={() => removeCustom(t.n)} style={TH.trDel} aria-label={"Entfernen " + t.n}>×</button>
              )}
            </div>
          );
        })}
      </section>

      {/* Eigenen Schatz hinzufuegen */}
      <div style={TH.sectionLabel}>+ Eigener Schatz</div>
      <section style={TH.card}>
        <div style={TH.addRow}>
          <input
            value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
            placeholder="Name (z. B. Arqa Luminary)" style={TH.addName} aria-label="Name des Schatzes"
          />
          <input
            inputMode="numeric" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
            placeholder="Preis" style={TH.addPrice} aria-label="Preis des Schatzes"
          />
          <button onClick={addCustom} style={TH.addBtn}>+</button>
        </div>
        <div style={TH.addHint}>Fehlt ein Item? Trag es hier ein — es wird gespeichert und in die Summe eingerechnet.</div>
      </section>

      <div style={TH.footer}>
        Preise: game8.co ⚠ Liste ist unvollstaendig, Preise koennen je nach Schwierigkeitsgrad abweichen — jeder Preis ist editierbar und wird gespeichert.
      </div>
    </div>
  );
}

// ── Tartarus-Tab (Dark-Hour-Theme) ──
function TartarusTab({ mode, setMode }) {
  const [bi, setBi] = useState(0);
  const [openGk, setOpenGk] = useState({});
  const b = TARTARUS[bi];
  const toggleGk = (i) => setOpenGk((p) => ({ ...p, [`${bi}-${i}`]: !p[`${bi}-${i}`] }));

  return (
    <div>
      <header style={TH.header}>
        <div style={TH.titleRow}>
          <ModeButton mode={mode} setMode={setMode} />
          <span style={TH.moon}>☾</span>
          <div>
            <div style={TH.eyebrow}>DARK HOUR</div>
            <h1 style={TH.h1}>Tartarus</h1>
          </div>
          <div style={{ marginLeft: "auto" }}><BurgerMenu mode={mode} setMode={setMode} /></div>
        </div>
        <div style={TH.blockStrip} className="hide-scroll">
          {TARTARUS.map((blk, i) => (
            <button key={blk.id} onClick={() => setBi(i)} style={{ ...TH.blockPill, ...(i === bi ? TH.blockPillOn : {}) }}>
              <span style={{ fontWeight: 800 }}>{blk.name}</span>
              <span style={TH.blockSub}>{blk.floors}</span>
            </button>
          ))}
        </div>
      </header>

      <main style={TH.main}>
        {/* Übersicht */}
        <section style={TH.card}>
          <div style={TH.ovTop}>
            <div>
              <div style={TH.blockName}>{b.name}</div>
              <div style={TH.blockSub2}>{b.sub}</div>
            </div>
            <div style={TH.ovStats}>
              <div><span style={TH.ovLabel}>Etagen</span><span style={TH.ovVal}>{b.floors}</span></div>
              <div><span style={TH.ovLabel}>Ziel</span><span style={TH.ovVal}>{b.goal}</span></div>
              <div><span style={TH.ovLabel}>Level</span><span style={TH.ovVal}>{b.level}</span></div>
            </div>
          </div>
          <p style={TH.light}>{b.light}</p>
        </section>

        {/* Gatekeeper */}
        <div style={TH.sectionLabel}>⚔ Gatekeeper</div>
        {b.gatekeepers.map((g, i) => {
          const open = openGk[`${bi}-${i}`];
          return (
            <section key={i} style={TH.gkCard}>
              <button style={TH.gkHead} onClick={() => toggleGk(i)}>
                <span style={TH.gkFloor}>{g.floor}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={TH.gkName}>{g.name}</div>
                  <div style={TH.gkWeakRow}>
                    {g.weak.length ? g.weak.map((w) => <Elem key={w} name={w} />) : <span style={TH.gkNoWeak}>keine Schwäche</span>}
                  </div>
                </div>
                <span style={{ ...TH.chev, transform: open ? "rotate(90deg)" : "none" }}>›</span>
              </button>
              {open && (
                <div style={TH.gkBody}>
                  <div style={TH.gkRes}>{g.res}</div>
                  <div style={TH.gkSupport}>Begleitung: {g.support}</div>
                  <div style={TH.gkStrat}>{g.strat}</div>
                </div>
              )}
            </section>
          );
        })}

        {/* Häufige Gegner */}
        <div style={TH.sectionLabel}>Häufige Gegner & Schwächen</div>
        <section style={TH.card}>
          {b.common.map(([name, weaks], i) => (
            <div key={i} style={{ ...TH.enemyRow, borderTop: i === 0 ? "none" : "1px solid #1d2a12" }}>
              <span style={TH.enemyName}>{name}</span>
              <span style={TH.enemyWeaks}>{weaks.map((w) => <Elem key={w} name={w} />)}</span>
            </div>
          ))}
        </section>

        {/* Tipps */}
        <div style={TH.sectionLabel}>✦ Block-Tipps</div>
        <section style={TH.card}>
          {b.tips.map((t, i) => (
            <div key={i} style={{ ...TH.tipRow, borderTop: i === 0 ? "none" : "1px solid #1d2a12" }}>
              <span style={TH.tipDot}>›</span><span>{t}</span>
            </div>
          ))}
        </section>

        <div style={TH.footer}>Daten: game8.co · Tartarus-Blöcke Thebel–Adamah (komplett)</div>
      </main>
    </div>
  );
}

// ── Elizabeth-Request-Tracker ──
function ElizabethTab() {
  const [done, setDone] = useState({});
  const [openIds, setOpenIds] = useState({});
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(ELIZABETH_KEY);
        if (r && r.value) {
          const d = JSON.parse(r.value);
          setDone(d.done || {});
        }
      } catch (e) {}
    })();
  }, []);

  const persist = (next) => {
    (async () => { try { await window.storage.set(ELIZABETH_KEY, JSON.stringify({ done: next })); } catch (e) {} })();
  };

  const toggleDone = (id) => setDone((prev) => {
    const next = { ...prev, [id]: !prev[id] };
    if (!next[id]) delete next[id];
    persist(next);
    return next;
  });

  const toggleOpen = (id) => setOpenIds((p) => ({ ...p, [id]: !p[id] }));

  const total = ELIZABETH_REQUESTS.length;
  const completedCount = ELIZABETH_REQUESTS.filter((r) => done[r.id]).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;

  const needle = q.trim().toLowerCase();
  const list = needle
    ? ELIZABETH_REQUESTS.filter((r) => (r.name + " " + r.reward).toLowerCase().includes(needle))
    : ELIZABETH_REQUESTS;

  return (
    <div>
      <section style={TH.card}>
        <div style={TH.calcTotalRow}>
          <div>
            <div style={TH.ovLabel}>Fortschritt</div>
            <div style={TH.calcTotal}>{completedCount} / {total}</div>
          </div>
        </div>
        <div style={TH.calcTrack}><div style={{ ...TH.calcFill, width: `${pct}%` }} /></div>
        <div style={TH.calcPct}>{pct}%</div>
      </section>

      <div style={TH.calcTools}>
        <div style={TH.searchWrap}>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Request suchen (Name oder Belohnung)…"
            style={TH.search} aria-label="Request suchen"
          />
          {q && <button onClick={() => setQ("")} style={TH.searchClear} aria-label="Suche leeren">×</button>}
        </div>
      </div>

      {list.length === 0 && <div style={TH.calcEmpty}>Kein Request gefunden.</div>}
      {list.map((r) => {
        const open = !!openIds[r.id];
        const isDone = !!done[r.id];
        const critical = !!r.deadline;
        return (
          <section key={r.id} style={TH.gkCard}>
            <button style={TH.gkHead} onClick={() => toggleOpen(r.id)}>
              <span style={{ ...TH.gkFloor, ...(critical ? { borderColor: "#ff5f6b", color: "#ff8f97" } : {}) }}>#{r.id}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ ...TH.gkName, ...(isDone ? { opacity: .55, textDecoration: "line-through" } : {}) }}>{r.name}</div>
                <div style={TH.gkWeakRow}>
                  <span style={TH.blockSub}>ab {r.available}</span>
                  {critical && <span style={{ color: "#ff8f97", fontWeight: 700, fontSize: 11 }}>⚠ Frist: {r.deadline}</span>}
                  {isDone && <span style={{ color: "#8fce5a", fontWeight: 700, fontSize: 11 }}>✓ erledigt</span>}
                </div>
              </div>
              <span style={{ ...TH.chev, transform: open ? "rotate(90deg)" : "none" }}>›</span>
            </button>
            {open && (
              <div style={TH.gkBody}>
                {r.prereq && <div style={TH.gkSupport}>Voraussetzung: {r.prereq}</div>}
                <div style={TH.gkStrat}>{r.req}</div>
                <div style={{ ...TH.gkRes, marginTop: 8, marginBottom: 0 }}>Belohnung: {r.reward}</div>
                <button
                  style={{ ...S.dayAllBtn, ...(isDone ? S.dayAllBtnDone : {}) }}
                  onClick={() => toggleDone(r.id)}
                >
                  {isDone ? "↺ Als offen markieren" : "✓ Als erledigt markieren"}
                </button>
              </div>
            )}
          </section>
        );
      })}

      <div style={TH.footer}>Daten: rpgsite.net · Elizabeth-Requests (Quest 91 & 101: Details in der Quelle unvollständig ⚠)</div>
    </div>
  );
}

const S = {
  root: { minHeight: "100vh", background: "radial-gradient(120% 80% at 50% -10%, #14203f 0%, #0a0e1c 55%, #060812 100%)", color: "#e7ecf7", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", paddingBottom: 96 },
  rootDark: { minHeight: "100vh", background: "radial-gradient(120% 80% at 50% -10%, #18260f 0%, #0b1207 55%, #05080300 100%), #060a04", color: "#e3ead6", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", paddingBottom: 40 },
  fab: { width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 19, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 },
  fabCal: { background: "linear-gradient(160deg,#29c5f6,#1a72ff)", boxShadow: "0 0 14px rgba(41,197,246,.5)" },
  fabTar: { background: "linear-gradient(160deg,#9bf06a,#5fb83a)", boxShadow: "0 0 14px rgba(143,224,90,.5)" },
  topLeft: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },

  header: { position: "sticky", top: 0, zIndex: 20, background: "rgba(8,11,22,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #18213d", padding: "12px 12px 10px" },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 720, margin: "0 auto" },
  eyebrow: { fontSize: 11, letterSpacing: "0.26em", color: "#5fb8ff", fontWeight: 700 },
  totalProg: { fontSize: 12.5 },
  headTrack: { height: 5, borderRadius: 99, background: "#161e36", overflow: "hidden", maxWidth: 720, margin: "8px auto 10px", border: "1px solid #222d4d" },
  headFill: { height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#1a72ff,#29c5f6)", transition: "width .4s ease", boxShadow: "0 0 10px rgba(41,197,246,.6)" },
  monthSwitch: { display: "flex", gap: 6, maxWidth: 720, margin: "10px auto 0", background: "#0d1428", border: "1px solid #1d2849", borderRadius: 99, padding: 4, overflowX: "auto", scrollbarWidth: "none" },
  monthBtn: { flex: "1 0 auto", minWidth: 72, padding: "8px 12px", borderRadius: 99, border: "none", background: "transparent", color: "#8aa0cf", fontWeight: 700, fontSize: 13.5, cursor: "pointer", transition: "all .15s ease" },
  monthBtnOn: { background: "linear-gradient(160deg,#29c5f6,#1a72ff)", color: "#06121f", boxShadow: "0 0 12px rgba(41,197,246,.4)" },

  strip: { display: "flex", gap: 7, overflowX: "auto", maxWidth: 720, margin: "0 auto", paddingBottom: 2, scrollbarWidth: "none" },
  pill: { flexShrink: 0, width: 50, height: 56, borderRadius: 12, border: "1px solid #243a6e", background: "linear-gradient(160deg,#121c3a,#0d1428)", color: "#cdd8f0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, position: "relative", transition: "transform .15s ease" },
  pillActive: { background: "linear-gradient(160deg,#29c5f6,#1a72ff)", borderColor: "#29c5f6", boxShadow: "0 0 14px rgba(41,197,246,.5)", transform: "translateY(-1px)" },
  pillDone: { borderColor: "rgba(125,249,168,.4)" },
  pillMon: { fontSize: 8, letterSpacing: "0.18em", color: "#5fb8ff", fontWeight: 700 },
  pillNum: { fontSize: 20, fontWeight: 800, lineHeight: 1, color: "#dde8ff" },
  pillDot: { width: 5, height: 5, borderRadius: 99, marginTop: 1 },
  pillYen: { position: "absolute", top: 4, right: 5, fontSize: 9, fontWeight: 800, lineHeight: 1 },
  pillTips: { width: 58, background: "linear-gradient(160deg,#1c1640,#120c28)", borderColor: "#3a2c6e" },
  pillTipsActive: { background: "linear-gradient(160deg,#b98cff,#7d5bd6)", borderColor: "#b98cff", boxShadow: "0 0 14px rgba(185,140,255,.5)" },

  main: { maxWidth: 720, margin: "0 auto", padding: "16px 14px 0", animation: "fade .28s ease" },
  sheet: { background: "linear-gradient(180deg,#101730,#0b1124)", border: "1px solid #1d2849", borderRadius: 18, padding: "16px 16px 18px", boxShadow: "0 1px 0 rgba(255,255,255,.03) inset" },
  sheetDone: { borderColor: "rgba(125,249,168,.3)", boxShadow: "0 0 0 1px rgba(125,249,168,.12)" },

  dayHero: { display: "flex", alignItems: "center", gap: 14, paddingBottom: 6 },
  heroDate: { width: 58, height: 58, borderRadius: 14, background: "linear-gradient(160deg,#16234a,#0e1730)", border: "1px solid #2a3b6e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  heroMon: { fontSize: 9.5, letterSpacing: "0.2em", color: "#5fb8ff", fontWeight: 700 },
  heroNum: { fontSize: 28, fontWeight: 800, lineHeight: 1, color: "#e6eeff" },
  heroTitle: { fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.01em", background: "linear-gradient(180deg,#fff,#9cc8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroMeta: { fontSize: 13, marginTop: 3 },
  miniToggle: { fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 99, border: "1px solid #2a3760", background: "#101830", color: "#8aa0cf", cursor: "pointer", flexShrink: 0, alignSelf: "flex-start" },
  miniToggleOn: { borderColor: "#29c5f6", color: "#29c5f6", background: "rgba(41,197,246,.08)" },
  dayAllBtn: { width: "100%", marginTop: 12, padding: "11px", borderRadius: 12, border: "1px solid #29c5f6", background: "rgba(41,197,246,.12)", color: "#bfe6ff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", letterSpacing: ".02em" },
  dayAllBtnDone: { borderColor: "rgba(125,249,168,.45)", background: "rgba(125,249,168,.1)", color: "#9ff5c0" },
  pillWarn: { fontSize: 9, lineHeight: 1, marginTop: 1 },
  spoilerBand: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,95,107,.09)", border: "1px solid rgba(255,95,107,.28)", borderLeft: "3px solid #ff5f6b", color: "#f3cdd2", fontSize: 12.5, lineHeight: 1.5 },
  spoilerIcon: { flexShrink: 0, color: "#ff8f97", fontSize: 14, lineHeight: 1.35 },

  slot: { borderTop: "1px solid #18213d", paddingTop: 12, marginTop: 10 },
  slotLabel: { fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6f80ac", fontWeight: 700, marginBottom: 8 },
  task: { display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0" },
  check: { width: 28, height: 28, borderRadius: 8, border: "1.5px solid #34406b", background: "#0c1226", color: "#0a0e1c", fontWeight: 900, fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkOn: { background: "linear-gradient(160deg,#29c5f6,#1a72ff)", borderColor: "#29c5f6", color: "#06121f", boxShadow: "0 0 10px rgba(41,197,246,.5)" },
  taskLabel: { fontSize: 15, lineHeight: 1.35, fontWeight: 500 },
  taskLabelDone: { opacity: .4, textDecoration: "line-through" },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", padding: "2px 8px", borderRadius: 99, border: "1px solid", background: "rgba(255,255,255,.02)" },
  answer: { marginTop: 8, fontSize: 12.5, lineHeight: 1.5, color: "#bcd0f5", whiteSpace: "pre-line", background: "rgba(41,197,246,.06)", border: "1px solid rgba(41,197,246,.18)", borderLeft: "3px solid #29c5f6", borderRadius: 8, padding: "8px 11px" },
  answerToggle: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: ".02em", padding: "5px 11px", borderRadius: 99, border: "1px solid #2a3760", background: "#0e1730", color: "#9fb6e6", cursor: "pointer" },
  answerToggleOn: { borderColor: "#29c5f6", color: "#29c5f6", background: "rgba(41,197,246,.08)" },
  answerChevron: { fontSize: 15, lineHeight: 1, transition: "transform .2s ease" },
  noChoice: { marginTop: 7, fontSize: 11, color: "#5d6b92", fontStyle: "italic" },
  bossToggle: { borderColor: "#ff5f6b55", color: "#ff8f97" },
  bossToggleOn: { borderColor: "#ff5f6b", color: "#ff5f6b", background: "rgba(255,95,107,.1)" },
  bossInfo: { marginTop: 8, fontSize: 12.5, lineHeight: 1.55, color: "#f3cdd2", whiteSpace: "pre-line", background: "rgba(255,95,107,.07)", border: "1px solid rgba(255,95,107,.22)", borderLeft: "3px solid #ff5f6b", borderRadius: 8, padding: "9px 11px" },

  tip: { display: "flex", gap: 12, padding: "10px 0", fontSize: 14, lineHeight: 1.5, color: "#cdd8f0", borderBottom: "1px solid #18213d" },
  tipNum: { color: "#b98cff", fontWeight: 800, fontSize: 12, flexShrink: 0, paddingTop: 2 },

  nav: { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 8, maxWidth: 720, margin: "0 auto", padding: "10px 12px", background: "rgba(8,11,22,.94)", backdropFilter: "blur(10px)", borderTop: "1px solid #18213d" },
  navBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 10px", borderRadius: 12, border: "1px solid #29c5f6", background: "rgba(41,197,246,.1)", color: "#bfe6ff", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  navOff: { opacity: .3, borderColor: "#2a3760", color: "#6f80ac", background: "transparent", cursor: "default" },
  navArrow: { fontSize: 20, lineHeight: 1 },
  navCenter: { width: 96, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#dde8ff", display: "flex", flexDirection: "column", lineHeight: 1.3 },
  navCount: { fontSize: 10.5, opacity: .5, fontWeight: 600 },

  resetInline: { display: "block", margin: "16px auto 0", padding: "9px 16px", borderRadius: 99, border: "1px solid #4a2c3a", background: "transparent", color: "#e08aa0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" },

  budget: { marginTop: 12, borderRadius: 12, border: "1px solid rgba(255,211,77,.22)", background: "rgba(255,211,77,.05)", padding: "11px 13px" },
  budgetHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#f3e6bf", fontWeight: 600 },
  budgetCoin: { width: 22, height: 22, borderRadius: 6, background: "rgba(255,211,77,.16)", color: "#ffd34d", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  budgetItems: { marginTop: 9, display: "flex", flexDirection: "column", gap: 5 },
  budgetRow: { display: "flex", alignItems: "baseline", gap: 6, fontSize: 12.5, color: "#cdd2c0" },
  budgetDots: { flex: 1, borderBottom: "1px dotted #4a4733", transform: "translateY(-3px)" },
  budgetIncome: { marginTop: 9, fontSize: 12, color: "#7df9a8", lineHeight: 1.45 },
  budgetTip: { marginTop: 8, fontSize: 12, color: "#bcd0f5", lineHeight: 1.5, borderLeft: "2px solid #29c5f6", paddingLeft: 9 },
};

// ── Dark-Hour-Theme (Tartarus) ──
const TH = {
  header: { position: "sticky", top: 0, zIndex: 20, background: "rgba(6,10,4,.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #1f2c12", padding: "12px 12px 10px" },
  titleRow: { display: "flex", alignItems: "center", gap: 12, maxWidth: 720, margin: "2px auto 0" },
  moon: { fontSize: 34, color: "#b6f07a", lineHeight: 1, textShadow: "0 0 16px rgba(155,240,106,.6)" },
  eyebrow: { fontSize: 10.5, letterSpacing: "0.34em", color: "#8fce5a", fontWeight: 700 },
  h1: { fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: "-0.01em", background: "linear-gradient(180deg,#eaffd4,#9bdd63)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  blockStrip: { display: "flex", gap: 7, overflowX: "auto", maxWidth: 720, margin: "12px auto 0", paddingBottom: 2, scrollbarWidth: "none" },
  blockPill: { flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "7px 14px", borderRadius: 12, border: "1px solid #2c3d18", background: "linear-gradient(160deg,#16210d,#0e1408)", color: "#c6d6ad", cursor: "pointer" },
  blockPillOn: { background: "linear-gradient(160deg,#9bf06a,#5fb83a)", borderColor: "#9bf06a", color: "#0a1505", boxShadow: "0 0 14px rgba(143,224,90,.45)" },
  blockSub: { fontSize: 10, opacity: .8 },

  main: { maxWidth: 720, margin: "0 auto", padding: "16px 14px 0", animation: "fade .28s ease" },
  card: { background: "linear-gradient(180deg,#111b0c,#0c1207)", border: "1px solid #233018", borderRadius: 16, padding: "14px 15px", marginBottom: 12 },
  ovTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
  blockName: { fontSize: 22, fontWeight: 800, color: "#eaffd4" },
  blockSub2: { fontSize: 12, color: "#8fa86e", marginTop: 2 },
  ovStats: { display: "flex", gap: 14 },
  ovLabel: { display: "block", fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#7f9a5e", fontWeight: 700 },
  ovVal: { display: "block", fontSize: 13, fontWeight: 700, color: "#d9e8c4", marginTop: 2 },
  light: { fontSize: 13, lineHeight: 1.55, color: "#bccea0", marginTop: 12, marginBottom: 0 },

  sectionLabel: { fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "#8fce5a", fontWeight: 800, margin: "6px 2px 8px" },

  gkCard: { background: "linear-gradient(180deg,#121d0b,#0c1207)", border: "1px solid #243218", borderRadius: 14, marginBottom: 9, overflow: "hidden" },
  gkHead: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 12, background: "none", border: "none", color: "inherit", cursor: "pointer" },
  gkFloor: { flexShrink: 0, minWidth: 42, height: 42, borderRadius: 10, background: "linear-gradient(160deg,#1c2c10,#101808)", border: "1px solid #35491f", color: "#b6f07a", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  gkName: { fontSize: 15.5, fontWeight: 700, color: "#e8f5d6" },
  gkWeakRow: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 },
  gkNoWeak: { fontSize: 11, color: "#ff8f97", fontWeight: 700 },
  chev: { fontSize: 24, color: "#5c7440", transition: "transform .2s ease", flexShrink: 0 },
  gkBody: { padding: "0 13px 13px 13px" },
  gkRes: { fontSize: 12.5, color: "#d6b86a", fontWeight: 600, marginBottom: 6 },
  gkSupport: { fontSize: 12, color: "#9fb87e", marginBottom: 8 },
  gkStrat: { fontSize: 13, lineHeight: 1.55, color: "#dbe7c8", background: "rgba(143,224,90,.06)", border: "1px solid rgba(143,224,90,.18)", borderLeft: "3px solid #8fce5a", borderRadius: 8, padding: "9px 11px" },

  elem: { fontSize: 10.5, fontWeight: 800, letterSpacing: ".03em", padding: "2px 8px", borderRadius: 99, border: "1px solid", background: "rgba(255,255,255,.03)" },

  enemyRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 0" },
  enemyName: { fontSize: 13.5, color: "#dbe7c8" },
  enemyWeaks: { display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "flex-end" },

  tipRow: { display: "flex", gap: 10, padding: "9px 0", fontSize: 13.5, lineHeight: 1.5, color: "#cfe0b6" },
  tipDot: { color: "#8fce5a", fontWeight: 800, flexShrink: 0 },

  // Schatz-Rechner
  calcCardOk: { borderColor: "rgba(155,240,106,.45)", boxShadow: "0 0 0 1px rgba(155,240,106,.15)" },
  calcTotalRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  calcTotal: { fontSize: 28, fontWeight: 800, color: "#eaffd4", letterSpacing: "-0.01em", marginTop: 2 },
  calcMeta: { fontSize: 11.5, color: "#8fa86e", marginTop: 3 },
  goalInput: { width: 110, marginTop: 3, padding: "5px 8px", textAlign: "right", fontSize: 16, fontWeight: 700, color: "#d9e8c4", background: "#0d1508", border: "1px solid #2c3d18", borderRadius: 8, outline: "none" },
  calcTrack: { height: 8, borderRadius: 99, background: "#1a2410", marginTop: 14, overflow: "hidden" },
  calcFill: { height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#5fb83a,#9bf06a)", transition: "width .35s ease" },
  calcFillOk: { boxShadow: "0 0 12px rgba(155,240,106,.7)" },
  calcPct: { textAlign: "right", fontSize: 11, color: "#8fa86e", marginTop: 5, fontWeight: 700 },

  calcTools: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  searchWrap: { position: "relative", flex: 1, minWidth: 0, display: "flex" },
  search: { width: "100%", boxSizing: "border-box", padding: "10px 32px 10px 12px", fontSize: 14, color: "#e3ead6", background: "#111b0c", border: "1px solid #243218", borderRadius: 12, outline: "none" },
  searchClear: { position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#7f9a5e", fontSize: 20, cursor: "pointer", padding: "0 7px", lineHeight: 1 },
  resetBtn: { flexShrink: 0, padding: "10px 12px", fontSize: 12.5, fontWeight: 700, color: "#ff9aa2", background: "rgba(255,95,107,.08)", border: "1px solid rgba(255,95,107,.3)", borderRadius: 12, cursor: "pointer" },

  trRow: { display: "flex", alignItems: "center", gap: 10, padding: "11px 0" },
  trRowOn: { background: "rgba(143,224,90,.05)" },
  trName: { fontSize: 14, fontWeight: 700, color: "#e8f5d6" },
  trWarn: { marginLeft: 6, fontSize: 11, color: "#ffd34d" },
  trSrc: { fontSize: 11, color: "#7f9a5e", marginTop: 1 },
  trInputs: { display: "flex", alignItems: "center", gap: 6, marginTop: 7 },
  priceInput: { width: 74, padding: "5px 7px", fontSize: 13, textAlign: "right", color: "#c6d6ad", background: "#0d1508", border: "1px solid #2c3d18", borderRadius: 7, outline: "none" },
  trTimes: { fontSize: 12, color: "#7f9a5e", fontWeight: 700 },
  qtyInput: { width: 56, padding: "5px 7px", fontSize: 14, fontWeight: 700, textAlign: "center", color: "#e8f5d6", background: "#0d1508", border: "1px solid #2c3d18", borderRadius: 7, outline: "none" },
  qtyInputOn: { borderColor: "#8fce5a", background: "rgba(143,224,90,.1)", color: "#b6f07a" },
  trSub: { flexShrink: 0, minWidth: 82, textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "#5c7440" },
  calcEmpty: { padding: "18px 0", textAlign: "center", fontSize: 13, color: "#7f9a5e" },
  trDel: { flexShrink: 0, marginLeft: 4, width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(255,95,107,.3)", background: "rgba(255,95,107,.08)", color: "#ff9aa2", fontSize: 16, lineHeight: 1, cursor: "pointer", padding: 0 },
  addRow: { display: "flex", gap: 7, alignItems: "center" },
  addName: { flex: 1, minWidth: 0, padding: "9px 11px", fontSize: 14, color: "#e3ead6", background: "#0d1508", border: "1px solid #2c3d18", borderRadius: 9, outline: "none" },
  addPrice: { width: 80, padding: "9px 9px", fontSize: 14, textAlign: "right", color: "#e3ead6", background: "#0d1508", border: "1px solid #2c3d18", borderRadius: 9, outline: "none" },
  addBtn: { flexShrink: 0, width: 40, height: 38, borderRadius: 9, border: "none", background: "linear-gradient(160deg,#9bf06a,#5fb83a)", color: "#0a1505", fontSize: 20, fontWeight: 800, cursor: "pointer", lineHeight: 1 },
  addHint: { marginTop: 9, fontSize: 11.5, color: "#7f9a5e", lineHeight: 1.5 },
  footer: { textAlign: "center", fontSize: 11.5, opacity: .4, padding: "16px 0 24px" },
};

// ── Burger-Menü (themenunabhängig) ──
const MENU = {
  fab: { background: "linear-gradient(160deg,#c79bff,#7d5bd6)", boxShadow: "0 0 14px rgba(185,140,255,.45)" },
  backdrop: { position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,.001)" },
  panel: {
    position: "fixed", top: 62, right: 16, zIndex: 41, width: 220,
    background: "linear-gradient(180deg,#171225,#0d0a17)", border: "1px solid #362a55",
    borderRadius: 14, boxShadow: "0 12px 30px rgba(0,0,0,.5)", padding: 6, display: "flex", flexDirection: "column", gap: 2,
  },
  item: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
    background: "none", border: "none", borderRadius: 9, color: "#d9d0f0", fontSize: 14, fontWeight: 600,
    textAlign: "left", cursor: "pointer",
  },
  itemOn: { background: "rgba(185,140,255,.16)", color: "#e9defc" },
  itemIcon: { width: 22, textAlign: "center", fontSize: 15, flexShrink: 0 },
};

const css = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  button:focus-visible { outline: 2px solid #29c5f6; outline-offset: 2px; }
  .hide-scroll::-webkit-scrollbar { display: none; }
  @keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { *, .hide-scroll { animation: none !important; transition: none !important; } }
`;
