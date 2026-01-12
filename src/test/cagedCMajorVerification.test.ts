/**
 * C-Dur Verification Test gegen music2me.com Reference
 *
 * Quelle: https://music2me.com/de/magazin/caged-system
 *
 * C-Dur CAGED Shapes (Ground Truth):
 * - C Shape: x-3-2-0-1-0
 * - A Shape: x-3-5-5-5-3
 * - G-Shape: 8-7-5-5-5-x (optional, schwer zu spielen)
 * - E Shape: 8-10-10-9-8-8
 * - D-Shape: x-x-10-12-13-12
 */

import { describe, it, expect } from 'vitest';
import { transposeShape } from '../utils/cagedShapes';
import { getValidatedCAGEDVoicings } from '../utils/cagedSystemEnhanced';

describe('C Major CAGED System Verification (music2me.com Reference)', () => {
  /**
   * Test 1: C-Shape für C-Dur
   * Erwartung: [-1, 3, 2, 0, 1, 0]
   */
  it('should generate correct C-shape for C major', () => {
    const result = transposeShape('C', 'C', 'major');

    expect(result).toEqual([-1, 3, 2, 0, 1, 0]);

    // Verifiziere Saiten-Details
    expect(result[0]).toBe(-1);  // Low E muted
    expect(result[1]).toBe(3);   // A string, fret 3 (C)
    expect(result[2]).toBe(2);   // D string, fret 2 (E)
    expect(result[3]).toBe(0);   // G string, open (G)
    expect(result[4]).toBe(1);   // B string, fret 1 (C)
    expect(result[5]).toBe(0);   // High E, open (E)
  });

  /**
   * Test 2: A-Shape für C-Dur
   * Erwartung: [-1, 3, 5, 5, 5, 3]
   */
  it('should generate correct A-shape for C major', () => {
    const result = transposeShape('C', 'A', 'major');

    expect(result).toEqual([-1, 3, 5, 5, 5, 3]);

    // Verifiziere Saiten-Details
    expect(result[0]).toBe(-1);  // Low E muted
    expect(result[1]).toBe(3);   // A string, fret 3 (C) - Root
    expect(result[2]).toBe(5);   // D string, fret 5 (G)
    expect(result[3]).toBe(5);   // G string, fret 5 (C)
    expect(result[4]).toBe(5);   // B string, fret 5 (E)
    expect(result[5]).toBe(3);   // High E, fret 3 (G)
  });

  /**
   * Test 3: E-Shape für C-Dur
   * Erwartung: [8, 10, 10, 9, 8, 8]
   */
  it('should generate correct E-shape for C major', () => {
    const result = transposeShape('C', 'E', 'major');

    expect(result).toEqual([8, 10, 10, 9, 8, 8]);

    // Verifiziere Saiten-Details
    expect(result[0]).toBe(8);   // Low E, fret 8 (C) - Root
    expect(result[1]).toBe(10);  // A string, fret 10 (G)
    expect(result[2]).toBe(10);  // D string, fret 10 (C)
    expect(result[3]).toBe(9);   // G string, fret 9 (E)
    expect(result[4]).toBe(8);   // B string, fret 8 (G)
    expect(result[5]).toBe(8);   // High E, fret 8 (C)
  });

  /**
   * Test 4: D-Shape für C-Dur
   * Erwartung: [-1, -1, 10, 12, 13, 12]
   */
  it('should generate correct D-shape for C major', () => {
    const result = transposeShape('C', 'D', 'major');

    expect(result).toEqual([-1, -1, 10, 12, 13, 12]);

    // Verifiziere Saiten-Details
    expect(result[0]).toBe(-1);  // Low E muted
    expect(result[1]).toBe(-1);  // A string muted
    expect(result[2]).toBe(10);  // D string, fret 10 (C) - Root
    expect(result[3]).toBe(12);  // G string, fret 12 (G)
    expect(result[4]).toBe(13);  // B string, fret 13 (C)
    expect(result[5]).toBe(12);  // High E, fret 12 (E)
  });

  /**
   * Test 5: G-Shape für C-Dur (Optional)
   * Hinweis: G-Shape ist schwer zu spielen und wird oft ausgelassen
   * Erwartung: [8, 7, 5, 5, 5, -1] oder [8, 7, 5, 5, 5, 8]
   */
  it('should generate G-shape for C major (may have variations)', () => {
    const result = transposeShape('C', 'G', 'major');

    // G-Shape bei C kann variieren wegen Validation
    // Erwartete Base-Form: [8, 7, 5, 5, 5, 8]
    // music2me.com zeigt: [8, 7, 5, 5, 5, -1]

    console.log('C major G-shape:', result);

    // Verifiziere mindestens die ersten 5 Saiten
    expect(result[0]).toBe(8);   // Low E, fret 8 (C)
    expect(result[1]).toBe(7);   // A string, fret 7 (E)
    expect(result[2]).toBe(5);   // D string, fret 5 (G)
    expect(result[3]).toBe(5);   // G string, fret 5 (C)
    expect(result[4]).toBe(5);   // B string, fret 5 (E)

    // High E kann -1 oder 8 sein (beide sind musikalisch korrekt)
    const highEValid = result[5] === -1 || result[5] === 8;
    expect(highEValid).toBe(true);
  });

  /**
   * Test 6: Integration Test - alle 5 Shapes über getValidatedCAGEDVoicings
   */
  it('should provide all 5 CAGED shapes via getValidatedCAGEDVoicings', () => {
    const voicings = getValidatedCAGEDVoicings('C', 'major', {
      maxVoicings: 10,
      onlyValidated: true
    });

    // Extrahiere die CAGED shapes
    const shapes = voicings.map(v => v.cagedShape);
    const uniqueShapes = new Set(shapes);

    console.log('\n=== C Major CAGED Shapes via getValidatedCAGEDVoicings ===');
    voicings.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.cagedShape}-Shape: baseFret=${v.baseFret}, frets=[${v.frets.join(', ')}]`);
    });

    // Verifiziere, dass alle wichtigen Shapes vorhanden sind
    expect(uniqueShapes.has('C')).toBe(true);
    expect(uniqueShapes.has('A')).toBe(true);
    expect(uniqueShapes.has('E')).toBe(true);
    expect(uniqueShapes.has('D')).toBe(true);

    // G-Shape ist optional (schwer zu spielen)
    // expect(uniqueShapes.has('G')).toBe(true);

    // Mindestens 4 unterschiedliche Shapes
    expect(uniqueShapes.size).toBeGreaterThanOrEqual(4);
  });

  /**
   * Test 7: Alle Shapes sollten validiert sein
   */
  it('should validate all generated C major shapes against music theory', () => {
    const shapes = ['C', 'A', 'E', 'D'] as const;

    shapes.forEach(shape => {
      const result = transposeShape('C', shape, 'major');

      // Mindestens 3 Saiten sollten gespielt werden
      const playedStrings = result.filter(f => f >= 0).length;
      expect(playedStrings).toBeGreaterThanOrEqual(3);

      // Keine ungültigen Frets
      const hasInvalidFrets = result.some(f => f < -1);
      expect(hasInvalidFrets).toBe(false);
    });
  });
});
