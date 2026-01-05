import { describe, it, expect } from 'vitest';

// Modal scale patterns from the main app
const scalePatterns = {
  modal: {
    ionian: [0, 2, 4, 5, 7, 9, 11],     // Major scale (W-W-H-W-W-W-H)
    aeolian: [0, 2, 3, 5, 7, 8, 10]     // Natural minor scale (W-H-W-W-H-W-W)
  }
};

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteIndex(note: string): number {
  return noteNames.indexOf(note);
}

function isNoteInScale(note: string, rootNote: string, modalType: 'ionian' | 'aeolian'): boolean {
  const rootIndex = getNoteIndex(rootNote);
  const noteIndex = getNoteIndex(note);
  const interval = (noteIndex - rootIndex + 12) % 12;

  const pattern = scalePatterns.modal[modalType];
  return pattern.includes(interval);
}

describe('Modal Scales Tests', () => {
  describe('Ionian Mode (Major Scale)', () => {
    it('should have correct intervals (W-W-H-W-W-W-H)', () => {
      const pattern = scalePatterns.modal.ionian;
      expect(pattern).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have 7 notes', () => {
      const pattern = scalePatterns.modal.ionian;
      expect(pattern).toHaveLength(7);
    });

    it('should contain correct notes for C Ionian (C Major)', () => {
      const expectedNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const actualNotes = noteNames.filter(note => isNoteInScale(note, 'C', 'ionian'));
      expect(actualNotes).toEqual(expectedNotes);
    });

    it('should contain correct notes for G Ionian (G Major)', () => {
      const expectedNotes = ['G', 'A', 'B', 'C', 'D', 'E', 'F#'];
      const actualNotes = noteNames.filter(note => isNoteInScale(note, 'G', 'ionian'));
      expect(actualNotes).toEqual(expectedNotes);
    });

    it('should contain correct notes for F Ionian (F Major)', () => {
      const expectedNotes = ['F', 'G', 'A', 'A#', 'C', 'D', 'E'];
      const actualNotes = noteNames.filter(note => isNoteInScale(note, 'F', 'ionian'));
      expect(actualNotes).toEqual(expectedNotes);
    });

    it('should correctly identify root note', () => {
      expect(isNoteInScale('C', 'C', 'ionian')).toBe(true);
      expect(isNoteInScale('G', 'G', 'ionian')).toBe(true);
    });

    it('should correctly identify non-scale notes', () => {
      // C# is not in C Major
      expect(isNoteInScale('C#', 'C', 'ionian')).toBe(false);
      // F# is not in C Major
      expect(isNoteInScale('F#', 'C', 'ionian')).toBe(false);
      // D# is not in C Major
      expect(isNoteInScale('D#', 'C', 'ionian')).toBe(false);
    });

    it('should match the major scale structure', () => {
      // Intervals: Root, Major 2nd, Major 3rd, Perfect 4th, Perfect 5th, Major 6th, Major 7th
      expect(scalePatterns.modal.ionian).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });
  });

  describe('Aeolian Mode (Natural Minor Scale)', () => {
    it('should have correct intervals (W-H-W-W-H-W-W)', () => {
      const pattern = scalePatterns.modal.aeolian;
      expect(pattern).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it('should have 7 notes', () => {
      const pattern = scalePatterns.modal.aeolian;
      expect(pattern).toHaveLength(7);
    });

    it('should contain correct notes for A Aeolian (A Natural Minor)', () => {
      const expectedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const actualNotes = noteNames.filter(note => isNoteInScale(note, 'A', 'aeolian'));
      expect(actualNotes).toEqual(expectedNotes);
    });

    it('should contain correct notes for C Aeolian (C Natural Minor)', () => {
      const expectedNotes = ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'];
      const actualNotes = noteNames.filter(note => isNoteInScale(note, 'C', 'aeolian'));
      expect(actualNotes).toEqual(expectedNotes);
    });

    it('should contain correct notes for E Aeolian (E Natural Minor)', () => {
      const expectedNotes = ['E', 'F#', 'G', 'A', 'B', 'C', 'D'];
      const actualNotes = noteNames.filter(note => isNoteInScale(note, 'E', 'aeolian'));
      expect(actualNotes).toEqual(expectedNotes);
    });

    it('should correctly identify root note', () => {
      expect(isNoteInScale('A', 'A', 'aeolian')).toBe(true);
      expect(isNoteInScale('E', 'E', 'aeolian')).toBe(true);
    });

    it('should correctly identify non-scale notes', () => {
      // C# is not in A Natural Minor
      expect(isNoteInScale('C#', 'A', 'aeolian')).toBe(false);
      // A# is not in A Natural Minor
      expect(isNoteInScale('A#', 'A', 'aeolian')).toBe(false);
      // D# is not in A Natural Minor
      expect(isNoteInScale('D#', 'A', 'aeolian')).toBe(false);
    });

    it('should match the natural minor scale structure', () => {
      // Intervals: Root, Major 2nd, Minor 3rd, Perfect 4th, Perfect 5th, Minor 6th, Minor 7th
      expect(scalePatterns.modal.aeolian).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });
  });

  describe('Ionian vs Aeolian Comparison', () => {
    it('should have different interval patterns', () => {
      expect(scalePatterns.modal.ionian).not.toEqual(scalePatterns.modal.aeolian);
    });

    it('should differ at intervals 3, 6, and 7 (major vs minor)', () => {
      const ionian = scalePatterns.modal.ionian;
      const aeolian = scalePatterns.modal.aeolian;

      // 3rd degree: Major 3rd (4) vs Minor 3rd (3)
      expect(ionian[2]).toBe(4);
      expect(aeolian[2]).toBe(3);

      // 6th degree: Major 6th (9) vs Minor 6th (8)
      expect(ionian[5]).toBe(9);
      expect(aeolian[5]).toBe(8);

      // 7th degree: Major 7th (11) vs Minor 7th (10)
      expect(ionian[6]).toBe(11);
      expect(aeolian[6]).toBe(10);
    });

    it('should share the same notes for relative major/minor pairs', () => {
      // C Major (Ionian) and A Minor (Aeolian) have the same notes
      const cMajorNotes = noteNames.filter(note => isNoteInScale(note, 'C', 'ionian'));
      const aMinorNotes = noteNames.filter(note => isNoteInScale(note, 'A', 'aeolian'));

      // Sort to compare (they should have the same notes, just different roots)
      expect(cMajorNotes.sort()).toEqual(aMinorNotes.sort());
    });

    it('should work for all 12 keys', () => {
      noteNames.forEach(rootNote => {
        const ionianNotes = noteNames.filter(note => isNoteInScale(note, rootNote, 'ionian'));
        const aeolianNotes = noteNames.filter(note => isNoteInScale(note, rootNote, 'aeolian'));

        // Both should have exactly 7 notes
        expect(ionianNotes).toHaveLength(7);
        expect(aeolianNotes).toHaveLength(7);

        // Both should include the root note
        expect(ionianNotes).toContain(rootNote);
        expect(aeolianNotes).toContain(rootNote);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle sharp notes correctly', () => {
      expect(isNoteInScale('F#', 'D', 'ionian')).toBe(true); // F# is in D Major
      expect(isNoteInScale('C#', 'E', 'aeolian')).toBe(false); // C# is not in E Minor
    });

    it('should correctly calculate intervals wrapping around octave', () => {
      // Testing notes near the end of the chromatic scale
      expect(isNoteInScale('A#', 'C', 'ionian')).toBe(false); // A# is not in C Major
      expect(isNoteInScale('B', 'C', 'ionian')).toBe(true); // B is in C Major (7th degree)
    });

    it('should return false for invalid notes', () => {
      // Non-existent note should not be in scale
      expect(isNoteInScale('X', 'C', 'ionian')).toBe(false);
    });
  });

  describe('Music Theory Validation', () => {
    it('Ionian mode should match traditional major scale theory', () => {
      // C Major traditional: C, D, E, F, G, A, B
      const cMajorTraditional = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const cMajorCalculated = noteNames.filter(note => isNoteInScale(note, 'C', 'ionian'));

      expect(cMajorCalculated).toEqual(cMajorTraditional);
    });

    it('Aeolian mode should match traditional natural minor scale theory', () => {
      // A Natural Minor traditional: A, B, C, D, E, F, G
      const aMinorTraditional = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const aMinorCalculated = noteNames.filter(note => isNoteInScale(note, 'A', 'aeolian'));

      expect(aMinorCalculated).toEqual(aMinorTraditional);
    });

    it('should follow the circle of fifths for major keys', () => {
      // Keys in circle of fifths with correct accidentals
      const circleFifthsTests = [
        { key: 'C', sharps: 0, flats: 0 },
        { key: 'G', expected: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
        { key: 'D', expected: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
        { key: 'F', expected: ['F', 'G', 'A', 'A#', 'C', 'D', 'E'] }
      ];

      circleFifthsTests.forEach(test => {
        if (test.expected) {
          const actualNotes = noteNames.filter(note => isNoteInScale(note, test.key, 'ionian'));
          expect(actualNotes).toEqual(test.expected);
        }
      });
    });
  });
});
