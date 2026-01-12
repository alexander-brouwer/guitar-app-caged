/**
 * CAGED Shape Templates für Dur und Moll Akkorde
 *
 * Diese Templates definieren die Grundformen der 5 CAGED-Positionen
 * als relative Fret-Offsets zum Root-Ton.
 */

import { getChordNotes, fretsToNotes } from './musicTheory';
import { Note } from 'tonal';

export interface CAGEDShapeTemplate {
  /** Fret-Positionen relativ zur Root-Position (0 = Root) */
  frets: number[];
  /** Saite, auf der die Root-Note liegt (0 = Low E, 5 = High E) */
  rootString: number;
  /** Fret der Root-Note in der Basis-Position (z.B. E = 0, A = 0, D = 0, G = 3, C = 3) */
  rootFret: number;
  /** Optionale Fingersatz-Information */
  fingers?: number[];
}

/**
 * CAGED Shape Templates für alle 5 Positionen
 *
 * Format: CAGED_SHAPES[shapeType][quality]
 * Shapes basieren auf den offenen Grundformen (E, A, D, G, C)
 */
export const CAGED_SHAPES: Record<
  'E' | 'A' | 'D' | 'G' | 'C',
  Record<'major' | 'minor', CAGEDShapeTemplate>
> = {
  E: {
    major: {
      frets: [0, 2, 2, 1, 0, 0],
      rootString: 0, // Low E
      rootFret: 0,   // E-Note ist bei Bund 0
      fingers: [0, 2, 3, 1, 0, 0]
    },
    minor: {
      frets: [0, 2, 2, 0, 0, 0],
      rootString: 0,
      rootFret: 0,
      fingers: [0, 2, 3, 0, 0, 0]
    }
  },
  A: {
    major: {
      frets: [-1, 0, 2, 2, 2, 0],
      rootString: 1, // A string
      rootFret: 0,   // A-Note ist bei Bund 0
      fingers: [0, 0, 2, 3, 4, 0]
    },
    minor: {
      frets: [-1, 0, 2, 2, 1, 0],
      rootString: 1,
      rootFret: 0,
      fingers: [0, 0, 2, 3, 1, 0]
    }
  },
  D: {
    major: {
      frets: [-1, -1, 0, 2, 3, 2],
      rootString: 2, // D string
      rootFret: 0,   // D-Note ist bei Bund 0
      fingers: [0, 0, 0, 1, 3, 2]
    },
    minor: {
      frets: [-1, -1, 0, 2, 3, 1],
      rootString: 2,
      rootFret: 0,
      fingers: [0, 0, 0, 2, 3, 1]
    }
  },
  G: {
    major: {
      frets: [3, 2, 0, 0, 0, 3],
      rootString: 0, // Low E
      rootFret: 3,   // G-Note ist bei Bund 3 auf Low E
      fingers: [3, 2, 0, 0, 0, 4]
    },
    minor: {
      frets: [3, 1, 0, 0, 3, 3],
      rootString: 0,
      rootFret: 3,
      fingers: [3, 1, 0, 0, 4, 4]
    }
  },
  C: {
    major: {
      frets: [-1, 3, 2, 0, 1, 0],
      rootString: 1, // A string
      rootFret: 3,   // C-Note ist bei Bund 3 auf A string
      fingers: [0, 3, 2, 0, 1, 0]
    },
    minor: {
      frets: [-1, 3, 1, 0, 1, 3],
      rootString: 1,
      rootFret: 3,
      fingers: [0, 4, 2, 0, 1, 3]
    }
  }
};

/**
 * Transponiert ein CAGED Shape Template zu einem spezifischen Akkord
 * MIT TONAL.JS VALIDIERUNG - Stellt sicher, dass alle Noten musikalisch korrekt sind
 *
 * @param rootNote - Root-Note des Zielakkords (z.B. 'C', 'G', 'F#', 'Bb')
 * @param shapeType - CAGED Shape Type ('E', 'A', 'D', 'G', 'C')
 * @param quality - Akkord-Qualität ('major' oder 'minor')
 * @param options - Optional: { validate: boolean } (default: true)
 * @returns Absolute Fret-Positionen als Array [Low E, A, D, G, B, High E]
 *
 * @example
 * transposeShape('C', 'A', 'major')
 * // Erwartet: [-1, 3, 5, 5, 5, 3]
 * // C-Dur mit A-Shape: Root C auf A-String (Bund 3)
 *
 * @example
 * transposeShape('G', 'E', 'major')
 * // Erwartet: [3, 5, 5, 4, 3, 3]
 * // G-Dur mit E-Shape: Root G auf Low E (Bund 3)
 */
