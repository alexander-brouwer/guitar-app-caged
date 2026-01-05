/**
 * AlphaTab Chord Generator with Music Theory Validation
 *
 * Generates correct chord voicings for AlphaTab using:
 * - chords-db for accurate fret positions
 * - Tonal.js for music theory validation
 */

import { getChordVoicingsFromDB, ChordPosition, toAbsoluteFrets } from './chordDatabase';
import { getChordNotes, validateChordVoicing } from './musicTheory';

/**
 * Converts fret array to AlphaTeX notation
 * Format: (fret.string fret.string).duration
 *
 * @param frets Array of 6 fret positions (low E to high E)
 * @returns AlphaTeX notation string
 *
 * @example
 * fretsToAlphaTeX([3, 2, 0, 0, 0, 3]) => "(3.6 2.5 0.4 0.3 0.2 3.1).1"
 */
function fretsToAlphaTeX(frets: number[]): string {
  const notations: string[] = [];

  // String numbering in AlphaTeX: 1 = high E, 6 = low E
  frets.forEach((fret, stringIndex) => {
    if (fret >= 0) { // -1 means muted, skip it
      const alphaTabString = 6 - stringIndex; // Reverse: index 0 (low E) = string 6
      notations.push(`${fret}.${alphaTabString}`);
    }
  });

  return `(${notations.join(' ')}).1`; // .1 = whole note
}

/**
 * Gets the best chord voicing from chords-db for AlphaTab
 * Prioritizes:
 * 1. Music theory correctness (validated with Tonal.js)
 * 2. Open positions (easier to read)
 * 3. Lower fret positions (more common)
 *
 * @param note Root note (e.g., 'C', 'F#', 'Bb')
 * @param quality Chord quality (e.g., 'major', 'minor', 'dim')
 * @returns AlphaTeX notation string
 */
export function getValidatedChordForAlphaTab(note: string, quality: string): string {
  // 1. Get theoretical notes from Tonal.js
  const theoreticalNotes = getChordNotes(note, quality);

  if (theoreticalNotes.length === 0) {
    console.warn(`⚠️ Unknown chord: ${note}${quality} - using fallback`);
    return '(0.6 0.5 0.4 0.3 0.2 0.1).1'; // Open E major fallback
  }

  // 2. Get all voicings from chords-db
  const voicings = getChordVoicingsFromDB(note, quality);

  if (voicings.length === 0) {
    console.warn(`⚠️ No voicings found for ${note}${quality} in database - using fallback`);
    return '(0.6 0.5 0.4 0.3 0.2 0.1).1';
  }

  // 3. Find the best voicing (validated + easy to play)
  const validatedVoicing = findBestVoicing(voicings, theoreticalNotes);

  if (!validatedVoicing) {
    console.warn(`⚠️ No valid voicing found for ${note}${quality} - using first available`);
    const absoluteFrets = toAbsoluteFrets(voicings[0]);
    return fretsToAlphaTeX(absoluteFrets);
  }

  // 4. Convert to AlphaTeX using absolute frets
  const absoluteFrets = toAbsoluteFrets(validatedVoicing);
  return fretsToAlphaTeX(absoluteFrets);
}

/**
 * Finds the best voicing based on validation and playability
 */
function findBestVoicing(
  voicings: ChordPosition[],
  expectedNotes: string[]
): ChordPosition | null {
  // Score each voicing
  const scoredVoicings = voicings.map(voicing => {
    let score = 0;

    // Convert to absolute frets for validation
    const absoluteFrets = toAbsoluteFrets(voicing);

    // CRITICAL: Validate against music theory (+1000 points)
    const isValid = validateChordVoicing(absoluteFrets, expectedNotes);
    if (isValid) {
      score += 1000;
    } else {
      return { voicing, score: -1 }; // Invalid voicings get -1
    }

    // Prefer open positions (+100 points)
    const hasOpenStrings = absoluteFrets.some(f => f === 0);
    if (hasOpenStrings) {
      score += 100;
    }

    // Prefer lower fret positions (+50 to 0 points)
    const avgFret = absoluteFrets.filter(f => f > 0).reduce((sum, f) => sum + f, 0) /
                    absoluteFrets.filter(f => f > 0).length;
    score += Math.max(0, 50 - avgFret * 2);

    // Penalty for barres (-20 points per barre)
    score -= voicing.barres.length * 20;

    return { voicing, score };
  });

  // Sort by score (highest first)
  scoredVoicings.sort((a, b) => b.score - a.score);

  // Return best valid voicing
  const best = scoredVoicings.find(v => v.score >= 0);
  return best ? best.voicing : null;
}

/**
 * Generates complete AlphaTeX notation for a chord progression
 * with validated voicings
 *
 * @param chords Array of chords with note and quality
 * @returns Complete AlphaTeX notation
 */
export function generateValidatedAlphaTeX(
  chords: Array<{ note: string; quality: string }>
): string {
  let alphaTex = '\\title "Chord Progression"\n';
  alphaTex += '\\tempo 80\n';
  alphaTex += '.\n'; // Guitar track

  const chordNotations = chords.map(chord => {
    const notation = getValidatedChordForAlphaTab(chord.note, chord.quality);

    // Log for debugging
    const theoreticalNotes = getChordNotes(chord.note, chord.quality);
    console.log(`✅ ${chord.note}${chord.quality}: ${theoreticalNotes.join('-')} → ${notation}`);

    return notation;
  });

  alphaTex += chordNotations.join(' | ');

  return alphaTex;
}

/**
 * Validates and fixes a chord voicing
 * Returns a corrected version if possible
 */
export function validateAndFixVoicing(
  frets: number[],
  note: string,
  quality: string
): {
  isValid: boolean;
  correctedFrets?: number[];
  theoreticalNotes: string[];
  message: string;
} {
  const theoreticalNotes = getChordNotes(note, quality);
  const isValid = validateChordVoicing(frets, theoreticalNotes);

  if (isValid) {
    return {
      isValid: true,
      theoreticalNotes,
      message: `✅ ${note}${quality} voicing is correct`
    };
  }

  // Try to find a correct voicing from database
  const voicings = getChordVoicingsFromDB(note, quality);
  const validVoicing = findBestVoicing(voicings, theoreticalNotes);

  if (validVoicing) {
    const absoluteFrets = toAbsoluteFrets(validVoicing);
    return {
      isValid: false,
      correctedFrets: absoluteFrets,
      theoreticalNotes,
      message: `❌ ${note}${quality} voicing was incorrect. Suggested fix: ${absoluteFrets.join('-')}`
    };
  }

  return {
    isValid: false,
    theoreticalNotes,
    message: `❌ ${note}${quality} voicing is incorrect. Expected notes: ${theoreticalNotes.join(', ')}`
  };
}
