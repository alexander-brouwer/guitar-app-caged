/**
 * Enhanced CAGED System with Music Theory Validation
 *
 * Integrates:
 * - Tonal.js for music theory validation
 * - chords-db for comprehensive voicing database
 * - Original CAGED logic for shape determination
 */

import { ChordVoicing } from './cagedSystem';
import { getChordNotes, validateChordVoicing as validateVoicing } from './musicTheory';
import {
  getChordVoicingsFromDB,
  ChordPosition,
  sortByDifficulty,
  filterVoicingsByPosition,
  toAbsoluteFrets
} from './chordDatabase';
import { transposeShape, CAGED_SHAPES } from './cagedShapes';

/**
 * Enhanced chord voicing with validation and additional metadata
 */
export interface EnhancedChordVoicing extends ChordVoicing {
  baseFret: number;        // Base fret position (1 for open, >1 for barre chords)
  fingers?: number[];      // Finger positions from chords-db
  midi?: number[];         // MIDI note values
  validated: boolean;      // Whether voicing is theoretically correct
  theoreticalNotes: string[]; // Expected notes from music theory
  actualNotes?: string[];  // Actual notes played (for debugging)
}

/**
 * Determines CAGED shape from fret pattern using MUSIC THEORY principles
 *
 * CAGED shapes are defined by ROOT STRING POSITION and INTERVAL STRUCTURE,
 * NOT by fret position!
 *
 * Rules:
 * - E-shape: Root on 6th string (low E), full barre structure
 * - A-shape: Root on 5th string (A), low E muted or present
 * - D-shape: Root on 4th string (D), low E and A muted
 * - C-shape: Root on 5th string (A), low E muted, distinctive voicing
 * - G-shape: Root on 6th string (low E), uses all/most strings
 */
function determineCAGEDShape(
  frets: number[],
  baseFret: number
): 'C' | 'A' | 'G' | 'E' | 'D' {
  // Convert to absolute frets for structural analysis
  const absoluteFrets = baseFret > 1
    ? frets.map(f => f === -1 ? -1 : (f === 0 ? 0 : baseFret + f - 1))
    : frets;

  // Find played strings (not muted)
  const playedStrings = absoluteFrets
    .map((fret, idx) => fret >= 0 ? { string: idx, fret } : null)
    .filter(x => x !== null);

  if (playedStrings.length === 0) return 'E'; // Fallback

  // Get characteristics
  const lowestString = playedStrings[0]!.string; // Lowest string index (0 = low E)
  const highestString = playedStrings[playedStrings.length - 1]!.string;
  const hasOpenStrings = absoluteFrets.some(f => f === 0);
  const stringCount = playedStrings.length;

  // D-shape: Starts from 4th string (index 2), omits low E and A
  if (absoluteFrets[0] === -1 && absoluteFrets[1] === -1 && absoluteFrets[2] >= 0) {
    return 'D';
  }

  // E-shape: Root on low E string (index 0), typically 5-6 strings
  // Characteristic: Uses low E string as bass note
  if (lowestString === 0 && stringCount >= 4) {
    // Distinguish from G-shape
    if (stringCount === 6 && hasOpenStrings && absoluteFrets[5] > 0) {
      // G-shape: All 6 strings + open strings + high E fretted
      return 'G';
    }
    return 'E';
  }

  // A-shape: Root on A string (index 1), low E muted OR used
  // Characteristic: Bass starts on A string
  if (lowestString === 1) {
    // Distinguish A from C shape
    // C-shape has distinctive interval pattern with specific voicing
    if (absoluteFrets[0] === -1 && hasOpenStrings && absoluteFrets[2] < absoluteFrets[1]) {
      // C-shape characteristic: D string lower than A string
      return 'C';
    }
    return 'A';
  }

  // G-shape: Uses all 6 strings (or 5-6), distinctive pattern
  // Characteristic: Full voicing, often with open strings
  if (stringCount >= 5 && lowestString === 0 && highestString === 5) {
    return 'G';
  }

  // C-shape: Root on A string (index 1), low E muted
  // Distinctive voicing pattern different from A-shape
  if (absoluteFrets[0] === -1 && absoluteFrets[1] > 0) {
    // If it has open strings and specific pattern, it's C
    if (hasOpenStrings) {
      return 'C';
    }
    // Otherwise could be A-shape barre
    return 'A';
  }

  // Default fallback based on lowest string
  if (lowestString === 0) return 'E';
  if (lowestString === 1) return 'A';
  if (lowestString === 2) return 'D';

  return 'E'; // Ultimate fallback
}

/**
 * Calculates difficulty level based on voicing characteristics
 */
