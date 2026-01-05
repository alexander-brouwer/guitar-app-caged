/**
 * Integration Tests for chords-db Database
 * Tests that the fixed chordDatabase.ts correctly accesses chords-db
 */

import { describe, it, expect } from 'vitest';
import { getChordVoicingsFromDB, getAvailableSuffixes, getAvailableKeys, toAbsoluteFrets } from '../utils/chordDatabase';
import { getChordNotes, validateChordVoicing } from '../utils/musicTheory';

describe('chords-db Integration Tests', () => {
  describe('getChordVoicingsFromDB', () => {
    it('should get Bdim voicings from database', () => {
      const voicings = getChordVoicingsFromDB('B', 'dim');
      expect(voicings.length).toBeGreaterThan(0);
      console.log(`✅ Bdim has ${voicings.length} voicings in database`);

      // Validate first voicing using absolute frets
      const theoreticalNotes = getChordNotes('B', 'dim'); // ['B', 'D', 'F']
      const absoluteFrets = toAbsoluteFrets(voicings[0]);
      const isValid = validateChordVoicing(absoluteFrets, theoreticalNotes);
      expect(isValid).toBe(true);
    });

    it('should get C major voicings from database', () => {
      const voicings = getChordVoicingsFromDB('C', 'major');
      expect(voicings.length).toBeGreaterThan(0);

      const theoreticalNotes = getChordNotes('C', 'major');
      const absoluteFrets = toAbsoluteFrets(voicings[0]);
      const isValid = validateChordVoicing(absoluteFrets, theoreticalNotes);
      expect(isValid).toBe(true);
    });

    it('should get A minor voicings from database', () => {
      const voicings = getChordVoicingsFromDB('A', 'minor');
      expect(voicings.length).toBeGreaterThan(0);

      const theoreticalNotes = getChordNotes('A', 'minor');
      const absoluteFrets = toAbsoluteFrets(voicings[0]);
      const isValid = validateChordVoicing(absoluteFrets, theoreticalNotes);
      expect(isValid).toBe(true);
    });

    it('should handle sharp notes (F#)', () => {
      const voicings = getChordVoicingsFromDB('F#', 'major');
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('should handle flat notes (Bb)', () => {
      const voicings = getChordVoicingsFromDB('Bb', 'major');
      expect(voicings.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent chord', () => {
      const voicings = getChordVoicingsFromDB('X', 'invalid');
      expect(voicings).toEqual([]);
    });
  });

  describe('getAvailableSuffixes', () => {
    it('should get all available suffixes', () => {
      const suffixes = getAvailableSuffixes();
      expect(suffixes.length).toBeGreaterThan(10);
      console.log(`✅ Database has ${suffixes.length} chord types`);
    });

    it('should include common chord types', () => {
      const suffixes = getAvailableSuffixes();
      expect(suffixes).toContain('major');
      expect(suffixes).toContain('minor');
      expect(suffixes).toContain('dim');
      expect(suffixes).toContain('7');
      expect(suffixes).toContain('maj7');
      expect(suffixes).toContain('m7');
    });

    it('should include extended chord types', () => {
      const suffixes = getAvailableSuffixes();
      expect(suffixes).toContain('sus2');
      expect(suffixes).toContain('sus4');
      expect(suffixes).toContain('aug');
      expect(suffixes).toContain('9');
    });
  });

  describe('getAvailableKeys', () => {
    it('should get all available keys', () => {
      const keys = getAvailableKeys();
      expect(keys.length).toBe(12); // 12 chromatic notes
      console.log(`✅ Database has ${keys.length} keys:`, keys);
    });

    it('should include all natural notes', () => {
      const keys = getAvailableKeys();
      expect(keys).toContain('C');
      expect(keys).toContain('D');
      expect(keys).toContain('E');
      expect(keys).toContain('F');
      expect(keys).toContain('G');
      expect(keys).toContain('A');
      expect(keys).toContain('B');
    });

    it('should include sharp notes in chords-db format', () => {
      const keys = getAvailableKeys();
      expect(keys).toContain('Csharp'); // chords-db uses 'Csharp' not 'C#'
      expect(keys).toContain('Fsharp'); // chords-db uses 'Fsharp' not 'F#'
    });

    it('should include flat notes', () => {
      const keys = getAvailableKeys();
      expect(keys).toContain('Eb');
      expect(keys).toContain('Ab');
      expect(keys).toContain('Bb');
    });
  });

  describe('Music Theory Validation', () => {
    it('should validate all common chords against Tonal.js', () => {
      const testChords = [
        { note: 'C', quality: 'major' },
        { note: 'A', quality: 'minor' },
        { note: 'B', quality: 'dim' },
        { note: 'D', quality: '7' },
        { note: 'E', quality: 'maj7' },
        { note: 'F', quality: 'm7' },
        { note: 'G', quality: 'sus4' },
      ];

      testChords.forEach(({ note, quality }) => {
        const voicings = getChordVoicingsFromDB(note, quality);
        expect(voicings.length).toBeGreaterThan(0);

        const theoreticalNotes = getChordNotes(note, quality);
        const absoluteFrets = toAbsoluteFrets(voicings[0]);
        const isValid = validateChordVoicing(absoluteFrets, theoreticalNotes);
        expect(isValid).toBe(true);
      });
    });

    it('should correctly identify Bdim notes (B-D-F)', () => {
      const voicings = getChordVoicingsFromDB('B', 'dim');
      const theoreticalNotes = getChordNotes('B', 'dim');

      expect(theoreticalNotes).toEqual(['B', 'D', 'F']);

      // Validate first voicing using absolute frets
      const absoluteFrets = toAbsoluteFrets(voicings[0]);
      const isValid = validateChordVoicing(absoluteFrets, theoreticalNotes);
      expect(isValid).toBe(true);

      console.log(`✅ Bdim theoretical notes: ${theoreticalNotes.join(', ')}`);
      console.log(`✅ Bdim first voicing: ${absoluteFrets.join('-')}`);
    });

    it('should distinguish Bdim from Dm6', () => {
      const bdimNotes = getChordNotes('B', 'dim');
      const dm6Notes = getChordNotes('D', 'm6');

      expect(bdimNotes).toEqual(['B', 'D', 'F']);
      expect(dm6Notes).toEqual(['D', 'F', 'A', 'B']);

      // They are different chords
      expect(bdimNotes.length).toBe(3); // triads have 3 notes
      expect(dm6Notes.length).toBe(4); // 6th chords have 4 notes
    });
  });

  describe('Database Statistics', () => {
    it('should have multiple voicings per chord', () => {
      const testChords = ['C', 'G', 'Am', 'Bdim'];

      testChords.forEach(chordName => {
        const [note, ...qualityParts] = chordName.split('');
        const quality = qualityParts.join('') || 'major';

        const voicings = getChordVoicingsFromDB(note, quality);
        expect(voicings.length).toBeGreaterThan(1);
        console.log(`${chordName}: ${voicings.length} voicings`);
      });
    });
  });

  describe('CAGED Modal Voicings Debug', () => {
    it('should validate all Am voicings from database with absolute frets', () => {
      const voicings = getChordVoicingsFromDB('A', 'minor');
      const theoreticalNotes = getChordNotes('A', 'minor');

      console.log('\n=== Am Voicing Validation Debug (FIXED with absolute frets) ===');
      console.log(`Theoretical notes: ${theoreticalNotes.join(', ')}`);
      console.log(`Total voicings in database: ${voicings.length}\n`);

      voicings.forEach((voicing, index) => {
        const absoluteFrets = toAbsoluteFrets(voicing);
        const isValid = validateChordVoicing(absoluteFrets, theoreticalNotes);
        console.log(`Voicing ${index + 1}:`);
        console.log(`  baseFret: ${voicing.baseFret}`);
        console.log(`  relative frets: [${voicing.frets.join(', ')}]`);
        console.log(`  absolute frets: [${absoluteFrets.join(', ')}]`);
        console.log(`  validated: ${isValid ? '✅ YES' : '❌ NO'}`);
      });

      // ALL should be valid now with absolute frets!
      const validCount = voicings.filter(v => {
        const absoluteFrets = toAbsoluteFrets(v);
        return validateChordVoicing(absoluteFrets, theoreticalNotes);
      }).length;

      expect(validCount).toBe(voicings.length); // All 4 should pass
      console.log(`\n✅ Total validated: ${validCount}/${voicings.length} (ALL PASSED!)`);
    });
  });
});
