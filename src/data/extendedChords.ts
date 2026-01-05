// Extended Chord Shapes: 7th Chords and Sus Chords
// Format: [E(low), A, D, G, B, E(high)] - from 6th string to 1st string
// -1 = muted, 0 = open, numbers = fret positions

export const extendedChordShapes: { [key: string]: number[] } = {
  // ========== MAJOR 7TH CHORDS (maj7) ==========
  // Major 7th: Root, Major 3rd, Perfect 5th, Major 7th (1-3-5-7)

  'Cmaj7': [-1, 3, 2, 0, 0, 0],     // x32000
  'C#maj7': [-1, -1, 3, 1, 1, 1],   // xx3111 (barre)
  'Dbmaj7': [-1, -1, 3, 1, 1, 1],   // same as C#maj7
  'Dmaj7': [-1, -1, 0, 2, 2, 2],    // xx0222
  'D#maj7': [-1, -1, 1, 3, 3, 3],   // xx1333
  'Ebmaj7': [-1, -1, 1, 3, 3, 3],   // same as D#maj7
  'Emaj7': [0, 2, 1, 1, 0, 0],      // 021100
  'Fmaj7': [1, 3, 2, 2, 1, 0],      // 132210 or [-1, -1, 3, 2, 1, 0]
  'F#maj7': [2, 4, 3, 3, 2, 2],     // 243322 (barre)
  'Gbmaj7': [2, 4, 3, 3, 2, 2],     // same as F#maj7
  'Gmaj7': [3, 2, 0, 0, 0, 2],      // 320002
  'G#maj7': [4, 6, 5, 5, 4, 4],     // 465544 (barre)
  'Abmaj7': [4, 6, 5, 5, 4, 4],     // same as G#maj7
  'Amaj7': [-1, 0, 2, 1, 2, 0],     // x02120
  'A#maj7': [-1, 1, 3, 2, 3, 1],    // x13231 (barre)
  'Bbmaj7': [-1, 1, 3, 2, 3, 1],    // same as A#maj7
  'Bmaj7': [-1, 2, 4, 3, 4, 2],     // x24342 (barre)

  // ========== MINOR 7TH CHORDS (min7 or m7) ==========
  // Minor 7th: Root, Minor 3rd, Perfect 5th, Minor 7th (1-b3-5-b7)

  'Cm7': [-1, 3, 1, 3, 4, 3],       // x31343 (barre) or [-1, 3, 1, 3, 1, 3]
  'C#m7': [-1, -1, 2, 4, 2, 4],     // xx2424
  'Dbm7': [-1, -1, 2, 4, 2, 4],     // same as C#m7
  'Dm7': [-1, -1, 0, 2, 1, 1],      // xx0211
  'D#m7': [-1, -1, 1, 3, 2, 2],     // xx1322
  'Ebm7': [-1, -1, 1, 3, 2, 2],     // same as D#m7
  'Em7': [0, 2, 0, 0, 0, 0],        // 020000 or [0, 2, 2, 0, 3, 0]
  'Fm7': [1, 3, 1, 1, 1, 1],        // 131111 (barre)
  'F#m7': [2, 4, 2, 2, 2, 2],       // 242222 (barre)
  'Gbm7': [2, 4, 2, 2, 2, 2],       // same as F#m7
  'Gm7': [3, 5, 3, 3, 3, 3],        // 353333 (barre)
  'G#m7': [4, 6, 4, 4, 4, 4],       // 464444 (barre)
  'Abm7': [4, 6, 4, 4, 4, 4],       // same as G#m7
  'Am7': [-1, 0, 2, 0, 1, 0],       // x02010
  'A#m7': [-1, 1, 3, 1, 2, 1],      // x13121 (barre)
  'Bbm7': [-1, 1, 3, 1, 2, 1],      // same as A#m7
  'Bm7': [-1, 2, 4, 2, 3, 2],       // x24232 (barre)

  // ========== DOMINANT 7TH CHORDS (7) ==========
  // Dominant 7th: Root, Major 3rd, Perfect 5th, Minor 7th (1-3-5-b7)

  'C7': [-1, 3, 2, 3, 1, 0],        // x32310
  'C#7': [-1, -1, 3, 4, 2, 4],      // xx3424
  'Db7': [-1, -1, 3, 4, 2, 4],      // same as C#7
  'D7': [-1, -1, 0, 2, 1, 2],       // xx0212
  'D#7': [-1, -1, 1, 3, 2, 3],      // xx1323
  'Eb7': [-1, -1, 1, 3, 2, 3],      // same as D#7
  'E7': [0, 2, 0, 1, 0, 0],         // 020100 or [0, 2, 2, 1, 3, 0]
  'F7': [1, 3, 1, 2, 1, 1],         // 131211 (barre)
  'F#7': [2, 4, 2, 3, 2, 2],        // 242322 (barre)
  'Gb7': [2, 4, 2, 3, 2, 2],        // same as F#7
  'G7': [3, 2, 0, 0, 0, 1],         // 320001
  'G#7': [4, 6, 4, 5, 4, 4],        // 464544 (barre)
  'Ab7': [4, 6, 4, 5, 4, 4],        // same as G#7
  'A7': [-1, 0, 2, 0, 2, 0],        // x02020
  'A#7': [-1, 1, 3, 1, 3, 1],       // x13131 (barre)
  'Bb7': [-1, 1, 3, 1, 3, 1],       // same as A#7
  'B7': [-1, 2, 1, 2, 0, 2],        // x21202

  // ========== SUS2 CHORDS ==========
  // Suspended 2nd: Root, Major 2nd, Perfect 5th (1-2-5)
  // Replaces the 3rd with the 2nd

  'Csus2': [-1, 3, 0, 0, 3, 3],     // x30033
  'C#sus2': [-1, -1, 3, 3, 4, 4],   // xx3344
  'Dbsus2': [-1, -1, 3, 3, 4, 4],   // same as C#sus2
  'Dsus2': [-1, -1, 0, 2, 3, 0],    // xx0230
  'D#sus2': [-1, -1, 1, 3, 4, 1],   // xx1341
  'Ebsus2': [-1, -1, 1, 3, 4, 1],   // same as D#sus2
  'Esus2': [0, 2, 4, 4, 0, 0],      // 024400 or [0, 2, 2, 4, 5, 2]
  'Fsus2': [-1, -1, 3, 0, 1, 1],    // xx3011
  'F#sus2': [2, 4, 4, 1, 2, 2],     // 244122
  'Gbsus2': [2, 4, 4, 1, 2, 2],     // same as F#sus2
  'Gsus2': [3, 0, 0, 0, 3, 3],      // 300033
  'G#sus2': [4, 6, 6, 3, 4, 4],     // 466344
  'Absus2': [4, 6, 6, 3, 4, 4],     // same as G#sus2
  'Asus2': [-1, 0, 2, 2, 0, 0],     // x02200
  'A#sus2': [-1, 1, 3, 3, 1, 1],    // x13311
  'Bbsus2': [-1, 1, 3, 3, 1, 1],    // same as A#sus2
  'Bsus2': [-1, 2, 4, 4, 2, 2],     // x24422

  // ========== SUS4 CHORDS ==========
  // Suspended 4th: Root, Perfect 4th, Perfect 5th (1-4-5)
  // Replaces the 3rd with the 4th

  'Csus4': [-1, 3, 3, 0, 1, 1],     // x33011
  'C#sus4': [-1, -1, 3, 3, 4, 4],   // xx3344 (barre)
  'Dbsus4': [-1, -1, 3, 3, 4, 4],   // same as C#sus4
  'Dsus4': [-1, -1, 0, 2, 3, 3],    // xx0233
  'D#sus4': [-1, -1, 1, 3, 4, 4],   // xx1344
  'Ebsus4': [-1, -1, 1, 3, 4, 4],   // same as D#sus4
  'Esus4': [0, 2, 2, 2, 0, 0],      // 022200
  'Fsus4': [-1, -1, 3, 3, 1, 1],    // xx3311
  'F#sus4': [2, 4, 4, 4, 2, 2],     // 244422 (barre)
  'Gbsus4': [2, 4, 4, 4, 2, 2],     // same as F#sus4
  'Gsus4': [3, 3, 0, 0, 1, 3],      // 330013
  'G#sus4': [4, 6, 6, 6, 4, 4],     // 466644 (barre)
  'Absus4': [4, 6, 6, 6, 4, 4],     // same as G#sus4
  'Asus4': [-1, 0, 2, 2, 3, 0],     // x02230
  'A#sus4': [-1, 1, 3, 3, 4, 1],    // x13341 (barre)
  'Bbsus4': [-1, 1, 3, 3, 4, 1],    // same as A#sus4
  'Bsus4': [-1, 2, 4, 4, 5, 2],     // x24452 (barre)
};

/**
 * Get extended chord shape by chord name
 */
export function getExtendedChordShape(chordName: string): number[] | null {
  return extendedChordShapes[chordName] || null;
}

/**
 * Check if a chord name is an extended chord
 */
export function isExtendedChord(chordName: string): boolean {
  return chordName in extendedChordShapes;
}

/**
 * Get all extended chord types available
 */
export function getExtendedChordTypes(): string[] {
  return ['maj7', 'min7', 'm7', '7', 'sus2', 'sus4'];
}
