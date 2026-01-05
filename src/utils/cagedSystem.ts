// CAGED System Implementation
// Generates chord voicings using the CAGED system

export interface ChordVoicing {
  name: string;
  frets: number[];
  position: number;
  cagedShape: 'C' | 'A' | 'G' | 'E' | 'D';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  barrePositions?: number[];
}

// Note names in chromatic scale
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic equivalents (flat to sharp conversions)
const flatToSharp: { [key: string]: string } = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

// Get note index in chromatic scale (supports both sharps and flats)
function getNoteIndex(note: string): number {
  // Convert flat to sharp if needed
  const normalizedNote = flatToSharp[note] || note;
  return noteNames.indexOf(normalizedNote);
}

// Base open chord shapes for major chords (templates)
// Format: [E(low), A, D, G, B, E(high)] - 6th string to 1st string
const baseMajorShapes = {
  C: { frets: [-1, 3, 2, 0, 1, 0], rootString: 5, rootFret: 3, movable: false },
  A: { frets: [-1, 0, 2, 2, 2, 0], rootString: 5, rootFret: 0, movable: true },
  G: { frets: [3, 2, 0, 0, 0, 3], rootString: 6, rootFret: 3, movable: true },
  E: { frets: [0, 2, 2, 1, 0, 0], rootString: 6, rootFret: 0, movable: true },
  D: { frets: [-1, -1, 0, 2, 3, 2], rootString: 4, rootFret: 0, movable: true }
};

// Base open chord shapes for minor chords
// Note: Minor CAGED order is A-G-E-D-C (different from major)
const baseMinorShapes = {
  A: { frets: [-1, 0, 2, 2, 1, 0], rootString: 5, rootFret: 0, movable: true },    // Am open
  G: { frets: [3, 1, 0, 0, 3, 3], rootString: 6, rootFret: 3, movable: true },    // Gm shape (partial voicing)
  E: { frets: [0, 2, 2, 0, 0, 0], rootString: 6, rootFret: 0, movable: true },    // Em open
  D: { frets: [-1, -1, 0, 2, 3, 1], rootString: 4, rootFret: 0, movable: true },  // Dm open
  C: { frets: [-1, 3, 1, 0, 1, 3], rootString: 5, rootFret: 3, movable: true }    // Cm barre
};

// Base shapes for extended chords (maj7, min7, 7, sus2, sus4)
const baseMaj7Shapes = {
  C: { frets: [-1, 3, 2, 0, 0, 0], rootString: 5, rootFret: 3, movable: true },    // Cmaj7
  A: { frets: [-1, 0, 2, 1, 2, 0], rootString: 5, rootFret: 0, movable: true },    // Amaj7
  G: { frets: [3, 2, 0, 0, 0, 2], rootString: 6, rootFret: 3, movable: true },     // Gmaj7
  E: { frets: [0, 2, 1, 1, 0, 0], rootString: 6, rootFret: 0, movable: true },     // Emaj7
  D: { frets: [-1, -1, 0, 2, 2, 2], rootString: 4, rootFret: 0, movable: true }    // Dmaj7
};

const baseMin7Shapes = {
  A: { frets: [-1, 0, 2, 0, 1, 0], rootString: 5, rootFret: 0, movable: true },    // Am7
  G: { frets: [3, 5, 3, 3, 3, 3], rootString: 6, rootFret: 3, movable: true },     // Gm7
  E: { frets: [0, 2, 0, 0, 0, 0], rootString: 6, rootFret: 0, movable: true },     // Em7
  D: { frets: [-1, -1, 0, 2, 1, 1], rootString: 4, rootFret: 0, movable: true },   // Dm7
  C: { frets: [-1, 3, 1, 3, 4, 3], rootString: 5, rootFret: 3, movable: true }     // Cm7
};

const baseDom7Shapes = {
  C: { frets: [-1, 3, 2, 3, 1, 0], rootString: 5, rootFret: 3, movable: true },    // C7
  A: { frets: [-1, 0, 2, 0, 2, 0], rootString: 5, rootFret: 0, movable: true },    // A7
  G: { frets: [3, 2, 0, 0, 0, 1], rootString: 6, rootFret: 3, movable: true },     // G7
  E: { frets: [0, 2, 0, 1, 0, 0], rootString: 6, rootFret: 0, movable: true },     // E7
  D: { frets: [-1, -1, 0, 2, 1, 2], rootString: 4, rootFret: 0, movable: true }    // D7
};

const baseSus2Shapes = {
  C: { frets: [-1, 3, 0, 0, 3, 3], rootString: 5, rootFret: 3, movable: true },    // Csus2
  A: { frets: [-1, 0, 2, 2, 0, 0], rootString: 5, rootFret: 0, movable: true },    // Asus2
  G: { frets: [3, 0, 0, 0, 3, 3], rootString: 6, rootFret: 3, movable: true },     // Gsus2
  E: { frets: [0, 2, 4, 4, 0, 0], rootString: 6, rootFret: 0, movable: true },     // Esus2
  D: { frets: [-1, -1, 0, 2, 3, 0], rootString: 4, rootFret: 0, movable: true }    // Dsus2
};

const baseSus4Shapes = {
  C: { frets: [-1, 3, 3, 0, 1, 1], rootString: 5, rootFret: 3, movable: true },    // Csus4
  A: { frets: [-1, 0, 2, 2, 3, 0], rootString: 5, rootFret: 0, movable: true },    // Asus4
  G: { frets: [3, 3, 0, 0, 1, 3], rootString: 6, rootFret: 3, movable: true },     // Gsus4
  E: { frets: [0, 2, 2, 2, 0, 0], rootString: 6, rootFret: 0, movable: true },     // Esus4
  D: { frets: [-1, -1, 0, 2, 3, 3], rootString: 4, rootFret: 0, movable: true }    // Dsus4
};