export function transposeShape(
  rootNote: string,
  shapeType: 'E' | 'A' | 'D' | 'G' | 'C',
  quality: 'major' | 'minor',
  options: { validate?: boolean } = {}
): number[] {
  const { validate = true } = options;

  // 1. Hole das Template für den gewünschten Shape
  const template = CAGED_SHAPES[shapeType][quality];

  // 2. Finde den Bund, auf dem die Root-Note auf der Root-Saite liegt
  const targetRootFret = getNoteOnString(rootNote, template.rootString);

  // 3. Berechne den Transpositions-Offset
  const offset = targetRootFret - template.rootFret;

  // 4. Transponiere alle Frets um den Offset
  const transposed = template.frets.map(fret => {
    if (fret === -1) return -1; // Muted strings bleiben muted
    return fret + offset;
  });

  // 5. ✅ TONAL.JS VALIDIERUNG: Prüfe, ob alle Noten zum Akkord gehören
  if (validate) {
    // Hole theoretisch korrekte Noten für diesen Akkord
    const theoreticalNotes = getChordNotes(rootNote, quality);

    if (theoreticalNotes.length === 0) {
      console.warn(`⚠️ No theoretical notes found for ${rootNote} ${quality}`);
      return transposed; // Gebe unvalidiertes Ergebnis zurück
    }

    // Standard guitar tuning
    const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

    // Validiere jede einzelne Saite
    const validated = transposed.map((fret, stringIndex) => {
      if (fret === -1) return -1; // Muted strings bleiben muted
      if (fret < 0) return -1; // Invalid negative frets werden gemutet

      // Hole die Note, die auf dieser Saite gespielt wird
      // Erstelle ein Array mit nur diesem einen Fret für fretsToNotes
      const singleStringFrets = Array(6).fill(-1);
      singleStringFrets[stringIndex] = fret;
      const notes = fretsToNotes(singleStringFrets, STANDARD_TUNING);

      if (notes.length === 0) return -1; // Fehler beim Berechnen der Note

      const noteAtFret = notes[0];

      // Prüfe, ob diese Note im Akkord enthalten ist (chromatic comparison)
      const noteChroma = Note.chroma(noteAtFret);
      const isValidNote = theoreticalNotes.some(theoreticalNote =>
        Note.chroma(theoreticalNote) === noteChroma
      );

      if (!isValidNote) {
        // ❌ Note gehört nicht zum Akkord - mute diese Saite
        console.warn(
          `⚠️ Invalid note detected: ${noteAtFret} (string ${stringIndex + 1}, fret ${fret}) not in ${rootNote}${quality} ` +
          `(expected: ${theoreticalNotes.join(', ')}). Muting string.`
        );
        return -1;
      }

      return fret; // ✅ Valide Note
    });

    return validated;
  }

  return transposed;
}

/**
 * Findet den Bund für eine bestimmte Note auf einer gegebenen Saite
 *
 * @param note - Note zu finden (z.B. 'C', 'G', 'F#', 'Bb')
 * @param stringIndex - Saiten-Index (0 = Low E, 5 = High E)
 * @returns Bund-Nummer (0-11 im ersten Oktav)
 *
 * @example
 * getNoteOnString('C', 1) // C auf A-String => 3
 * getNoteOnString('G', 0) // G auf Low E => 3
 * getNoteOnString('F#', 0) // F# auf Low E => 2
 */
function getNoteOnString(note: string, stringIndex: number): number {
  // Standard-Stimmung (Low E, A, D, G, B, High E)
  const stringTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

  // Chromatische Tonleiter
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Normalisiere Noten-Namen (Bb => A#, etc.)
  const normalizedNote = normalizeNoteName(note);

  // Finde die Indizes
  const openNote = stringTuning[stringIndex];
  const openNoteIndex = chromatic.indexOf(openNote);
  const targetNoteIndex = chromatic.indexOf(normalizedNote);

  if (openNoteIndex === -1 || targetNoteIndex === -1) {
    throw new Error(`Invalid note: ${note} or string tuning: ${openNote}`);
  }

  // Berechne den Abstand (mit Wrap-Around für Oktaven)
  let fret = (targetNoteIndex - openNoteIndex + 12) % 12;

  return fret;
}

/**
 * Normalisiert Noten-Namen (konvertiert Flats zu Sharps)
 *
 * @param note - Note zu normalisieren
 * @returns Normalisierter Noten-Name
 *
 * @example
 * normalizeNoteName('Bb') => 'A#'
 * normalizeNoteName('Eb') => 'D#'
 * normalizeNoteName('C') => 'C'
 */
function normalizeNoteName(note: string): string {
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#'
  };

  return flatToSharp[note] || note;
}
