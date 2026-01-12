/**
 * Verification Tests for Chord Diagram & Tablature Display
 * Ensures visual representations match the actual chord voicings
 */

import { describe, it, expect } from 'vitest';
import { getCommonVoicing } from '../utils/cagedSystemEnhanced';
import { toAbsoluteFrets } from '../utils/chordDatabase';

describe('Chord Display Verification', () => {
  /**
   * Test 1: C Major should show the easiest open chord
   */
  it('should return open C major chord (C-Shape) as common voicing', () => {
    const voicing = getCommonVoicing('C', 'major');

    expect(voicing).not.toBeNull();
    expect(voicing!.baseFret).toBe(1); // Open chord position
    expect(voicing!.cagedShape).toBe('C');

    // Relative frets (from chords-db format)
    expect(voicing!.frets).toEqual([-1, 3, 2, 0, 1, 0]);

    // Convert to absolute frets for tablature display
    const absoluteFrets = toAbsoluteFrets({
      frets: voicing!.frets,
      baseFret: voicing!.baseFret,
      fingers: [],
      barres: [],
      midi: []
    });

    // Absolute frets should be identical for baseFret=1
    expect(absoluteFrets).toEqual([-1, 3, 2, 0, 1, 0]);

    console.log('✅ C major common voicing:', {
      shape: voicing!.cagedShape,
      baseFret: voicing!.baseFret,
      relativeFrets: voicing!.frets,
      absoluteFrets: absoluteFrets,
      tablature: absoluteFrets.map(f => f === -1 ? 'x' : f).join('-')
    });
  });

  /**
   * Test 2: Verify all open chords (C, D, E, F, G, A) display correctly
   */
  it('should return correct open chords for common major chords', () => {
    const testChords = [
      { note: 'C', expected: [-1, 3, 2, 0, 1, 0], shape: 'C' },
      { note: 'D', expected: [-1, -1, 0, 2, 3, 2], shape: 'D' },
      { note: 'E', expected: [0, 2, 2, 1, 0, 0], shape: 'E' },
      { note: 'F', expected: [1, 3, 3, 2, 1, 1], shape: 'E' }, // F is E-shape at fret 1
      { note: 'G', expected: [3, 2, 0, 0, 0, 3], shape: 'G' },
      { note: 'A', expected: [-1, 0, 2, 2, 2, 0], shape: 'A' }
    ];

    testChords.forEach(({ note, expected, shape }) => {
      const voicing = getCommonVoicing(note, 'major');

      expect(voicing).not.toBeNull();
      expect(voicing!.cagedShape).toBe(shape);

      // Convert to absolute frets
      const absoluteFrets = toAbsoluteFrets({
        frets: voicing!.frets,
        baseFret: voicing!.baseFret,
        fingers: [],
        barres: [],
        midi: []
      });

      expect(absoluteFrets).toEqual(expected);

      console.log(`✅ ${note} major:`, {
        shape: voicing!.cagedShape,
        baseFret: voicing!.baseFret,
        absoluteFrets: absoluteFrets,
        tablature: absoluteFrets.map(f => f === -1 ? 'x' : f).join('-')
      });
    });
  });

  /**
   * Test 3: Verify Am diatonic chords show simple voicings
   */
  it('should return simple open chords for diatonic chords in Am', () => {
    const diatonicChords = [
      { note: 'A', quality: 'minor', expected: [-1, 0, 2, 2, 1, 0] },  // Am
      { note: 'B', quality: 'dim', expected: [-1, 2, 0, -1, 0, 1] },   // Bdim (G string muted - correct!)
      { note: 'C', quality: 'major', expected: [-1, 3, 2, 0, 1, 0] },   // C
      { note: 'D', quality: 'minor', expected: [-1, -1, 0, 2, 3, 1] },  // Dm
      { note: 'E', quality: 'major', expected: [0, 2, 2, 1, 0, 0] },    // E
      { note: 'F', quality: 'major', expected: [1, 3, 3, 2, 1, 1] },    // F
      { note: 'G', quality: 'major', expected: [3, 2, 0, 0, 0, 3] }     // G
    ];

    diatonicChords.forEach(({ note, quality, expected }) => {
      const voicing = getCommonVoicing(note, quality);

      expect(voicing).not.toBeNull();

      // Convert to absolute frets
      const absoluteFrets = toAbsoluteFrets({
        frets: voicing!.frets,
        baseFret: voicing!.baseFret,
        fingers: [],
        barres: [],
        midi: []
      });

      expect(absoluteFrets).toEqual(expected);

      const chordName = note + (quality === 'minor' ? 'm' : quality === 'dim' ? 'dim' : '');
      console.log(`✅ ${chordName}:`, {
        shape: voicing!.cagedShape,
        baseFret: voicing!.baseFret,
        absoluteFrets: absoluteFrets,
        tablature: absoluteFrets.map(f => f === -1 ? 'x' : f).join('-')
      });
    });
  });

  /**
   * Test 4: Verify chord diagram calculations
   * Tests the logic that would be used in SVG rendering
   */
  it('should calculate correct SVG positions for chord diagrams', () => {
    const voicing = getCommonVoicing('C', 'major');
    expect(voicing).not.toBeNull();

    const { frets, baseFret } = voicing!;
    const startFret = baseFret > 1 ? baseFret : 0;

    // For C major (baseFret=1), startFret should be 0 (open chord)
    expect(startFret).toBe(0);

    // Calculate display positions
    const displayPositions = frets.map((fret, stringIndex) => {
      if (fret === -1) {
        return { string: stringIndex, type: 'muted' };
      }
      if (fret === 0) {
        return { string: stringIndex, type: 'open' };
      }

      // For display in SVG: fret position is relative to diagram
      // NO +1 offset needed (this was the bug we fixed)
      const displayFret = fret;

      return {
        string: stringIndex,
        type: 'fret',
        displayFret: displayFret,
        actualFret: baseFret > 1 ? baseFret + fret - 1 : fret
      };
    });

    console.log('✅ C major SVG positions:', displayPositions);

    // Verify C major chord positions
    expect(displayPositions[0]).toEqual({ string: 0, type: 'muted' }); // Low E muted
    expect(displayPositions[1]).toEqual({ string: 1, type: 'fret', displayFret: 3, actualFret: 3 }); // A string, 3rd fret
    expect(displayPositions[2]).toEqual({ string: 2, type: 'fret', displayFret: 2, actualFret: 2 }); // D string, 2nd fret
    expect(displayPositions[3]).toEqual({ string: 3, type: 'open' }); // G string open
    expect(displayPositions[4]).toEqual({ string: 4, type: 'fret', displayFret: 1, actualFret: 1 }); // B string, 1st fret
    expect(displayPositions[5]).toEqual({ string: 5, type: 'open' }); // High E open
  });
});
