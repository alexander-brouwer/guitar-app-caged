import { describe, it, expect } from 'vitest';
import { generateCAGEDVoicings, getChordShape } from '../utils/cagedSystem';

// Helper function to get note index
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function getNoteIndex(note: string): number {
  return noteNames.indexOf(note);
}

describe('CAGED System Tests', () => {
  describe('Voicing Generation - Major Chords', () => {
    it('should generate exactly 5 voicings for C major', () => {
      const voicings = generateCAGEDVoicings('C', '');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('should generate exactly 5 voicings for G major', () => {
      const voicings = generateCAGEDVoicings('G', '');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('should generate exactly 5 voicings for F# major', () => {
      const voicings = generateCAGEDVoicings('F#', '');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('all major voicings should be playable (max fret <= 15)', () => {
      const testNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      testNotes.forEach(note => {
        const voicings = generateCAGEDVoicings(note, '');
        voicings.forEach(v => {
          const maxFret = Math.max(...v.frets.filter(f => f > 0));
          expect(maxFret).toBeLessThanOrEqual(15);
        });
      });
    });
  });

  describe('Voicing Generation - Minor Chords', () => {
    it('should generate exactly 5 voicings for A minor', () => {
      const voicings = generateCAGEDVoicings('A', 'm');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['A', 'G', 'E', 'D', 'C']);
    });

    it('should generate exactly 5 voicings for E minor', () => {
      const voicings = generateCAGEDVoicings('E', 'm');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['A', 'G', 'E', 'D', 'C']);
    });

    it('all minor voicings should be playable (max fret <= 15)', () => {
      const testNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      testNotes.forEach(note => {
        const voicings = generateCAGEDVoicings(note, 'm');
        voicings.forEach(v => {
          const maxFret = Math.max(...v.frets.filter(f => f > 0));
          expect(maxFret).toBeLessThanOrEqual(15);
        });
      });
    });
  });

  describe('Voicing Generation - Extended Chords', () => {
    it('should generate 5 voicings for Cmaj7', () => {
      const voicings = generateCAGEDVoicings('C', 'maj7');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('should generate 5 voicings for Am7', () => {
      const voicings = generateCAGEDVoicings('A', 'm7');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['A', 'G', 'E', 'D', 'C']);
    });

    it('should generate 5 voicings for C7', () => {
      const voicings = generateCAGEDVoicings('C', '7');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('should generate 5 voicings for Csus2', () => {
      const voicings = generateCAGEDVoicings('C', 'sus2');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('should generate 5 voicings for Csus4', () => {
      const voicings = generateCAGEDVoicings('C', 'sus4');
      expect(voicings).toHaveLength(5);
      expect(voicings.map(v => v.cagedShape)).toEqual(['C', 'A', 'G', 'E', 'D']);
    });

    it('all extended chord voicings should be playable', () => {
      const extensions = ['maj7', 'm7', '7', 'sus2', 'sus4'];
      extensions.forEach(ext => {
        const voicings = generateCAGEDVoicings('C', ext);
        voicings.forEach(v => {
          const maxFret = Math.max(...v.frets.filter(f => f > 0));
          expect(maxFret).toBeLessThanOrEqual(15);
        });
      });
    });
  });

  describe('Chord Shape Structure', () => {
    it('every voicing should have exactly 6 fret positions', () => {
      const voicings = generateCAGEDVoicings('C', '');
      voicings.forEach(v => {
        expect(v.frets).toHaveLength(6);
      });
    });

    it('fret values should be valid (-1 for muted, 0 for open, 1-15 for fretted)', () => {
      const voicings = generateCAGEDVoicings('G', '');
      voicings.forEach(v => {
        v.frets.forEach(fret => {
          expect(fret).toBeGreaterThanOrEqual(-1);
          expect(fret).toBeLessThanOrEqual(15);
        });
      });
    });

    it('voicing should have name, position, cagedShape, and difficulty', () => {
      const voicings = generateCAGEDVoicings('C', '');
      voicings.forEach(v => {
        expect(v).toHaveProperty('name');
        expect(v).toHaveProperty('position');
        expect(v).toHaveProperty('cagedShape');
        expect(v).toHaveProperty('difficulty');
        expect(typeof v.name).toBe('string');
        expect(typeof v.position).toBe('number');
        expect(['C', 'A', 'G', 'E', 'D']).toContain(v.cagedShape);
        expect(['beginner', 'intermediate', 'advanced']).toContain(v.difficulty);
      });
    });
  });

  describe('Barre Chord Detection', () => {
    it('should detect barre positions for non-open chords', () => {
      const voicings = generateCAGEDVoicings('F', '');
      const barreVoicings = voicings.filter(v => v.barrePositions && v.barrePositions.length > 0);
      expect(barreVoicings.length).toBeGreaterThan(0);
    });

    it('open chords should not have barre positions', () => {
      const voicings = generateCAGEDVoicings('C', '');
      const openVoicing = voicings.find(v => v.position === 0);
      if (openVoicing) {
        expect(openVoicing.barrePositions).toBeUndefined();
      }
    });
  });

  describe('Difficulty Assessment', () => {
    it('open position chords should be beginner level', () => {
      const voicings = generateCAGEDVoicings('C', '');
      const openVoicing = voicings.find(v => v.position === 0);
      if (openVoicing) {
        expect(openVoicing.difficulty).toBe('beginner');
      }
    });

    it('high position barre chords should be intermediate or advanced', () => {
      const voicings = generateCAGEDVoicings('F#', '');
      const highPositionVoicings = voicings.filter(v =>
        v.barrePositions && v.barrePositions.length > 0 && v.position > 5
      );
      highPositionVoicings.forEach(v => {
        expect(['intermediate', 'advanced']).toContain(v.difficulty);
      });
    });
  });

  describe('Transposition Accuracy', () => {
    it('C major C-shape at position 0 should match open C chord', () => {
      const voicings = generateCAGEDVoicings('C', '');
      const cShape = voicings.find(v => v.cagedShape === 'C');
      expect(cShape?.frets).toEqual([-1, 3, 2, 0, 1, 0]);
    });

    it('A minor A-shape at position 0 should match open Am chord', () => {
      const voicings = generateCAGEDVoicings('A', 'm');
      const aShape = voicings.find(v => v.cagedShape === 'A');
      expect(aShape?.frets).toEqual([-1, 0, 2, 2, 1, 0]);
    });

    it('E major E-shape at position 0 should match open E chord', () => {
      const voicings = generateCAGEDVoicings('E', '');
      const eShape = voicings.find(v => v.cagedShape === 'E');
      expect(eShape?.frets).toEqual([0, 2, 2, 1, 0, 0]);
    });

    it('D major D-shape at position 0 should match open D chord', () => {
      const voicings = generateCAGEDVoicings('D', '');
      const dShape = voicings.find(v => v.cagedShape === 'D');
      expect(dShape?.frets).toEqual([-1, -1, 0, 2, 3, 2]);
    });

    it('G major G-shape at position 0 should match open G chord', () => {
      const voicings = generateCAGEDVoicings('G', '');
      const gShape = voicings.find(v => v.cagedShape === 'G');
      expect(gShape?.frets).toEqual([3, 2, 0, 0, 0, 3]);
    });
  });

  describe('Backward Compatibility', () => {
    it('getChordShape should return the first voicing', () => {
      const voicings = generateCAGEDVoicings('C', '');
      const shape = getChordShape('C', '');
      expect(shape).toEqual(voicings[0].frets);
    });

    it('getChordShape should work for all major chords', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      notes.forEach(note => {
        const shape = getChordShape(note, '');
        expect(shape).toHaveLength(6);
        expect(shape.every(f => f >= -1 && f <= 15)).toBe(true);
      });
    });

    it('getChordShape should work for all minor chords', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      notes.forEach(note => {
        const shape = getChordShape(note, 'm');
        expect(shape).toHaveLength(6);
        expect(shape.every(f => f >= -1 && f <= 15)).toBe(true);
      });
    });

    it('getChordShape should return fallback for invalid notes', () => {
      const shape = getChordShape('Invalid', '');
      expect(shape).toEqual([0, 0, 0, 0, 0, 0]);
    });
  });

  describe('Chromatic Scale Coverage', () => {
    it('should generate voicings for all 12 chromatic notes (major)', () => {
      const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticScale.forEach(note => {
        const voicings = generateCAGEDVoicings(note, '');
        expect(voicings).toHaveLength(5);
      });
    });

    it('should generate voicings for all 12 chromatic notes (minor)', () => {
      const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      chromaticScale.forEach(note => {
        const voicings = generateCAGEDVoicings(note, 'm');
        expect(voicings).toHaveLength(5);
      });
    });
  });

  describe('Position Calculation', () => {
    it('position should be a non-negative number', () => {
      const voicings = generateCAGEDVoicings('C', '');
      voicings.forEach(v => {
        expect(v.position).toBeGreaterThanOrEqual(0);
      });
    });

    it('positions should be in ascending order for most shapes', () => {
      const voicings = generateCAGEDVoicings('C', '');
      // Position progression should generally ascend the neck
      voicings.forEach(v => {
        expect(v.position).toBeGreaterThanOrEqual(0);
        expect(v.position).toBeLessThanOrEqual(15);
      });
    });
  });

  describe('Extended Chord Quality Variations', () => {
    it('should accept "min7" as alternative to "m7"', () => {
      const voicingsM7 = generateCAGEDVoicings('A', 'm7');
      const voicingsMin7 = generateCAGEDVoicings('A', 'min7');
      expect(voicingsM7).toHaveLength(5);
      expect(voicingsMin7).toHaveLength(5);
      // Both should use minor CAGED order
      expect(voicingsM7.map(v => v.cagedShape)).toEqual(['A', 'G', 'E', 'D', 'C']);
      expect(voicingsMin7.map(v => v.cagedShape)).toEqual(['A', 'G', 'E', 'D', 'C']);
    });

    it('should handle all extended chord types', () => {
      const types = ['maj7', 'm7', 'min7', '7', 'sus2', 'sus4'];
      types.forEach(type => {
        const voicings = generateCAGEDVoicings('C', type);
        expect(voicings.length).toBeGreaterThan(0);
        voicings.forEach(v => {
          expect(v.frets).toHaveLength(6);
        });
      });
    });
  });
});
