# Thema: Vollständige Reparatur der CAGED-Logik und Tabulatoren

"Claude, bitte analysiere die Dateien cagedShapes.ts, cagedSystem.ts, cagedSystemEnhanced.ts und chordDatabase.ts. Repariere die fehlerhafte Darstellung der Akkorde im CAGED-System nach folgendem Plan:

Abkehr von der Datenbank-Abhängigkeit: Verlasse dich für CAGED-Voicings nicht mehr auf die chordDatabase.ts. Nutze stattdessen einen algorithmischen Ansatz. Die Datenbank sollte nur noch als Fallback für spezielle Open Chords dienen.

Definition der CAGED-Basis-Schablonen (in cagedShapes.ts): Erstelle eine Konstante CAGED_TEMPLATES, die die 5 Grundformen (C, A, G, E, D) als relative Offsets speichert. Jede Schablone muss definieren:

shapeName: (z.B. 'E-Shape')

rootString: Auf welcher Saite liegt der Grundton? (z.B. Saite 6 für E-Shape)

fretOffsets: Relative Abstände der anderen Töne zum Grundton (z.B. E-Shape: [0, 2, 2, 1, 0, 0] relativ zum Barre-Finger).

Implementierung der Transpositions-Logik (in cagedSystem.ts): Schreibe eine Funktion calculateVoicing(rootNote, shapeType), die:

Den Bund des rootNote auf der rootString der gewählten Schablone findet (z.B. A auf der 6. Saite ist Bund 5).

Alle anderen Saiten basierend auf den fretOffsets berechnet.

Validierung: Vergleiche die resultierenden Noten mit den theoretischen Noten von Tonal.js. Wenn eine Note nicht zum Akkord gehört, markiere die Saite als x (gedämpft) statt einen leeren/falschen Wert zu liefern.

Korrektur des C-Dur Fehlers: Stelle sicher, dass beim C-Dur Akkord im C-Shape die Saiten korrekt als [x, 3, 2, 0, 1, 0] berechnet werden und im A-Shape (am 3. Bund) als [x, 3, 5, 5, 5, 3].

Tests zur Absicherung: Erstelle eine Test-Routine, die für die Akkorde C, A, G, E und D jeweils alle 5 CAGED-Positionen generiert und prüft, ob kein null oder undefined in den Tabulatoren auftaucht."