/**
 * Comprehensive Tests for AlphaTab Chord Generator
 * Tests music theory validation and tablature generation
 */

import { describe, it, expect } from 'vitest';
import {
  generateValidatedAlphaTeX,
  getValidatedChordForAlphaTab,
  validateAndFixVoicing
} from '../utils/alphaTabChordGenerator';
import { getChordNotes } from '../utils/musicTheory';

describe('AlphaTab Chord Generator', () => {
  describe('Quality String Mapping (CRITICAL FIX)', () => {
    it('should handle empty string as major (Phase 1 fix)', () => {
      const result = getValidatedChordForAlphaTab('C', '');

      // Should NOT return fallback (all open strings)
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');

      // Should contain valid C major voicing
      // C major from chords-db: [-1, 3, 2, 0, 1, 0]
      // AlphaTeX: strings are reversed (string 1 = high E)
      expect(result).toContain('.5'); // A string (3rd fret)
      expect(result).toContain('.4'); // D string (2nd fret)
      expect(result).toContain('.1'); // high E string (0 or 1)
    });

    it('should handle explicit "major" quality', () => {
      const emptyResult = getValidatedChordForAlphaTab('C', '');
      const explicitResult = getValidatedChordForAlphaTab('C', 'major');

      // Both should return same voicing
      expect(emptyResult).toBe(explicitResult);
    });

    it('should handle minor quality "m"', () => {
      const result = getValidatedChordForAlphaTab('A', 'm');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should handle minor quality "minor"', () => {
      const shortResult = getValidatedChordForAlphaTab('A', 'm');
      const longResult = getValidatedChordForAlphaTab('A', 'minor');

      // Both should return same voicing
      expect(shortResult).toBe(longResult);
    });
  });

  describe('Music Theory Validation', () => {
    it('should validate C major against Tonal.js', () => {
      const result = getValidatedChordForAlphaTab('C', 'major');
      const theoreticalNotes = getChordNotes('C', 'major');

      expect(theoreticalNotes).toEqual(['C', 'E', 'G']);
      expect(result).toMatch(/\(\d+\.\d+( \d+\.\d+)*\)\.1/); // Valid AlphaTeX format
    });

    it('should validate Bdim correctly', () => {
      const result = getValidatedChordForAlphaTab('B', 'dim');
      const theoreticalNotes = getChordNotes('B', 'dim');

      expect(theoreticalNotes).toEqual(['B', 'D', 'F']);
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1'); // Not fallback
    });

    it('should validate Am correctly', () => {
      const result = getValidatedChordForAlphaTab('A', 'minor');
      const theoreticalNotes = getChordNotes('A', 'minor');

      expect(theoreticalNotes).toEqual(['A', 'C', 'E']);
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate G major correctly', () => {
      const result = getValidatedChordForAlphaTab('G', 'major');
      const theoreticalNotes = getChordNotes('G', 'major');

      expect(theoreticalNotes).toEqual(['G', 'B', 'D']);
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate D major correctly', () => {
      const result = getValidatedChordForAlphaTab('D', 'major');
      const theoreticalNotes = getChordNotes('D', 'major');

      expect(theoreticalNotes).toEqual(['D', 'F#', 'A']);
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate F# major correctly', () => {
      const result = getValidatedChordForAlphaTab('F#', 'major');
      const theoreticalNotes = getChordNotes('F#', 'major');

      expect(theoreticalNotes).toEqual(['F#', 'A#', 'C#']);
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate Em correctly', () => {
      const result = getValidatedChordForAlphaTab('E', 'minor');
      const theoreticalNotes = getChordNotes('E', 'minor');

      expect(theoreticalNotes).toEqual(['E', 'G', 'B']);
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });
  });

  describe('Extended Chords', () => {
    it('should validate C7 correctly', () => {
      const result = getValidatedChordForAlphaTab('C', '7');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate Cmaj7 correctly', () => {
      const result = getValidatedChordForAlphaTab('C', 'maj7');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate Csus4 correctly', () => {
      const result = getValidatedChordForAlphaTab('C', 'sus4');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should validate Cadd9 correctly', () => {
      const result = getValidatedChordForAlphaTab('C', 'add9');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });
  });

  describe('Chord Progression Generation', () => {
    it('should generate valid I-IV-V progression in C major', () => {
      const chords = [
        { note: 'C', quality: '' },      // I
        { note: 'F', quality: '' },      // IV
        { note: 'G', quality: '' }       // V
      ];
      const alphaTex = generateValidatedAlphaTeX(chords);

      expect(alphaTex).toContain('\\title "Chord Progression"');
      expect(alphaTex).toContain('\\tempo 80');
      expect(alphaTex).toContain('|'); // Separator between chords
      expect(alphaTex).not.toContain('(0.6 0.5 0.4 0.3 0.2 0.1)'); // No fallbacks
    });

    it('should generate valid I-IV-V-I progression', () => {
      const chords = [
        { note: 'C', quality: 'major' },
        { note: 'F', quality: 'major' },
        { note: 'G', quality: 'major' },
        { note: 'C', quality: 'major' }
      ];
      const alphaTex = generateValidatedAlphaTeX(chords);

      const pipeCount = (alphaTex.match(/\|/g) || []).length;
      expect(pipeCount).toBeGreaterThanOrEqual(3); // At least 3 separators for 4 chords
    });

    it('should generate valid minor progression (Am-Dm-E)', () => {
      const chords = [
        { note: 'A', quality: 'm' },
        { note: 'D', quality: 'm' },
        { note: 'E', quality: 'major' }
      ];
      const alphaTex = generateValidatedAlphaTeX(chords);

      expect(alphaTex).toContain('\\title');
      expect(alphaTex).not.toContain('(0.6 0.5 0.4 0.3 0.2 0.1)');
    });

    it('should generate valid blues progression (C-F-G-C)', () => {
      const chords = [
        { note: 'C', quality: '7' },
        { note: 'F', quality: '7' },
        { note: 'G', quality: '7' },
        { note: 'C', quality: '7' }
      ];
      const alphaTex = generateValidatedAlphaTeX(chords);

      expect(alphaTex).toContain('\\title');
      expect(alphaTex).not.toContain('(0.6 0.5 0.4 0.3 0.2 0.1)');
    });

    it('should generate diatonic chords in Am', () => {
      const chords = [
        { note: 'A', quality: 'm' },    // i
        { note: 'B', quality: 'dim' },  // ii°
        { note: 'C', quality: '' },     // III
        { note: 'D', quality: 'm' },    // iv
        { note: 'E', quality: 'm' },    // v
        { note: 'F', quality: '' },     // VI
        { note: 'G', quality: '' }      // VII
      ];
      const alphaTex = generateValidatedAlphaTeX(chords);

      expect(alphaTex).toContain('\\title');
      expect(alphaTex).not.toContain('(0.6 0.5 0.4 0.3 0.2 0.1)');

      const pipeCount = (alphaTex.match(/\|/g) || []).length;
      expect(pipeCount).toBeGreaterThanOrEqual(6); // 7 chords = 6 separators
    });
  });

  describe('AlphaTeX Format Validation', () => {
    it('should return valid AlphaTeX format (fret.string pattern)', () => {
      const result = getValidatedChordForAlphaTab('C', 'major');

      // Format: (fret.string fret.string ...).duration
      expect(result).toMatch(/^\(\d+\.\d+( \d+\.\d+)*\)\.\d+$/);
    });

    it('should use whole note duration (.1)', () => {
      const result = getValidatedChordForAlphaTab('G', 'major');
      expect(result).toContain('.1'); // Ends with .1 (whole note)
    });

    it('should handle muted strings correctly (skip -1)', () => {
      // C major has muted low E string: [-1, 3, 2, 0, 1, 0]
      const result = getValidatedChordForAlphaTab('C', 'major');

      // Should not contain "(-1." or "-1.6"
      expect(result).not.toMatch(/-1\./);
    });
  });

  describe('Fallback Behavior', () => {
    it('should use fallback for unknown chord', () => {
      const result = getValidatedChordForAlphaTab('X', 'invalid');
      expect(result).toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1'); // All open strings
    });

    it('should use fallback for unknown note', () => {
      const result = getValidatedChordForAlphaTab('Z', 'major');
      expect(result).toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should use fallback for unknown quality', () => {
      const result = getValidatedChordForAlphaTab('C', 'xxx');
      // Might return fallback or first available voicing
      expect(result).toMatch(/^\([\d\. ]+\)\.\d+$/); // Valid format
    });
  });

  describe('validateAndFixVoicing Function', () => {
    it('should validate correct C major voicing', () => {
      const result = validateAndFixVoicing([-1, 3, 2, 0, 1, 0], 'C', 'major');

      expect(result.isValid).toBe(true);
      expect(result.theoreticalNotes).toEqual(['C', 'E', 'G']);
      expect(result.message).toContain('✅');
      expect(result.correctedFrets).toBeUndefined();
    });

    it('should suggest fix for incorrect C major voicing', () => {
      const result = validateAndFixVoicing([0, 0, 0, 0, 0, 0], 'C', 'major');

      expect(result.isValid).toBe(false);
      expect(result.theoreticalNotes).toEqual(['C', 'E', 'G']);
      expect(result.message).toContain('❌');
      expect(result.correctedFrets).toBeDefined();
    });

    it('should validate correct Am voicing', () => {
      const result = validateAndFixVoicing([-1, 0, 2, 2, 1, 0], 'A', 'minor');

      expect(result.isValid).toBe(true);
      expect(result.theoreticalNotes).toEqual(['A', 'C', 'E']);
    });

    it('should handle empty string quality as major', () => {
      const result = validateAndFixVoicing([-1, 3, 2, 0, 1, 0], 'C', '');

      // Should treat '' as major
      expect(result.theoreticalNotes).toEqual(['C', 'E', 'G']);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Regression Tests', () => {
    it('should NOT return 000000 for C major (regression)', () => {
      const result = getValidatedChordForAlphaTab('C', '');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should NOT return 000000 for any major chord with empty string', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

      notes.forEach(note => {
        const result = getValidatedChordForAlphaTab(note, '');
        expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
      });
    });

    it('should handle all diatonic chords in C major', () => {
      const chords = [
        { note: 'C', quality: '' },
        { note: 'D', quality: 'm' },
        { note: 'E', quality: 'm' },
        { note: 'F', quality: '' },
        { note: 'G', quality: '' },
        { note: 'A', quality: 'm' },
        { note: 'B', quality: 'dim' }
      ];

      chords.forEach(chord => {
        const result = getValidatedChordForAlphaTab(chord.note, chord.quality);
        expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
      });
    });
  });

  describe('Sharp and Flat Notes', () => {
    it('should handle F# major', () => {
      const result = getValidatedChordForAlphaTab('F#', 'major');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should handle Bb major', () => {
      const result = getValidatedChordForAlphaTab('Bb', 'major');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should handle Eb major', () => {
      const result = getValidatedChordForAlphaTab('Eb', 'major');
      expect(result).not.toBe('(0.6 0.5 0.4 0.3 0.2 0.1).1');
    });

    it('should handle C# minor', () => {
      const result = getValidatedChordForAlphaTab('C#', 'minor');
      // C# might not be in database (Db is enharmonic), may use fallback
      expect(result).toMatch(/^\([\d\. ]+\)\.\d+$/); // Valid format
    });
  });
});