function calculateDifficulty(
  position: ChordPosition,
  baseFret: number
): 'beginner' | 'intermediate' | 'advanced' {
  const hasBarres = position.barres.length > 0;
  const hasOpenStrings = position.frets.some(f => f === 0);

  // Advanced: high fret positions or multiple barres
  if (baseFret > 12 || position.barres.length > 1) {
    return 'advanced';
  }

  // Beginner: open chords without barres
  if (hasOpenStrings && !hasBarres) {
    return 'beginner';
  }

  // Intermediate: everything else
  return 'intermediate';
}

/**
 * Converts absolute fret positions to ChordPosition format (relative frets + baseFret)
 *
 * @param absoluteFrets Absolute fret positions [Low E, A, D, G, B, High E]
 * @param shape CAGED shape type
 * @param quality Chord quality
 * @returns ChordPosition object with relative frets and baseFret
 */
function absoluteFretsToChordPosition(
  absoluteFrets: number[],
  shape: 'C' | 'A' | 'G' | 'E' | 'D',
  quality: 'major' | 'minor'
): ChordPosition {
  // Calculate baseFret (smallest non-muted, non-open fret)
  const playedFrets = absoluteFrets.filter(f => f > 0);
  const baseFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 1;

  // Convert to relative frets
  const relativeFrets = absoluteFrets.map(fret => {
    if (fret === -1) return -1; // Muted
    if (fret === 0) return 0;   // Open
    if (baseFret === 1) return fret; // No offset needed for open chords
    return fret - baseFret + 1; // Relative to baseFret
  });

  // Detect barres (same relative fret on multiple strings)
  const barres: number[] = [];
  const fretCounts = new Map<number, number>();
  relativeFrets.forEach(fret => {
    if (fret > 0) {
      fretCounts.set(fret, (fretCounts.get(fret) || 0) + 1);
    }
  });
  fretCounts.forEach((count, fret) => {
    if (count >= 2) {
      // Convert relative fret back to absolute for barres array
      const absoluteBarreFret = baseFret === 1 ? fret : baseFret + fret - 1;
      barres.push(absoluteBarreFret);
    }
  });

  // Get fingers from template
  const template = CAGED_SHAPES[shape][quality];
  const fingers = template.fingers || [];

  return {
    frets: relativeFrets,
    fingers,
    barres,
    baseFret,
    midi: []
  };
}

/**
 * Gets validated CAGED voicings with music theory integration
 *
 * @param root Root note (e.g., 'C', 'F#')
 * @param quality Chord quality (e.g., 'major', 'minor', '7')
 * @param options Optional filtering options
 * @returns Array of enhanced chord voicings
 *
 * @example
 * const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 5 });
 * voicings.forEach(v => console.log(v.validated ? '✅' : '❌', v.name));
 */
