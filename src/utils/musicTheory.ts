/**
 * Music Theory Utilities using Tonal.js
 *
 * Provides functions for:
 * - Chord note calculation
 * - Interval computation
 * - Note transposition
 * - Chord voicing validation
 */

import { Chord, Note, Interval } from 'tonal';

// Standard guitar tuning (low to high)
export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

/**
 * Converts fret positions to actual notes based on guitar tuning
 * @param frets Array of fret positions (6 strings, -1 = muted, 0 = open)
 * @param tuning Guitar tuning (default: standard tuning)
 * @returns Array of note names
 */
export function fretsToNotes(
  frets: number[],
  tuning: string[] = STANDARD_TUNING
): string[] {
  return frets
    .map((fret, stringIndex) => {
      if (fret === -1) return null; // Muted string
      const openNote = tuning[stringIndex];
      return Note.transpose(openNote, Interval.fromSemitones(fret));
    })
    .filter((note): note is string => note !== null);
}

/**
 * Get all notes in a chord based on root and quality
 * @param root Root note (e.g., 'C', 'F#', 'Bb')
 * @param quality Chord quality (e.g., 'major', 'minor', '7', 'maj7')
 * @returns Array of note names in the chord
 *
 * @example
 * getChordNotes('C', 'major') => ['C', 'E', 'G']
 * getChordNotes('Am', '') => ['A', 'C', 'E']
 * getChordNotes('G', '7') => ['G', 'B', 'D', 'F']
 */
export function getChordNotes(root: string, quality: string = ''): string[] {
  // Map common quality names to Tonal.js format
  const qualityMap: { [key: string]: string } = {
    'major': '',
    'minor': 'm',
    'maj7': 'maj7',
    'm7': 'm7',
    '7': '7',
    'sus2': 'sus2',
    'sus4': 'sus4',
    'dim': 'dim',
    'aug': 'aug',
    'add9': 'add9',
    '6': '6',
    '9': '9',
    'm6': 'm6',
    'dim7': 'dim7',
    'm7b5': 'm7b5' // half-diminished
  };

  const mappedQuality = qualityMap[quality] !== undefined ? qualityMap[quality] : quality;
  const chordName = `${root}${mappedQuality}`;

  const chord = Chord.get(chordName);

  if (!chord.empty) {
    return chord.notes;
  }

  // Fallback: try without mapping
  const fallbackChord = Chord.get(`${root}${quality}`);
  return fallbackChord.empty ? [] : fallbackChord.notes;
}

/**
 * Validates if a fret combination contains the correct chord notes
 * Uses chromatic note comparison (C# = Db)
 *
 * @param frets Array of fret positions
 * @param expectedNotes Expected chord notes
 * @param tuning Guitar tuning (default: standard)
 * @returns true if voicing is valid
 *
 * @example
 * // C major open position: x-3-2-0-1-0
 * validateChordVoicing([-1, 3, 2, 0, 1, 0], ['C', 'E', 'G']) => true
 */
export function validateChordVoicing(
  frets: number[],
  expectedNotes: string[],
  tuning: string[] = STANDARD_TUNING
): boolean {
  if (expectedNotes.length === 0) return false;

  const playedNotes = fretsToNotes(frets, tuning);

  // Check if all expected notes are present (using chromatic comparison)
  return expectedNotes.every(expectedNote => {
    const expectedChroma = Note.chroma(expectedNote);
    return playedNotes.some(playedNote =>
      Note.chroma(playedNote) === expectedChroma
    );
  });
}

/**
 * Transposes a note by a given number of semitones
 *
 * @param note Starting note
 * @param semitones Number of semitones to transpose (positive = up, negative = down)
 * @returns Transposed note name
 *
 * @example
 * transposeNote('C', 2) => 'D'
 * transposeNote('C', 12) => 'C'
 * transposeNote('F#', -1) => 'F'
 */
export function transposeNote(note: string, semitones: number): string {
  return Note.transpose(note, Interval.fromSemitones(semitones));
}

/**
 * Calculates the interval between two notes in semitones
 *
 * @param note1 First note
 * @param note2 Second note
 * @returns Number of semitones between notes
 *
 * @example
 * getIntervalSemitones('C', 'E') => 4
 * getIntervalSemitones('C', 'G') => 7
 */
export function getIntervalSemitones(note1: string, note2: string): number {
  const interval = Note.distance(note1, note2);
  return Interval.semitones(interval) || 0;
}

/**
 * Normalizes note name (converts flats to sharps for consistency)
 *
 * @param note Note name (can be sharp or flat)
 * @returns Normalized note name
 *
 * @example
 * normalizeNote('Db') => 'C#'
 * normalizeNote('C#') => 'C#'
 */
export function normalizeNote(note: string): string {
  return Note.simplify(note);
}

/**
 * Gets the enharmonic equivalent of a note
 *
 * @param note Note name
 * @returns Enharmonic equivalent
 *
 * @example
 * getEnharmonic('C#') => 'Db'
 * getEnharmonic('Db') => 'C#'
 */
export function getEnharmonic(note: string): string {
  return Note.enharmonic(note);
}

/**
 * Checks if a note is valid
 *
 * @param note Note name to check
 * @returns true if note is valid
 *
 * @example
 * isValidNote('C') => true
 * isValidNote('X') => false
 */
export function isValidNote(note: string): boolean {
  return Note.get(note).name !== '';
}

/**
 * Gets chord information including intervals and aliases
 *
 * @param root Root note
 * @param quality Chord quality
 * @returns Chord information object
 *
 * @example
 * getChordInfo('C', 'major') => {
 *   name: 'C major',
 *   notes: ['C', 'E', 'G'],
 *   intervals: ['1P', '3M', '5P'],
 *   aliases: ['CM', 'Cmaj']
 * }
 */
export function getChordInfo(root: string, quality: string = '') {
  const notes = getChordNotes(root, quality);
  const chordName = `${root}${quality}`;
  const chord = Chord.get(chordName);

  return {
    name: chord.name || chordName,
    notes,
    intervals: chord.intervals || [],
    aliases: chord.aliases || [],
    empty: chord.empty,
    quality: chord.quality || quality
  };
}
