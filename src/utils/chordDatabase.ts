/**
 * Chord Database Integration using @tombatossals/chords-db
 *
 * Provides access to 3,283 guitar chord voicings with:
 * - Fret positions
 * - Finger positions
 * - Barre information
 * - MIDI notes
 */

import guitar from '@tombatossals/chords-db/lib/guitar.json';

/**
 * Chord position data from chords-db
 */
export interface ChordPosition {
  frets: number[];
  fingers: number[];
  barres: number[];
  capo?: boolean;
  baseFret: number;
  midi: number[];
}

/**
 * Chord data from chords-db
 */
export interface ChordData {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

/**
 * Maps app chord quality to chords-db suffix
 *
 * @param quality App chord quality (e.g., 'major', 'minor', '7')
 * @returns chords-db suffix
 *
 * @example
 * mapQualityToSuffix('major') => 'major'
 * mapQualityToSuffix('7') => '7'
 * mapQualityToSuffix('maj7') => 'maj7'
 */
export function mapQualityToSuffix(quality: string): string {
  const mapping: Record<string, string> = {
    '': 'major',        // Empty string maps to major (app convention)
    'major': 'major',
    'minor': 'minor',
    'm': 'minor',
    '7': '7',
    'maj7': 'maj7',
    'M7': 'maj7',
    'm7': 'm7',
    'min7': 'm7',
    'sus2': 'sus2',
    'sus4': 'sus4',
    'dim': 'dim',
    'aug': 'aug',
    'add9': 'add9',
    '6': '6',
    '9': '9',
    'm6': 'm6',
    'dim7': 'dim7',
    'm7b5': 'm7b5',
    '11': '11',
    '13': '13',
    'sus': 'sus4', // Default sus to sus4
    'dom7': '7'    // Dominant 7th
  };

  return mapping[quality] || quality;
}

/**
 * Gets all chord voicings from chords-db for a given chord
 *
 * @param note Root note (e.g., 'C', 'F#', 'Bb')
 * @param quality Chord quality
 * @returns Array of chord positions
 *
 * @example
 * getChordVoicingsFromDB('C', 'major')
 * // Returns all C major voicings from the database
 */
export function getChordVoicingsFromDB(
  note: string,
  quality: string
): ChordPosition[] {
  const suffix = mapQualityToSuffix(quality);

  // Normalize note (handle enharmonics and convert to chords-db key format)
  const keyName = normalizeNoteForDB(note);

  // guitar.chords is an object with keys like 'C', 'Csharp', 'D', etc.
  // NOT an array - we need to access it by key
  const chordsForKey = (guitar.chords as any)[keyName];

  if (!chordsForKey || !Array.isArray(chordsForKey)) {
    console.warn(`⚠️ No chords found in database for key: ${note} (mapped to ${keyName})`);
    return [];
  }

  // Now chordsForKey is an array of chords for this key
  const chord = chordsForKey.find((c: any) => c.suffix === suffix);

  if (!chord) {
    console.warn(`⚠️ No chord found for ${note}${quality} (${keyName} ${suffix})`);
    return [];
  }

  return chord.positions || [];
}

/**
 * Gets all available suffixes (chord types) in the database
 *
 * @returns Array of unique chord suffixes
 */
export function getAvailableSuffixes(): string[] {
  const suffixes = new Set<string>();

  // guitar.chords is an object, iterate through its values
  Object.values(guitar.chords).forEach((chordArray: any) => {
    if (Array.isArray(chordArray)) {
      chordArray.forEach((chord: any) => {
        if (chord.suffix) {
          suffixes.add(chord.suffix);
        }
      });
    }
  });

  return Array.from(suffixes).sort();
}

/**
 * Gets all available keys (root notes) in the database
 *
 * @returns Array of unique root notes
 */
export function getAvailableKeys(): string[] {
  // guitar.chords is an object, return its keys
  return Object.keys(guitar.chords).sort();
}

/**
 * Converts chords-db relative frets to absolute fret positions
 *
 * In chords-db:
 * - When baseFret = 1: frets are absolute positions
 * - When baseFret > 1: frets are relative to baseFret
 *   Formula: actualFret = baseFret + fret - 1
 *
 * @param position ChordPosition from chords-db
 * @returns Array of absolute fret positions
 *
 * @example
 * // baseFret: 5, frets: [1, 3, 3, 1, 1, 1]
 * // Actual frets: [5, 7, 7, 5, 5, 5]
 */
export function toAbsoluteFrets(position: ChordPosition): number[] {
  if (position.baseFret <= 1) {
    // Standard position - frets are already absolute
    return position.frets;
  }

  // Convert relative frets to absolute
  return position.frets.map(fret => {
    if (fret === -1) return -1; // Muted string
    if (fret === 0) return 0;   // Open string (rare in high positions)
    return position.baseFret + fret - 1;
  });
}

/**
 * Checks if a chord exists in the database
 *
 * @param note Root note
 * @param quality Chord quality
 * @returns true if chord exists in database
 */
export function chordExistsInDB(note: string, quality: string): boolean {
  const voicings = getChordVoicingsFromDB(note, quality);
  return voicings.length > 0;
}

/**
 * Gets the total number of voicings for a chord
 *
 * @param note Root note
 * @param quality Chord quality
 * @returns Number of available voicings
 */
export function getVoicingCount(note: string, quality: string): number {
  return getChordVoicingsFromDB(note, quality).length;
}

/**
 * Normalizes note name for chords-db format
 * chords-db uses specific key names (e.g., 'Csharp' instead of 'C#')
 *
 * @param note Note name
 * @returns Normalized note name for chords-db
 */
function normalizeNoteForDB(note: string): string {
  // First convert flats to sharps
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'Eb',  // chords-db uses Eb
    'Gb': 'F#',
    'Ab': 'Ab',  // chords-db uses Ab
    'Bb': 'Bb'   // chords-db uses Bb
  };

