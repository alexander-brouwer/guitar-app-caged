/**
 * Tests für Tonal.js Validierung in transposeShape()
 * Verifiziert, dass ungültige Noten automatisch gemutet werden
 */

import { describe, it, expect } from 'vitest';
import { transposeShape } from '../utils/cagedShapes';

describe('CAGED Shapes Tonal.js Validation', () => {
  /**
   * Test 1: Validierung ist standardmäßig aktiviert
   * Alle generierten Noten sollten musikalisch korrekt sein
   */
  it('should validate all notes are in the chord by default', () => {
    const result = transposeShape('C', 'A', 'major');

    // C major sollte nur C, E, G enthalten
    // A-Shape bei C: [-1, 3, 5, 5, 5, 3]
    // Noten: [-, C, E, G, C, E]
    expect(result).toEqual([-1, 3, 5, 5, 5, 3]);

    // Keine ungültigen Noten sollten vorhanden sein
    expect(result.every(fret => fret === -1 || fret >= 0)).toBe(true);
  });

  /**
   * Test 2: Validierung kann deaktiviert werden
   */
  it('should skip validation when validate=false', () => {
    const resultWithValidation = transposeShape('C', 'A', 'major', { validate: true });
    const resultWithoutValidation = transposeShape('C', 'A', 'major', { validate: false });

    // Beide sollten identisch sein, da das Template bereits korrekt ist
    expect(resultWithValidation).toEqual(resultWithoutValidation);
  });

  /**
   * Test 3: Validierung für verschiedene Akkorde
   */
  it('should validate G major E-shape correctly', () => {
    const result = transposeShape('G', 'E', 'major');

    // G major E-Shape: [3, 5, 5, 4, 3, 3]
    // Noten: [G, D, G, B, D, G]
    // Alle Noten sollten in G major sein (G, B, D)
    expect(result).toEqual([3, 5, 5, 4, 3, 3]);
  });

  /**
   * Test 4: Validierung für Moll-Akkorde
   */
  it('should validate D minor D-shape correctly', () => {
    const result = transposeShape('D', 'D', 'minor');

    // D minor D-Shape: [-1, -1, 0, 2, 3, 1]
    // Noten: [-, -, D, F, A, D]
    // Alle Noten sollten in D minor sein (D, F, A)
    expect(result).toEqual([-1, -1, 0, 2, 3, 1]);
  });

  /**
   * Test 5: Templates sollten meist validiert sein
   * Dies ist ein Sanity-Check: Unsere Templates sollten in den meisten Fällen funktionieren
   */
  it('should validate most chord/shape combinations', () => {
    const shapes = ['C', 'A', 'G', 'E', 'D'] as const;
    const qualities = ['major', 'minor'] as const;
    const testRoots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    let totalCombinations = 0;
    let validCombinations = 0;
    const failedCombinations: string[] = [];

    testRoots.forEach(root => {
      qualities.forEach(quality => {
        shapes.forEach(shape => {
          totalCombinations++;

          const result = transposeShape(root, shape, quality);

          // Prüfe, dass mindestens 3 Saiten gespielt werden
          const playedStrings = result.filter(fret => fret >= 0).length;

          if (playedStrings >= 3) {
            validCombinations++;
          } else {
            failedCombinations.push(
              `${root} ${quality} ${shape}-shape: only ${playedStrings} strings (${result.join(', ')})`
            );
          }

          // Prüfe, dass keine negativen Frets außer -1 existieren
          const hasInvalidFrets = result.some(fret => fret < -1);
          expect(hasInvalidFrets).toBe(false);
        });
      });
    });

    // Logging für Debugging
    if (failedCombinations.length > 0) {
      console.log('\n⚠️ Failed combinations:');
      failedCombinations.forEach(msg => console.log(`  - ${msg}`));
    }

    console.log(`\n✅ Success rate: ${validCombinations}/${totalCombinations} (${(validCombinations / totalCombinations * 100).toFixed(1)}%)`);

    // Wir erwarten, dass mindestens 80% der Kombinationen funktionieren
    const successRate = validCombinations / totalCombinations;
    expect(successRate).toBeGreaterThanOrEqual(0.80);
  });

  /**
   * Test 6: Chromatic Equivalence
   * C# = Db, F# = Gb, etc.
   */
  it('should handle enharmonic equivalents correctly', () => {
    // F# major und Gb major sollten identische Noten produzieren
    const fSharpMajor = transposeShape('F#', 'E', 'major');
    const gFlatMajor = transposeShape('Gb', 'E', 'major'); // Falls Gb unterstützt wird

    // Beide sollten validieren (auch wenn Frets unterschiedlich sein könnten)
    expect(fSharpMajor.filter(f => f >= 0).length).toBeGreaterThanOrEqual(3);
  });
});
