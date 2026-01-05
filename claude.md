# 1. Sofortige Bugfixes

Korrektur-Logik: Tabulaturen dürfen keine leeren Saiten anzeigen, es sei denn, sie sind explizit Teil des Voicings. Implementiere eine Validierung, die sicherstellt, dass ein Akkord-Objekt immer 6 Saitenwerte enthält (0-24 oder null/x).

# 2. Core Logic: Das CAGED-System (Phase 1 Fokus)
Um "leere oder falsche Tabs" zu verhindern, nutzen wir einen hybriden Ansatz aus statischen Templates für die Grundformen und dynamischer Transposition.

Implementierungs-Strategie für Voicings:
Map der Basis-Shapes: Erstelle eine Konstante CAGED_SHAPES, die die Griffmuster für C, A, G, E, D (Dur und Moll) als "Relative Offsets" zum Root-Finger speichert.

Transpositions-Funktion: Eine Funktion getVoicing(rootNote, shapeType, quality) berechnet die absoluten Bünde.

Beispiel: Für Am im "E-Shape": Suche Root A auf der E-Saite (Bund 5). Wende das E-Moll-Barre-Muster relativ zu Bund 5 an.

Validierung: Jedes generierte Tab-Array muss gegen die Noten des Akkords (via Tonal.js) geprüft werden. Wenn die Note auf der Saite nicht zum Akkord gehört -> Error/Fallback.

# 3. Tool-Stack Integration (Die "Single Source of Truth")
Nutze die Bibliotheken streng getrennt nach Aufgaben:

Theorie: Tonal.js liefert nur die Notennamen (z.B. C, E, G).

Positionierung: Tonic.ts oder eine eigene Logik berechnet, wo diese Noten auf dem Griffbrett liegen.

Rendering: VexChords für die statischen Chord-Boxen. alphaTab für die Tabulatur-Zeile.

## 4. Test-Driven Development (TDD) für Akkorde
Um Kreisdrehungen zu vermeiden, müssen Tests die Logik absichern:

Unit Tests: Prüfe, ob getVoicing("C", "A-Shape", "major") exakt [x, 3, 5, 5, 5, 3] zurückgibt.

Visual Regression: Screenshots der gerenderten SVG-Diagramme vergleichen.

## 5. Erweiterter Fahrplan (Refined Phase 1 & 2)
Phase 1: CAGED & Modals
Modal-Fenster: Bei Doppelklick auf einen Akkord öffnet sich ein Overlay.

Grid-Ansicht: Zeige alle 5 CAGED-Positionen gleichzeitig an, damit der User die Logik versteht.

Zusatz-Akkorde: Implementiere maj7, dom7, m7 durch Modifikation der Basis-Shapes (z.B. im E-Shape die Quinte auf der D-Saite um 2 Bünde senken für 7).

# Phase 2: Interaktive Tabulatur
AlphaTab Integration: Nutze AlphaTab für die Wiedergabe.

Synchronisation: Wenn der User im Tab auf eine Note klickt, muss diese auf dem Fretboard aufleuchten.


## Phase 3

1. Custom Progression Builder: User können eigene Akkordfolgen speichern und per Drag-and-Drop arrangieren.

2. Backing Track Player: Generierung einfacher MIDI-Backing-Tracks basierend auf den gewählten Tonarten und Progressions, zu denen man direkt solieren kann.

3. Reverse Chord Finder: Der User klickt Noten auf dem interaktiven Fretboard an, und die App benennt den resultierenden Akkord.

## Phase 4

1. Stimmgerät (Tuner): Ein Browser-basiertes Stimmgerät via Web Audio API, um die App zum "All-in-One"-Begleiter beim Aufmachen des Gitarrenkoffers zu machen.

2. Ear Training Game: Ein Quiz-Modus, bei dem die App einen Akkord oder ein Intervall spielt und der User den Typ (z.B. Dur vs. Moll) auf dem Fretboard bestimmen muss.

## Phase 5 Polishing 

1. Polish Frontend with light and dark theme 
2. Re-arrange the elements for the optimal User Experience 
3. Implement Backend to store data and a User Management (Firebase?) 

## Phase 6 QA and Testing 
1. Write Unit and E2E Tests 
2. Run this tests and fix all bugs so that we reach about 85% fullfilment‚ 
 