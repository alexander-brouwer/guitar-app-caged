/**
 * Tests für CAGED Shapes Transposition
 * Verifiziert, dass transposeShape() korrekte Fret-Positionen berechnet
 */

import { describe, it, expect } from 'vitest';
import { transposeShape, CAGED_SHAPES } from '../utils/cagedShapes';

describe('CAGED Shapes Transposition', () => {
  /**
   * Test 1: C-Dur im A-Shape
   *
   * Erwartung: C-Root auf A-String (Bund 3)
   * Template A-major: [-1, 0, 2, 2, 2, 0] (Root bei Bund 0)
   * Offset: 3 - 0 = 3
   * Ergebnis: [-1, 3, 5, 5, 5, 3]
   */
  it('should correctly transpose C major to A-shape', () => {
    const result = transposeShape('C', 'A', 'major');

    expect(result).toEqual([-1, 3, 5, 5, 5, 3]);

    // Verifiziere, dass Low E muted ist
    expect(result[0]).toBe(-1);

    // Verifiziere Root auf A-String (Bund 3)
    expect(result[1]).toBe(3);

    // Verifiziere D, G, B strings (5, 5, 5)
    expect(result[2]).toBe(5);
    expect(result[3]).toBe(5);
    expect(result[4]).toBe(5);

    // Verifiziere High E (Bund 3)
    expect(result[5]).toBe(3);
  });

  /**
   * Test 2: G-Dur im E-Shape
   *
   * Erwartung: G-Root auf Low E (Bund 3)
   * Template E-major: [0, 2, 2, 1, 0, 0] (Root bei Bund 0)
   * Offset: 3 - 0 = 3
   * Ergebnis: [3, 5, 5, 4, 3, 3]
   */
  it('should correctly transpose G major to E-shape', () => {
    const result = transposeShape('G', 'E', 'major');

    expect(result).toEqual([3, 5, 5, 4, 3, 3]);

    // Verifiziere Root auf Low E (Bund 3)
    expect(result[0]).toBe(3);

    // Verifiziere A und D strings (5, 5)
    expect(result[1]).toBe(5);
    expect(result[2]).toBe(5);

    // Verifiziere G string (4)
    expect(result[3]).toBe(4);

    // Verifiziere B und High E (3, 3)
    expect(result[4]).toBe(3);
    expect(result[5]).toBe(3);
  });

  /**
   * Test 3: D-Moll im D-Shape
   *
   * Erwartung: D-Root auf D-String (Bund 0)
   * Template D-minor: [-1, -1, 0, 2, 3, 1] (Root bei Bund 0)
   * Offset: 0 - 0 = 0
   * Ergebnis: [-1, -1, 0, 2, 3, 1] (identisch mit Template)
   */
  it('should correctly transpose D minor to D-shape (no offset)', () => {
    const result = transposeShape('D', 'D', 'minor');

    expect(result).toEqual([-1, -1, 0, 2, 3, 1]);

    // Verifiziere Low E und A muted
    expect(result[0]).toBe(-1);
    expect(result[1]).toBe(-1);

    // Verifiziere Root auf D-String (offen)
    expect(result[2]).toBe(0);
  });

  /**
   * Test 4: Template-Struktur-Validierung
   *
   * Verifiziert, dass alle CAGED_SHAPES korrekt definiert sind
   */
  it('should have all 5 CAGED shapes defined for major and minor', () => {
    const shapes = ['E', 'A', 'D', 'G', 'C'] as const;
    const qualities = ['major', 'minor'] as const;

    shapes.forEach(shape => {
      qualities.forEach(quality => {
        const template = CAGED_SHAPES[shape][quality];

        // Verifiziere, dass Template existiert
        expect(template).toBeDefined();

        // Verifiziere, dass frets genau 6 Elemente hat
        expect(template.frets).toHaveLength(6);

        // Verifiziere, dass rootString valide ist (0-5)
        expect(template.rootString).toBeGreaterThanOrEqual(0);
        expect(template.rootString).toBeLessThanOrEqual(5);

        // Verifiziere, dass rootFret valide ist (0-12)
        expect(template.rootFret).toBeGreaterThanOrEqual(0);
        expect(template.rootFret).toBeLessThanOrEqual(12);
      });
    });
  });
});