// CAGED order (different for major and minor)
const cagedOrderMajor: Array<'C' | 'A' | 'G' | 'E' | 'D'> = ['C', 'A', 'G', 'E', 'D'];
const cagedOrderMinor: Array<'A' | 'G' | 'E' | 'D' | 'C'> = ['A', 'G', 'E', 'D', 'C'];

/**
 * Transpose a chord shape by semitones
 */
function transposeShape(
  baseShape: number[],
  semitones: number,
  rootString: number,
  rootFret: number
): { frets: number[], position: number, barrePositions?: number[] } {
  const newFrets = [...baseShape];
  const barrePositions: number[] = [];

  // If the shape is movable (has open strings), convert to barre chord
  const hasOpenStrings = baseShape.some((f, i) => f === 0 && i !== -1);

  if (hasOpenStrings && semitones > 0) {
    // Convert to barre chord
    const minFret = Math.min(...baseShape.filter(f => f >= 0));

    for (let i = 0; i < newFrets.length; i++) {
      if (newFrets[i] >= 0) {
        newFrets[i] = newFrets[i] + semitones;
      }
    }

    // Add barre at the minimum fret position
    if (minFret === 0) {
      barrePositions.push(semitones);
    }
  } else {
    // Simple transposition
    for (let i = 0; i < newFrets.length; i++) {
      if (newFrets[i] > 0) {
        newFrets[i] = newFrets[i] + semitones;
      }
    }
  }

  // Calculate the position (where the root note is)
  const position = rootFret + semitones;

  return { frets: newFrets, position, barrePositions: barrePositions.length > 0 ? barrePositions : undefined };
}

/**
 * Generate CAGED voicings for a given root note and quality
 */
export function generateCAGEDVoicings(rootNote: string, quality: string = ''): ChordVoicing[] {
  const rootIndex = getNoteIndex(rootNote);
  if (rootIndex === -1) {
    throw new Error(`Invalid note: ${rootNote}`);
  }

  // Determine chord type and select appropriate base shapes
  let baseShapes: any;
  let cagedOrder: Array<'C' | 'A' | 'G' | 'E' | 'D'>;

  if (quality === 'maj7') {
    baseShapes = baseMaj7Shapes;
    cagedOrder = cagedOrderMajor;
  } else if (quality === 'm7' || quality === 'min7') {
    baseShapes = baseMin7Shapes;
    cagedOrder = cagedOrderMinor;
  } else if (quality === '7') {
    baseShapes = baseDom7Shapes;
    cagedOrder = cagedOrderMajor;
  } else if (quality === 'sus2') {
    baseShapes = baseSus2Shapes;
    cagedOrder = cagedOrderMajor;
  } else if (quality === 'sus4') {
    baseShapes = baseSus4Shapes;
    cagedOrder = cagedOrderMajor;
  } else {
    // Basic major or minor
    const isMinor = quality === 'm' || quality === 'min' || quality === 'minor';
    baseShapes = isMinor ? baseMinorShapes : baseMajorShapes;
    cagedOrder = isMinor ? cagedOrderMinor : cagedOrderMajor;
  }

  const voicings: ChordVoicing[] = [];

  // For each CAGED shape, calculate the appropriate transposition
  for (const shape of cagedOrder) {
    const base = baseShapes[shape];

    // Calculate how many semitones to transpose
    // Find what note the base shape represents
    let baseNoteIndex: number;
    switch (shape) {
      case 'C':
        baseNoteIndex = getNoteIndex('C');
        break;
      case 'A':
        baseNoteIndex = getNoteIndex('A');
        break;
      case 'G':
        baseNoteIndex = getNoteIndex('G');
        break;
      case 'E':
        baseNoteIndex = getNoteIndex('E');
        break;
      case 'D':
        baseNoteIndex = getNoteIndex('D');
        break;
    }

    // Calculate transposition
    let semitones = (rootIndex - baseNoteIndex + 12) % 12;

    // Transpose the shape
    const { frets, position, barrePositions } = transposeShape(
      base.frets,
      semitones,
      base.rootString,
      base.rootFret
    );

    // Filter out unplayable positions (too high on the neck)
    const maxFret = Math.max(...frets.filter(f => f > 0));
    if (maxFret > 15) continue; // Skip if too high

    // Determine difficulty
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (barrePositions && barrePositions.length > 0) {
      difficulty = barrePositions[0] > 5 ? 'advanced' : 'intermediate';
    } else if (position > 7) {
      difficulty = 'intermediate';
    }

    // Create voicing name
    const positionName = position === 0 ? 'Open' : `${position}th Position`;
    const voicingName = `${shape} Shape (${positionName})`;

    voicings.push({
      name: voicingName,
      frets,
      position,
      cagedShape: shape,
      difficulty,
      barrePositions
    });

    // Limit to 5 voicings
    if (voicings.length >= 5) break;
  }

  return voicings;
}

/**
 * Get a single chord shape (for backward compatibility)
 */
export function getChordShape(rootNote: string, quality: string = ''): number[] {
  try {
    const voicings = generateCAGEDVoicings(rootNote, quality);
    return voicings.length > 0 ? voicings[0].frets : [0, 0, 0, 0, 0, 0];
  } catch (error) {
    // Return fallback for invalid notes
    return [0, 0, 0, 0, 0, 0];
  }
}
