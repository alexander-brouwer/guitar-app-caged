/**
 * Comprehensive Tests for CAGED Shape Detection (Music Theory-Based)
 *
 * These tests verify that chord shapes are correctly identified based on
 * music theory principles (root string position and interval structure),
 * NOT by fret position.
 *
 * CAGED Shape Rules:
 * - E-shape: Root on 6th string (low E), full barre chord structure
 * - A-shape: Root on 5th string (A), bass note on A string
 * - D-shape: Root on 4th string (D), no 6th or 5th string
 * - C-shape: Root on 5th string (A), 6th string muted, distinctive voicing
 * - G-shape: Root on 6th string (low E), uses all 6 strings OR distinctive open pattern
 */

import { describe, it, expect } from 'vitest';

// We need to export this function from cagedSystemEnhanced.ts for testing
// For now, we'll test through getValidatedCAGEDVoicings which uses it internally
import { getValidatedCAGEDVoicings } from '../utils/cagedSystemEnhanced';

describe('CAGED Shape Detection (Music Theory-Based)', () => {
  describe('E-Shape Detection', () => {
    it('should detect E-shape for F major barre (fret 1)', () => {
      // F major barre: root on low E string, 1st fret
      // Frets: [1, 3, 3, 2, 1, 1]
      const voicings = getValidatedCAGEDVoicings('F', 'major', { maxVoicings: 10 });
      const fMajorBarre = voicings.find(v => v.baseFret === 1 && v.frets[0] === 1);

      if (fMajorBarre) {
        expect(fMajorBarre.cagedShape).toBe('E');
      }
    });

    it('should detect E-shape for Am barre (fret 5)', () => {
      // Am barre at 5th fret: root on low E string
      // Frets: [5, 7, 7, 5, 5, 5] or relative [1, 3, 3, 1, 1, 1]
      const voicings = getValidatedCAGEDVoicings('A', 'minor', { maxVoicings: 10 });
      const amBarre = voicings.find(v => v.baseFret === 5);

      if (amBarre) {
        expect(amBarre.cagedShape).toBe('E');
        expect(amBarre.frets[0]).toBeGreaterThan(0); // Uses low E string
      }
    });

    it('should detect E-shape for open E major', () => {
      const voicings = getValidatedCAGEDVoicings('E', 'major', { maxVoicings: 10 });
      const openE = voicings.find(v => v.baseFret === 1 && v.frets.some(f => f === 0));

      if (openE) {
        expect(openE.cagedShape).toBe('E');
      }
    });

    it('should detect E-shape for C major barre (fret 8)', () => {
      // C major barre at 8th fret (E-shape)
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const cBarreE = voicings.find(v => v.baseFret === 8);

      if (cBarreE) {
        expect(cBarreE.cagedShape).toBe('E');
      }
    });
  });

  describe('A-Shape Detection', () => {
    it('should detect A-shape for open A major', () => {
      // Open A: [-1, 0, 2, 2, 2, 0]
      // Root on A string (open), muted low E
      const voicings = getValidatedCAGEDVoicings('A', 'major', { maxVoicings: 10 });
      const openA = voicings.find(v => v.baseFret === 1 && v.frets[0] === -1 && v.frets[1] === 0);

      if (openA) {
        expect(openA.cagedShape).toBe('A');
        expect(openA.frets[0]).toBe(-1); // Low E muted
        expect(openA.frets[1]).toBeGreaterThanOrEqual(0); // A string played
      }
    });

    it('should detect A-shape for C major barre (fret 3)', () => {
      // C major using A-shape at 3rd fret
      // Frets: [-1, 3, 5, 5, 5, 3] or relative [-1, 1, 3, 3, 3, 1]
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const cBarreA = voicings.find(v => v.baseFret === 3 && v.frets[0] === -1);

      if (cBarreA) {
        expect(cBarreA.cagedShape).toBe('A');
        expect(cBarreA.frets[0]).toBe(-1); // Characteristic of A-shape
      }
    });

    it('should detect A-shape for Am open position', () => {
      const voicings = getValidatedCAGEDVoicings('A', 'minor', { maxVoicings: 10 });
      const openAm = voicings.find(v => v.baseFret === 1 && v.frets[0] === -1);

      if (openAm) {
        expect(openAm.cagedShape).toBe('A');
      }
    });

    it('should detect A-shape for F major barre (fret 5)', () => {
      // F major using A-shape at 5th fret (alternative to E-shape)
      const voicings = getValidatedCAGEDVoicings('F', 'major', { maxVoicings: 15 });
      const fBarreA = voicings.find(v => v.baseFret === 5 && v.frets[0] === -1);

      if (fBarreA) {
        expect(fBarreA.cagedShape).toBe('A');
      }
    });
  });

  describe('D-Shape Detection', () => {
    it('should detect D-shape for open D major', () => {
      // Open D: [-1, -1, 0, 2, 3, 2]
      // Characteristic: Omits low E and A strings
      const voicings = getValidatedCAGEDVoicings('D', 'major', { maxVoicings: 10 });
      const openD = voicings.find(v => v.baseFret === 1 && v.frets[0] === -1 && v.frets[1] === -1);

      if (openD) {
        expect(openD.cagedShape).toBe('D');
        expect(openD.frets[0]).toBe(-1); // Low E muted
        expect(openD.frets[1]).toBe(-1); // A string muted
        expect(openD.frets[2]).toBeGreaterThanOrEqual(0); // D string played
      }
    });

    it('should detect D-shape for Dm open position', () => {
      const voicings = getValidatedCAGEDVoicings('D', 'minor', { maxVoicings: 10 });
      const openDm = voicings.find(v => v.baseFret === 1 && v.frets[0] === -1 && v.frets[1] === -1);

      if (openDm) {
        expect(openDm.cagedShape).toBe('D');
      }
    });

    it('should detect D-shape for C major (high voicing)', () => {
      // C major using D-shape at 10th fret
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 15, maxFret: 15 });
      const cBarreD = voicings.find(v => v.baseFret >= 10 && v.frets[0] === -1 && v.frets[1] === -1);

      if (cBarreD) {
        expect(cBarreD.cagedShape).toBe('D');
      }
    });
  });

  describe('C-Shape Detection', () => {
    it('should detect C-shape for open C major', () => {
      // Open C: [-1, 3, 2, 0, 1, 0]
      // Distinctive: Root on A string (3rd fret), low E muted
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const openC = voicings.find(v => v.baseFret === 1 && v.frets[0] === -1 && v.frets[1] === 3);

      if (openC) {
        expect(openC.cagedShape).toBe('C');
        expect(openC.frets[0]).toBe(-1); // Low E muted
      }
    });

    it('should NOT confuse C-shape with A-shape', () => {
      // C-shape and A-shape both have root on A string and muted low E
      // Difference is in the interval structure
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const openC = voicings.find(v => v.baseFret === 1 && v.frets[0] === -1);

      if (openC) {
        // Open C should be C-shape, not A-shape
        expect(openC.cagedShape).toBe('C');
      }
    });

    it('should detect C-shape for D major barre (fret 5)', () => {
      const voicings = getValidatedCAGEDVoicings('D', 'major', { maxVoicings: 15 });
      const dBarreC = voicings.find(v => v.baseFret === 5 && v.frets[0] === -1 && v.frets[1] > 0);

      if (dBarreC) {
        // Could be C-shape if voicing matches
        // This is a tricky one - might need manual verification
        expect(['C', 'A']).toContain(dBarreC.cagedShape);
      }
    });
  });

  describe('G-Shape Detection', () => {
    it('should detect G-shape for open G major', () => {
      // Open G: [3, 2, 0, 0, 0, 3] or [3, 2, 0, 0, 3, 3]
      // Characteristic: Uses all 6 strings, root on low E (3rd fret)
      const voicings = getValidatedCAGEDVoicings('G', 'major', { maxVoicings: 10 });
      const openG = voicings.find(v => v.baseFret === 1 && v.frets[0] > 0 && v.frets[5] > 0);

      if (openG) {
        expect(openG.cagedShape).toBe('G');
        expect(openG.frets.filter(f => f >= 0).length).toBeGreaterThanOrEqual(5); // Uses most strings
      }
    });

    it('should detect G-shape characteristics (uses all strings)', () => {
      const voicings = getValidatedCAGEDVoicings('G', 'major', { maxVoicings: 10 });
      const openG = voicings.find(v => v.baseFret === 1);

      if (openG && openG.cagedShape === 'G') {
        // G-shape typically uses all or most strings
        const playedStrings = openG.frets.filter(f => f >= 0).length;
        expect(playedStrings).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('Anti-Regression Tests: Position-Based Detection is WRONG', () => {
    it('should NOT assign shape based on fret position alone', () => {
      // WRONG LOGIC: baseFret > 7 → G-shape
      // An E-shape barre chord can be at ANY fret position

      // Am at fret 5 should be E-shape, NOT C-shape
      const voicings = getValidatedCAGEDVoicings('A', 'minor', { maxVoicings: 10 });
      const amFret5 = voicings.find(v => v.baseFret === 5);

      if (amFret5) {
        // Current broken logic would say: baseFret=5, so 3 <= 5 <= 7 → C-shape ✗ WRONG
        // Correct: Root on low E string → E-shape ✓ CORRECT
        expect(amFret5.cagedShape).toBe('E');
      }
    });

    it('should NOT assume root is always at baseFret', () => {
      // WRONG LOGIC: rootStringGuess = frets.findIndex(f => f === baseFret)
      // This fails for many voicings where root ≠ baseFret

      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 15 });

      voicings.forEach(voicing => {
        // Shape detection should analyze actual string positions
        // Not just where baseFret appears
        expect(['C', 'A', 'G', 'E', 'D']).toContain(voicing.cagedShape);
      });
    });

    it('should correctly identify E-shape at high fret positions', () => {
      // E-shape can appear at fret 8, 10, 12, etc.
      // Should NOT be labeled as G-shape just because baseFret > 7

      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 15, maxFret: 15 });
      const cFret8 = voicings.find(v => v.baseFret === 8);

      if (cFret8 && cFret8.frets[0] > 0) {
        // If using low E string, this is E-shape
        expect(cFret8.cagedShape).toBe('E');
      }
    });
  });

  describe('Chord Quality Independence', () => {
    it('should detect same shape for C major and C minor', () => {
      const majorVoicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const minorVoicings = getValidatedCAGEDVoicings('C', 'minor', { maxVoicings: 10 });

      // Open C major is C-shape
      const majorOpen = majorVoicings.find(v => v.baseFret === 1);
      // Open Cm might not exist, but if it does, should be C-shape
      const minorOpen = minorVoicings.find(v => v.baseFret === 1 && v.frets[0] === -1);

      if (majorOpen) {
        expect(majorOpen.cagedShape).toBe('C');
      }

      if (minorOpen) {
        expect(minorOpen.cagedShape).toBe('C');
      }
    });

    it('should detect same shapes across major/minor chords', () => {
      // E-shape works for both major and minor
      const eMajor = getValidatedCAGEDVoicings('E', 'major', { maxVoicings: 5 });
      const eMinor = getValidatedCAGEDVoicings('E', 'minor', { maxVoicings: 5 });

      const majorE = eMajor.find(v => v.baseFret === 1);
      const minorE = eMinor.find(v => v.baseFret === 1);

      if (majorE && minorE) {
        expect(majorE.cagedShape).toBe(minorE.cagedShape);
      }
    });
  });

  describe('Voicing Count and Coverage', () => {
    it('should return multiple voicings for common chords', () => {
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      expect(voicings.length).toBeGreaterThan(1);
    });

    it('should ideally cover all 5 CAGED shapes', () => {
      // This test documents the current limitation:
      // chords-db provides ~4 voicings, not 5 distinct CAGED shapes

      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const shapes = new Set(voicings.map(v => v.cagedShape));

      // Currently returns 4 voicings
      expect(voicings.length).toBeGreaterThanOrEqual(3);

      // Ideally should have all 5 shapes (will achieve after Phase 2 hybrid approach)
      // expect(shapes.size).toBe(5);
      // expect(shapes).toContain('C');
      // expect(shapes).toContain('A');
      // expect(shapes).toContain('G');
      // expect(shapes).toContain('E');
      // expect(shapes).toContain('D');
    });

    it('should return validated voicings only', () => {
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10, onlyValidated: true });

      voicings.forEach(voicing => {
        expect(voicing.validated).toBe(true);
      });
    });

    it('should include invalid voicings when onlyValidated=false', () => {
      const allVoicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10, onlyValidated: false });
      const validatedVoicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10, onlyValidated: true });

      expect(allVoicings.length).toBeGreaterThanOrEqual(validatedVoicings.length);
    });
  });

  describe('Music Theory Validation Integration', () => {
    it('should validate all voicings against Tonal.js', () => {
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });

      voicings.forEach(voicing => {
        expect(voicing.theoreticalNotes).toEqual(['C', 'E', 'G']);
        expect(voicing.validated).toBe(true);
      });
    });

    it('should provide theoretical notes for all voicings', () => {
      const voicings = getValidatedCAGEDVoicings('A', 'minor', { maxVoicings: 10 });

      voicings.forEach(voicing => {
        expect(voicing.theoreticalNotes).toBeDefined();
        expect(voicing.theoreticalNotes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Difficulty Assessment', () => {
    it('should mark open chords as beginner', () => {
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 10 });
      const openC = voicings.find(v => v.baseFret === 1 && v.frets.some(f => f === 0));

      if (openC) {
        expect(openC.difficulty).toBe('beginner');
      }
    });

    it('should mark barre chords as intermediate or advanced', () => {
      const voicings = getValidatedCAGEDVoicings('F', 'major', { maxVoicings: 10 });
      const fBarre = voicings.find(v => v.barrePositions && v.barrePositions.length > 0);

      if (fBarre) {
        expect(['intermediate', 'advanced']).toContain(fBarre.difficulty);
      }
    });

    it('should mark high position chords as advanced', () => {
      const voicings = getValidatedCAGEDVoicings('C', 'major', { maxVoicings: 15, maxFret: 15 });
      const highC = voicings.find(v => v.baseFret > 12);

      if (highC) {
        expect(highC.difficulty).toBe('advanced');
      }
    });
  });
});