export function getValidatedCAGEDVoicings(
  root: string,
  quality: string,
  options: {
    maxVoicings?: number;
    minFret?: number;
    maxFret?: number;
    onlyValidated?: boolean;
  } = {}
): EnhancedChordVoicing[] {
  const {
    maxVoicings = 10,
    minFret = 0,
    maxFret = 15,
    onlyValidated = true
  } = options;

  // 1. Get theoretically correct notes from Tonal.js
  const theoreticalNotes = getChordNotes(root, quality);

  if (theoreticalNotes.length === 0) {
    console.warn(`No theoretical notes found for ${root}${quality}`);
    return [];
  }

  // 2. Get all possible voicings from chords-db
  let dbVoicings = getChordVoicingsFromDB(root, quality);

  if (dbVoicings.length === 0) {
    console.warn(`No voicings found in database for ${root}${quality}`);
    return [];
  }

  // 3. Filter by fret range
  dbVoicings = filterVoicingsByPosition(dbVoicings, minFret, maxFret);

  // 4. Sort by difficulty (easier first)
  dbVoicings = sortByDifficulty(dbVoicings);

  // 4.5. CAGED Template Generation: Add missing shapes for major/minor chords
  const qualityMapped =
    quality === '' || quality === 'major' ? 'major' :
    quality === 'm' || quality === 'minor' ? 'minor' : null;

  if (qualityMapped) {
    // Check which CAGED shapes are already present in dbVoicings
    const presentShapes = new Set<'C' | 'A' | 'G' | 'E' | 'D'>();
    dbVoicings.forEach(voicing => {
      const shape = determineCAGEDShape(voicing.frets, voicing.baseFret);
      presentShapes.add(shape);
    });

    // Generate missing CAGED shapes using templates
    const allShapes: ('C' | 'A' | 'G' | 'E' | 'D')[] = ['C', 'A', 'G', 'E', 'D'];
    allShapes.forEach(shape => {
      if (!presentShapes.has(shape)) {
        try {
          // Generate voicing using template
          const absoluteFrets = transposeShape(root, shape, qualityMapped);

          // Validate: Check for invalid negative frets (negative frets other than -1)
          const hasInvalidFrets = absoluteFrets.some(fret => fret < -1);
          if (hasInvalidFrets) {
            // Skip this voicing - template cannot be transposed to this position
            return;
          }

          // Convert absolute frets to ChordPosition format (relative frets + baseFret)
          const chordPosition = absoluteFretsToChordPosition(absoluteFrets, shape, qualityMapped);

          // Validate converted position
          const hasInvalidRelativeFrets = chordPosition.frets.some(fret => fret < -1);
          if (hasInvalidRelativeFrets) {
            // Skip - conversion produced invalid frets
            return;
          }

          // Add to dbVoicings if within fret range
          if (chordPosition.baseFret >= minFret && chordPosition.baseFret <= maxFret) {
            dbVoicings.push(chordPosition);
          }
        } catch (error) {
          // Template generation failed (e.g., invalid note)
          console.warn(`Could not generate ${shape}-shape for ${root}${quality}:`, error);
        }
      }
    });
  }

  // 5. Convert to EnhancedChordVoicing and validate
  const enhancedVoicings: EnhancedChordVoicing[] = dbVoicings.map((pos, idx) => {
    // Convert relative frets to absolute frets ONLY for validation
    const absoluteFrets = toAbsoluteFrets(pos);

    const cagedShape = determineCAGEDShape(pos.frets, pos.baseFret);
    const difficulty = calculateDifficulty(pos, pos.baseFret);

    // Validate this voicing against music theory using absolute frets
    const isValid = validateVoicing(absoluteFrets, theoreticalNotes);

    return {
      name: `${root}${quality} (${cagedShape} Shape)`,
      frets: pos.frets,        // ✅ Keep RELATIVE frets (original from chords-db)
      baseFret: pos.baseFret,  // ✅ Add baseFret for diagram display
      fingers: pos.fingers,
      position: pos.baseFret,
      cagedShape,
      difficulty,
      barrePositions: pos.barres,
      midi: pos.midi,
      validated: isValid,
      theoreticalNotes
    };
  });

  // 6. Filter: keep only validated voicings if requested
  let filteredVoicings = onlyValidated
    ? enhancedVoicings.filter(v => v.validated)
    : enhancedVoicings;

  // 7. Limit to maxVoicings
  return filteredVoicings.slice(0, maxVoicings);
}

/**
 * Gets voicings grouped by CAGED shape
 *
 * @param root Root note
 * @param quality Chord quality
 * @returns Object with voicings grouped by CAGED shape
 */
export function getVoicingsByShape(
  root: string,
  quality: string
): Record<'C' | 'A' | 'G' | 'E' | 'D', EnhancedChordVoicing[]> {
  const allVoicings = getValidatedCAGEDVoicings(root, quality, {
    maxVoicings: 50 // Get more to ensure we have all shapes
  });

  const grouped: Record<'C' | 'A' | 'G' | 'E' | 'D', EnhancedChordVoicing[]> = {
    C: [],
    A: [],
    G: [],
    E: [],
    D: []
  };

  allVoicings.forEach(voicing => {
    grouped[voicing.cagedShape].push(voicing);
  });

  return grouped;
}

/**
 * Gets the most common (easiest) voicing for a chord
 *
 * @param root Root note
 * @param quality Chord quality
 * @returns The easiest voicing or null
 */
export function getCommonVoicing(
  root: string,
  quality: string
): EnhancedChordVoicing | null {
  const voicings = getValidatedCAGEDVoicings(root, quality, { maxVoicings: 1 });
  return voicings.length > 0 ? voicings[0] : null;
}

/**
 * Validates if a custom voicing is correct for a chord
 *
 * @param frets Fret positions
 * @param root Root note
 * @param quality Chord quality
 * @returns Validation result
 */
export function validateCustomVoicing(
  frets: number[],
  root: string,
  quality: string
): {
  isValid: boolean;
  theoreticalNotes: string[];
  message: string;
} {
  const theoreticalNotes = getChordNotes(root, quality);

  if (theoreticalNotes.length === 0) {
    return {
      isValid: false,
      theoreticalNotes: [],
      message: `Unknown chord: ${root}${quality}`
    };
  }

  const isValid = validateVoicing(frets, theoreticalNotes);

  return {
    isValid,
    theoreticalNotes,
    message: isValid
      ? `✅ Valid ${root}${quality} voicing`
      : `❌ Invalid ${root}${quality} voicing. Expected notes: ${theoreticalNotes.join(', ')}`
  };
}