  const normalized = flatToSharp[note] || note;

  // Then convert to chords-db key names
  const noteToKeyName: Record<string, string> = {
    'C#': 'Csharp',
    'F#': 'Fsharp',
    // These stay as-is in chords-db
    'C': 'C',
    'D': 'D',
    'Eb': 'Eb',
    'E': 'E',
    'F': 'F',
    'G': 'G',
    'Ab': 'Ab',
    'A': 'A',
    'Bb': 'Bb',
    'B': 'B'
  };

  return noteToKeyName[normalized] || normalized;
}

/**
 * Filters voicings by position range on the fretboard
 *
 * @param voicings Array of chord positions
 * @param minFret Minimum fret position
 * @param maxFret Maximum fret position
 * @returns Filtered voicings
 */
export function filterVoicingsByPosition(
  voicings: ChordPosition[],
  minFret: number = 0,
  maxFret: number = 12
): ChordPosition[] {
  return voicings.filter(v => {
    const activeFrets = v.frets.filter(f => f > 0);
    if (activeFrets.length === 0) return true; // Open chords

    const maxFretInVoicing = Math.max(...activeFrets);
    return maxFretInVoicing >= minFret && maxFretInVoicing <= maxFret;
  });
}

/**
 * Filters voicings by number of barres
 *
 * @param voicings Array of chord positions
 * @param maxBarres Maximum number of barres (0 = no barres)
 * @returns Filtered voicings
 */
export function filterVoicingsByBarres(
  voicings: ChordPosition[],
  maxBarres: number = 1
): ChordPosition[] {
  return voicings.filter(v => v.barres.length <= maxBarres);
}

/**
 * Gets open position voicings (contains at least one open string)
 *
 * @param voicings Array of chord positions
 * @returns Open position voicings
 */
export function getOpenVoicings(voicings: ChordPosition[]): ChordPosition[] {
  return voicings.filter(v => v.frets.some(f => f === 0));
}

/**
 * Gets barre chord voicings
 *
 * @param voicings Array of chord positions
 * @returns Barre chord voicings
 */
export function getBarreVoicings(voicings: ChordPosition[]): ChordPosition[] {
  return voicings.filter(v => v.barres.length > 0);
}

/**
 * Sorts voicings by difficulty (easier first)
 * Based on: open strings, fret position, number of barres
 *
 * @param voicings Array of chord positions
 * @returns Sorted voicings
 */
export function sortByDifficulty(voicings: ChordPosition[]): ChordPosition[] {
  return [...voicings].sort((a, b) => {
    // Open chords are easiest
    const aHasOpen = a.frets.some(f => f === 0);
    const bHasOpen = b.frets.some(f => f === 0);
    if (aHasOpen && !bHasOpen) return -1;
    if (!aHasOpen && bHasOpen) return 1;

    // Fewer barres is easier
    if (a.barres.length !== b.barres.length) {
      return a.barres.length - b.barres.length;
    }

    // Lower fret position is easier
    return a.baseFret - b.baseFret;
  });
}

/**
 * Gets statistics about available chords in the database
 *
 * @returns Statistics object
 */
export function getDatabaseStats() {
  const uniqueKeys = getAvailableKeys().length;
  const uniqueSuffixes = getAvailableSuffixes().length;

  // guitar.chords is an object, iterate through its values
  let totalChords = 0;
  let totalPositions = 0;

  Object.values(guitar.chords).forEach((chordArray: any) => {
    if (Array.isArray(chordArray)) {
      totalChords += chordArray.length;
      chordArray.forEach((chord: any) => {
        if (chord.positions) {
          totalPositions += chord.positions.length;
        }
      });
    }
  });

  return {
    totalChords,
    uniqueKeys,
    uniqueSuffixes,
    totalPositions,
    averagePositionsPerChord: totalChords > 0 ? Math.round(totalPositions / totalChords) : 0
  };
}
