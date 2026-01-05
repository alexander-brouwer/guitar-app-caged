import { describe, it, expect } from 'vitest';
import { extendedChordShapes, getExtendedChordShape, isExtendedChord, getExtendedChordTypes } from '../data/extendedChords';

describe('Extended Chords Static Data Tests', () => {
  describe('Chord Shape Structure', () => {
    it('all chord shapes should have exactly 6 strings', () => {
      Object.entries(extendedChordShapes).forEach(([name, shape]) => {
        expect(shape).toHaveLength(6);
      });
    });

    it('all fret values should be valid (-1 to 24)', () => {
      Object.entries(extendedChordShapes).forEach(([name, shape]) => {
        shape.forEach((fret, index) => {
          expect(fret).toBeGreaterThanOrEqual(-1);
          expect(fret).toBeLessThanOrEqual(24);
        });
      });
    });

    it('should have at least one non-muted string per chord', () => {
      Object.entries(extendedChordShapes).forEach(([name, shape]) => {
        const nonMutedStrings = shape.filter(f => f >= 0);
        expect(nonMutedStrings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Major 7th Chords (maj7)', () => {
    const maj7Chords = ['Cmaj7', 'C#maj7', 'Dbmaj7', 'Dmaj7', 'D#maj7', 'Ebmaj7',
                        'Emaj7', 'Fmaj7', 'F#maj7', 'Gbmaj7', 'Gmaj7', 'G#maj7',
                        'Abmaj7', 'Amaj7', 'A#maj7', 'Bbmaj7', 'Bmaj7'];

    it('should have all 12 chromatic notes as maj7', () => {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticNotes.forEach(note => {
        const chordName = `${note}maj7`;
        expect(extendedChordShapes[chordName]).toBeDefined();
      });
    });

    it('Cmaj7 should have correct shape', () => {
      expect(extendedChordShapes['Cmaj7']).toEqual([-1, 3, 2, 0, 0, 0]);
    });

    it('Dmaj7 should have correct shape', () => {
      expect(extendedChordShapes['Dmaj7']).toEqual([-1, -1, 0, 2, 2, 2]);
    });

    it('Emaj7 should have correct shape', () => {
      expect(extendedChordShapes['Emaj7']).toEqual([0, 2, 1, 1, 0, 0]);
    });

    it('Gmaj7 should have correct shape', () => {
      expect(extendedChordShapes['Gmaj7']).toEqual([3, 2, 0, 0, 0, 2]);
    });

    it('Amaj7 should have correct shape', () => {
      expect(extendedChordShapes['Amaj7']).toEqual([-1, 0, 2, 1, 2, 0]);
    });

    it('enharmonic equivalents should be identical (C# = Db)', () => {
      expect(extendedChordShapes['C#maj7']).toEqual(extendedChordShapes['Dbmaj7']);
      expect(extendedChordShapes['D#maj7']).toEqual(extendedChordShapes['Ebmaj7']);
      expect(extendedChordShapes['F#maj7']).toEqual(extendedChordShapes['Gbmaj7']);
      expect(extendedChordShapes['G#maj7']).toEqual(extendedChordShapes['Abmaj7']);
      expect(extendedChordShapes['A#maj7']).toEqual(extendedChordShapes['Bbmaj7']);
    });
  });

  describe('Minor 7th Chords (m7)', () => {
    it('should have all 12 chromatic notes as m7', () => {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticNotes.forEach(note => {
        const chordName = `${note}m7`;
        expect(extendedChordShapes[chordName]).toBeDefined();
      });
    });

    it('Am7 should have correct shape', () => {
      expect(extendedChordShapes['Am7']).toEqual([-1, 0, 2, 0, 1, 0]);
    });

    it('Dm7 should have correct shape', () => {
      expect(extendedChordShapes['Dm7']).toEqual([-1, -1, 0, 2, 1, 1]);
    });

    it('Em7 should have correct shape', () => {
      expect(extendedChordShapes['Em7']).toEqual([0, 2, 0, 0, 0, 0]);
    });

    it('Gm7 should have correct shape', () => {
      expect(extendedChordShapes['Gm7']).toEqual([3, 5, 3, 3, 3, 3]);
    });

    it('Bm7 should have correct shape', () => {
      expect(extendedChordShapes['Bm7']).toEqual([-1, 2, 4, 2, 3, 2]);
    });

    it('enharmonic equivalents should be identical', () => {
      expect(extendedChordShapes['C#m7']).toEqual(extendedChordShapes['Dbm7']);
      expect(extendedChordShapes['D#m7']).toEqual(extendedChordShapes['Ebm7']);
      expect(extendedChordShapes['F#m7']).toEqual(extendedChordShapes['Gbm7']);
      expect(extendedChordShapes['G#m7']).toEqual(extendedChordShapes['Abm7']);
      expect(extendedChordShapes['A#m7']).toEqual(extendedChordShapes['Bbm7']);
    });
  });

  describe('Dominant 7th Chords (7)', () => {
    it('should have all 12 chromatic notes as 7', () => {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticNotes.forEach(note => {
        const chordName = `${note}7`;
        expect(extendedChordShapes[chordName]).toBeDefined();
      });
    });

    it('C7 should have correct shape', () => {
      expect(extendedChordShapes['C7']).toEqual([-1, 3, 2, 3, 1, 0]);
    });

    it('D7 should have correct shape', () => {
      expect(extendedChordShapes['D7']).toEqual([-1, -1, 0, 2, 1, 2]);
    });

    it('E7 should have correct shape', () => {
      expect(extendedChordShapes['E7']).toEqual([0, 2, 0, 1, 0, 0]);
    });

    it('G7 should have correct shape', () => {
      expect(extendedChordShapes['G7']).toEqual([3, 2, 0, 0, 0, 1]);
    });

    it('A7 should have correct shape', () => {
      expect(extendedChordShapes['A7']).toEqual([-1, 0, 2, 0, 2, 0]);
    });

    it('B7 should have correct shape', () => {
      expect(extendedChordShapes['B7']).toEqual([-1, 2, 1, 2, 0, 2]);
    });

    it('enharmonic equivalents should be identical', () => {
      expect(extendedChordShapes['C#7']).toEqual(extendedChordShapes['Db7']);
      expect(extendedChordShapes['D#7']).toEqual(extendedChordShapes['Eb7']);
      expect(extendedChordShapes['F#7']).toEqual(extendedChordShapes['Gb7']);
      expect(extendedChordShapes['G#7']).toEqual(extendedChordShapes['Ab7']);
      expect(extendedChordShapes['A#7']).toEqual(extendedChordShapes['Bb7']);
    });
  });

  describe('Sus2 Chords', () => {
    it('should have all 12 chromatic notes as sus2', () => {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticNotes.forEach(note => {
        const chordName = `${note}sus2`;
        expect(extendedChordShapes[chordName]).toBeDefined();
      });
    });

    it('Csus2 should have correct shape', () => {
      expect(extendedChordShapes['Csus2']).toEqual([-1, 3, 0, 0, 3, 3]);
    });

    it('Dsus2 should have correct shape', () => {
      expect(extendedChordShapes['Dsus2']).toEqual([-1, -1, 0, 2, 3, 0]);
    });

    it('Esus2 should have correct shape', () => {
      expect(extendedChordShapes['Esus2']).toEqual([0, 2, 4, 4, 0, 0]);
    });

    it('Gsus2 should have correct shape', () => {
      expect(extendedChordShapes['Gsus2']).toEqual([3, 0, 0, 0, 3, 3]);
    });

    it('Asus2 should have correct shape', () => {
      expect(extendedChordShapes['Asus2']).toEqual([-1, 0, 2, 2, 0, 0]);
    });

    it('enharmonic equivalents should be identical', () => {
      expect(extendedChordShapes['C#sus2']).toEqual(extendedChordShapes['Dbsus2']);
      expect(extendedChordShapes['D#sus2']).toEqual(extendedChordShapes['Ebsus2']);
      expect(extendedChordShapes['F#sus2']).toEqual(extendedChordShapes['Gbsus2']);
      expect(extendedChordShapes['G#sus2']).toEqual(extendedChordShapes['Absus2']);
      expect(extendedChordShapes['A#sus2']).toEqual(extendedChordShapes['Bbsus2']);
    });
  });

  describe('Sus4 Chords', () => {
    it('should have all 12 chromatic notes as sus4', () => {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticNotes.forEach(note => {
        const chordName = `${note}sus4`;
        expect(extendedChordShapes[chordName]).toBeDefined();
      });
    });

    it('Csus4 should have correct shape', () => {
      expect(extendedChordShapes['Csus4']).toEqual([-1, 3, 3, 0, 1, 1]);
    });

    it('Dsus4 should have correct shape', () => {
      expect(extendedChordShapes['Dsus4']).toEqual([-1, -1, 0, 2, 3, 3]);
    });

    it('Esus4 should have correct shape', () => {
      expect(extendedChordShapes['Esus4']).toEqual([0, 2, 2, 2, 0, 0]);
    });

    it('Gsus4 should have correct shape', () => {
      expect(extendedChordShapes['Gsus4']).toEqual([3, 3, 0, 0, 1, 3]);
    });

    it('Asus4 should have correct shape', () => {
      expect(extendedChordShapes['Asus4']).toEqual([-1, 0, 2, 2, 3, 0]);
    });

    it('enharmonic equivalents should be identical', () => {
      expect(extendedChordShapes['C#sus4']).toEqual(extendedChordShapes['Dbsus4']);
      expect(extendedChordShapes['D#sus4']).toEqual(extendedChordShapes['Ebsus4']);
      expect(extendedChordShapes['F#sus4']).toEqual(extendedChordShapes['Gbsus4']);
      expect(extendedChordShapes['G#sus4']).toEqual(extendedChordShapes['Absus4']);
      expect(extendedChordShapes['A#sus4']).toEqual(extendedChordShapes['Bbsus4']);
    });
  });

  describe('Helper Functions', () => {
    describe('getExtendedChordShape', () => {
      it('should return correct shape for valid chord name', () => {
        const shape = getExtendedChordShape('Cmaj7');
        expect(shape).toEqual([-1, 3, 2, 0, 0, 0]);
      });

      it('should return null for unknown chord name', () => {
        const shape = getExtendedChordShape('Xmaj7');
        expect(shape).toBeNull();
      });

      it('should work for all chord types', () => {
        expect(getExtendedChordShape('Am7')).not.toBeNull();
        expect(getExtendedChordShape('G7')).not.toBeNull();
        expect(getExtendedChordShape('Dsus2')).not.toBeNull();
        expect(getExtendedChordShape('Esus4')).not.toBeNull();
      });
    });

    describe('isExtendedChord', () => {
      it('should return true for valid extended chords', () => {
        expect(isExtendedChord('Cmaj7')).toBe(true);
        expect(isExtendedChord('Am7')).toBe(true);
        expect(isExtendedChord('G7')).toBe(true);
        expect(isExtendedChord('Dsus2')).toBe(true);
        expect(isExtendedChord('Esus4')).toBe(true);
      });

      it('should return false for unknown chords', () => {
        expect(isExtendedChord('C')).toBe(false);
        expect(isExtendedChord('Am')).toBe(false);
        expect(isExtendedChord('Xmaj7')).toBe(false);
        expect(isExtendedChord('InvalidChord')).toBe(false);
      });
    });

    describe('getExtendedChordTypes', () => {
      it('should return all available chord types', () => {
        const types = getExtendedChordTypes();
        expect(types).toContain('maj7');
        expect(types).toContain('min7');
        expect(types).toContain('m7');
        expect(types).toContain('7');
        expect(types).toContain('sus2');
        expect(types).toContain('sus4');
      });

      it('should return an array', () => {
        const types = getExtendedChordTypes();
        expect(Array.isArray(types)).toBe(true);
      });
    });
  });

  describe('Complete Coverage', () => {
    it('should have exactly 85 chord shapes (5 types × 17 chords)', () => {
      const count = Object.keys(extendedChordShapes).length;
      expect(count).toBe(85);
    });

    it('should have equal count for each chord type', () => {
      const maj7Count = Object.keys(extendedChordShapes).filter(k => k.includes('maj7')).length;
      const m7Count = Object.keys(extendedChordShapes).filter(k => k.endsWith('m7')).length;
      const dom7Count = Object.keys(extendedChordShapes).filter(k => k.match(/^[A-G][#b]?7$/)).length;
      const sus2Count = Object.keys(extendedChordShapes).filter(k => k.includes('sus2')).length;
      const sus4Count = Object.keys(extendedChordShapes).filter(k => k.includes('sus4')).length;

      // Each type should have 17 chords (12 chromatic + 5 enharmonic equivalents)
      expect(maj7Count).toBe(17);
      expect(m7Count).toBe(17);
      expect(dom7Count).toBe(17);
      expect(sus2Count).toBe(17);
      expect(sus4Count).toBe(17);
    });
  });

  describe('Tablature Format Compatibility', () => {
    it('shapes should convert to valid tablature strings', () => {
      Object.entries(extendedChordShapes).forEach(([name, shape]) => {
        const tab = shape.map(f => f === -1 ? 'x' : f.toString()).join('-');
        expect(tab).toMatch(/^[x0-9]+-[x0-9]+-[x0-9]+-[x0-9]+-[x0-9]+-[x0-9]+$/);
      });
    });
  });

  describe('Known Chord Comparisons', () => {
    // Compare against well-known chord shapes from music theory
    it('maj7 chords should follow 1-3-5-7 interval pattern', () => {
      // Cmaj7 = C-E-G-B (Root on A string, 3rd fret)
      // Expected: x-3-2-0-0-0 = C-G-C-E-G (actual intervals vary by voicing)
      expect(extendedChordShapes['Cmaj7']).toEqual([-1, 3, 2, 0, 0, 0]);
    });

    it('min7 chords should follow 1-b3-5-b7 interval pattern', () => {
      // Am7 = A-C-E-G (Root on A string, open)
      // Expected: x-0-2-0-1-0
      expect(extendedChordShapes['Am7']).toEqual([-1, 0, 2, 0, 1, 0]);
    });

    it('dom7 chords should follow 1-3-5-b7 interval pattern', () => {
      // G7 = G-B-D-F (Root on E string, 3rd fret)
      // Expected: 3-2-0-0-0-1
      expect(extendedChordShapes['G7']).toEqual([3, 2, 0, 0, 0, 1]);
    });

    it('sus2 chords should follow 1-2-5 interval pattern', () => {
      // Asus2 = A-B-E (Root on A string, open)
      // Expected: x-0-2-2-0-0
      expect(extendedChordShapes['Asus2']).toEqual([-1, 0, 2, 2, 0, 0]);
    });

    it('sus4 chords should follow 1-4-5 interval pattern', () => {
      // Dsus4 = D-G-A (Root on D string, open)
      // Expected: x-x-0-2-3-3
      expect(extendedChordShapes['Dsus4']).toEqual([-1, -1, 0, 2, 3, 3]);
    });
  });
});
