/**
 * Unit Tests for Music Theory Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getChordNotes,
  validateChordVoicing,
  transposeNote,
  getIntervalSemitones,
  normalizeNote,
  getEnharmonic,
  isValidNote,
  getChordInfo,
  fretsToNotes
} from '../utils/musicTheory';

describe('Music Theory Tests', () => {
  describe('getChordNotes', () => {
    it('should return correct notes for C major', () => {
      const notes = getChordNotes('C', 'major');
      expect(notes).toEqual(['C', 'E', 'G']);
    });

    it('should return correct notes for A minor', () => {
      const notes = getChordNotes('A', 'minor');
      expect(notes).toEqual(['A', 'C', 'E']);
    });

    it('should return correct notes for G7', () => {
      const notes = getChordNotes('G', '7');
      expect(notes).toEqual(['G', 'B', 'D', 'F']);
    });

    it('should return correct notes for Dmaj7', () => {
      const notes = getChordNotes('D', 'maj7');
      expect(notes).toEqual(['D', 'F#', 'A', 'C#']);
    });

    it('should return correct notes for Em7', () => {
      const notes = getChordNotes('E', 'm7');
      expect(notes).toEqual(['E', 'G', 'B', 'D']);
    });

    it('should return correct notes for Csus2', () => {
      const notes = getChordNotes('C', 'sus2');
      expect(notes).toEqual(['C', 'D', 'G']);
    });

    it('should return correct notes for Asus4', () => {
      const notes = getChordNotes('A', 'sus4');
      expect(notes).toEqual(['A', 'D', 'E']);
    });

    it('should handle sharp notes (F#)', () => {
      const notes = getChordNotes('F#', 'major');
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0]).toBe('F#');
    });

    it('should handle flat notes (Bb)', () => {
      const notes = getChordNotes('Bb', 'major');
      expect(notes.length).toBeGreaterThan(0);
    });
  });

  describe('fretsToNotes', () => {
    it('should convert C major open position to notes', () => {
      // C major: x-3-2-0-1-0
      const frets = [-1, 3, 2, 0, 1, 0];
      const notes = fretsToNotes(frets);

      // Should contain C, E, G (possibly duplicated)
      expect(notes).toContain('C');
      expect(notes).toContain('E');
      expect(notes).toContain('G');
    });

    it('should handle muted strings correctly', () => {
      const frets = [-1, -1, 0, 2, 3, 2]; // D major
      const notes = fretsToNotes(frets);

      // Should have 4 notes (strings 3,4,5,6)
      expect(notes.length).toBe(4);
    });

    it('should handle all open strings', () => {
      const frets = [0, 0, 0, 0, 0, 0];
      const notes = fretsToNotes(frets);

      expect(notes).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    });
  });

  describe('validateChordVoicing', () => {
    it('should validate C major open position', () => {
      const frets = [-1, 3, 2, 0, 1, 0];
      const expectedNotes = ['C', 'E', 'G'];

      expect(validateChordVoicing(frets, expectedNotes)).toBe(true);
    });

    it('should validate A minor open position', () => {
      const frets = [-1, 0, 2, 2, 1, 0];
      const expectedNotes = ['A', 'C', 'E'];

      expect(validateChordVoicing(frets, expectedNotes)).toBe(true);
    });

    it('should validate E major open position', () => {
      const frets = [0, 2, 2, 1, 0, 0];
      const expectedNotes = ['E', 'G#', 'B'];

      expect(validateChordVoicing(frets, expectedNotes)).toBe(true);
    });

    it('should reject incorrect voicing', () => {
      const frets = [-1, 3, 2, 0, 1, 0]; // C major frets
      const expectedNotes = ['D', 'F#', 'A']; // D major notes

      expect(validateChordVoicing(frets, expectedNotes)).toBe(false);
    });

    it('should return false for empty expected notes', () => {
      const frets = [-1, 3, 2, 0, 1, 0];
      const expectedNotes: string[] = [];

      expect(validateChordVoicing(frets, expectedNotes)).toBe(false);
    });
  });

  describe('transposeNote', () => {
    it('should transpose C up 2 semitones to D', () => {
      expect(transposeNote('C', 2)).toBe('D');
    });

    it('should transpose C up 12 semitones to C (octave)', () => {
      expect(transposeNote('C', 12)).toBe('C');
    });

    it('should transpose F# down 1 semitone to F (or E#)', () => {
      const result = transposeNote('F#', -1);
      // E# and F are enharmonic equivalents
      expect(['F', 'E#']).toContain(result);
    });

    it('should transpose G up 7 semitones to D', () => {
      expect(transposeNote('G', 7)).toBe('D');
    });

    it('should handle negative transposition', () => {
      expect(transposeNote('E', -5)).toBe('B');
    });
  });

  describe('getIntervalSemitones', () => {
    it('should calculate C to E as 4 semitones (major third)', () => {
      expect(getIntervalSemitones('C', 'E')).toBe(4);
    });

    it('should calculate C to G as 7 semitones (perfect fifth)', () => {
      expect(getIntervalSemitones('C', 'G')).toBe(7);
    });

    it('should calculate C to C as 0 semitones (unison)', () => {
      expect(getIntervalSemitones('C', 'C')).toBe(0);
    });

    it('should calculate descending interval', () => {
      const interval = getIntervalSemitones('G', 'C');
      expect(interval).toBe(5); // G to C upward
    });
  });

  describe('normalizeNote', () => {
    it('should simplify note names consistently', () => {
      // Tonal.js simplify() may keep flats or convert to sharps
      // The important thing is it returns a valid note
      const result = normalizeNote('Db');
      expect(isValidNote(result)).toBe(true);
    });

    it('should simplify Eb consistently', () => {
      const result = normalizeNote('Eb');
      expect(isValidNote(result)).toBe(true);
    });

    it('should keep C# as valid note', () => {
      const result = normalizeNote('C#');
      expect(isValidNote(result)).toBe(true);
      expect(result).toBe('C#');
    });

    it('should keep C as C', () => {
      expect(normalizeNote('C')).toBe('C');
    });
  });

  describe('getEnharmonic', () => {
    it('should get enharmonic of C# as Db', () => {
      expect(getEnharmonic('C#')).toBe('Db');
    });

    it('should get enharmonic of Db as C#', () => {
      expect(getEnharmonic('Db')).toBe('C#');
    });

    it('should get enharmonic of F# as Gb', () => {
      expect(getEnharmonic('F#')).toBe('Gb');
    });
  });

  describe('isValidNote', () => {
    it('should validate C as valid note', () => {
      expect(isValidNote('C')).toBe(true);
    });

    it('should validate F# as valid note', () => {
      expect(isValidNote('F#')).toBe(true);
    });

    it('should validate Bb as valid note', () => {
      expect(isValidNote('Bb')).toBe(true);
    });

    it('should reject X as invalid note', () => {
      expect(isValidNote('X')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidNote('')).toBe(false);
    });
  });

  describe('getChordInfo', () => {
    it('should get info for C major', () => {
      const info = getChordInfo('C', 'major');

      expect(info.notes).toEqual(['C', 'E', 'G']);
      expect(info.empty).toBe(false);
      expect(info.intervals.length).toBeGreaterThan(0);
    });

    it('should get info for Dm7', () => {
      const info = getChordInfo('D', 'm7');

      expect(info.notes).toContain('D');
      expect(info.notes).toContain('F');
      expect(info.notes).toContain('A');
      expect(info.notes).toContain('C');
      expect(info.empty).toBe(false);
    });

    it('should return empty info for invalid chord', () => {
      const info = getChordInfo('X', 'invalid');

      expect(info.empty).toBe(true);
      expect(info.notes.length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should validate common guitar chords', () => {
      const chords = [
        { name: 'C major', frets: [-1, 3, 2, 0, 1, 0], root: 'C', quality: 'major' },
        { name: 'G major', frets: [3, 2, 0, 0, 0, 3], root: 'G', quality: 'major' },
        { name: 'D major', frets: [-1, -1, 0, 2, 3, 2], root: 'D', quality: 'major' },
        { name: 'A major', frets: [-1, 0, 2, 2, 2, 0], root: 'A', quality: 'major' },
        { name: 'E major', frets: [0, 2, 2, 1, 0, 0], root: 'E', quality: 'major' },
        { name: 'A minor', frets: [-1, 0, 2, 2, 1, 0], root: 'A', quality: 'minor' },
        { name: 'E minor', frets: [0, 2, 2, 0, 0, 0], root: 'E', quality: 'minor' },
        { name: 'D minor', frets: [-1, -1, 0, 2, 3, 1], root: 'D', quality: 'minor' }
      ];

      chords.forEach(chord => {
        const expectedNotes = getChordNotes(chord.root, chord.quality);
        const isValid = validateChordVoicing(chord.frets, expectedNotes);

        expect(isValid).toBe(true);
      });
    });

    it('should correctly transpose through all 12 notes', () => {
      // Test transposing C through all 12 semitones
      for (let semitones = 0; semitones < 12; semitones++) {
        const transposed = transposeNote('C', semitones);
        // Note names might differ (e.g., Db vs C#), so we just check it's valid
        expect(transposed).toBeTruthy();
        expect(isValidNote(transposed)).toBe(true);
      }

      // Full circle should return to C
      expect(transposeNote('C', 12)).toBe('C');
    });
  });
});
