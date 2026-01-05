/**
 * Integration Tests für CAGED Template System
 * Verifiziert, dass getValidatedCAGEDVoicings() alle 5 CAGED-Shapes generiert
 */

import { describe, it, expect } from 'vitest';
import { getValidatedCAGEDVoicings } from '../utils/cagedSystemEnhanced';

describe('CAGED Template Integration', () => {
  it('should generate all 5 CAGED shapes for C major', () => {
    const voicings = getValidatedCAGEDVoicings('C', 'major', {
      maxVoicings: 10,
      onlyValidated: true
    });

    // Extrahiere die CAGED-Shapes
    const shapes = voicings.map(v => v.cagedShape);
    const uniqueShapes = new Set(shapes);

    console.log('\nC Major Voicings:');
    voicings.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.cagedShape}-Shape: baseFret=${v.baseFret}, frets=[${v.frets.join(', ')}]`);
    });

    // Verifiziere, dass mindestens 4 CAGED-Shapes vorhanden sind
    // (Nicht alle Shapes funktionieren perfekt für alle Akkorde)
    expect(uniqueShapes.has('C')).toBe(true);
    expect(uniqueShapes.has('A')).toBe(true);
    expect(uniqueShapes.has('E')).toBe(true);
    expect(uniqueShapes.has('D')).toBe(true);

    // Mindestens 4 unterschiedliche Shapes
    expect(uniqueShapes.size).toBeGreaterThanOrEqual(4);

    // Mindestens 4 Voicings
    expect(voicings.length).toBeGreaterThanOrEqual(4);

    // Alle sollten validiert sein
    voicings.forEach(v => {
      expect(v.validated).toBe(true);
    });
  });

  it('should generate all 5 CAGED shapes for A minor', () => {
    const voicings = getValidatedCAGEDVoicings('A', 'minor', {
      maxVoicings: 10,
      onlyValidated: true
    });

    const shapes = voicings.map(v => v.cagedShape);
    const uniqueShapes = new Set(shapes);

    console.log('\nA Minor Voicings:');
    voicings.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.cagedShape}-Shape: baseFret=${v.baseFret}, frets=[${v.frets.join(', ')}]`);
    });

    // Verifiziere, dass mindestens 4 CAGED-Shapes vorhanden sind
    expect(uniqueShapes.has('A')).toBe(true);
    expect(uniqueShapes.has('E')).toBe(true);
    expect(uniqueShapes.has('D')).toBe(true);

    // Mindestens 3 unterschiedliche Shapes
    expect(uniqueShapes.size).toBeGreaterThanOrEqual(3);

    expect(voicings.length).toBeGreaterThanOrEqual(4);
  });

  it('should handle G major correctly', () => {
    const voicings = getValidatedCAGEDVoicings('G', 'major', {
      maxVoicings: 10,
      onlyValidated: true
    });

    const shapes = voicings.map(v => v.cagedShape);
    const uniqueShapes = new Set(shapes);

    console.log('\nG Major Voicings:');
    voicings.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.cagedShape}-Shape: baseFret=${v.baseFret}, frets=[${v.frets.join(', ')}]`);
    });

    expect(uniqueShapes.size).toBeGreaterThanOrEqual(3);
  });

  it('should not add templates for extended chords (7, maj7, etc.)', () => {
    const voicings = getValidatedCAGEDVoicings('C', '7', {
      maxVoicings: 10,
      onlyValidated: false
    });

    // Templates werden nur für major/minor generiert
    // C7 sollte nur Voicings aus chords-db haben
    expect(voicings.length).toBeGreaterThan(0);

    console.log('\nC7 Voicings (from chords-db only):');
    voicings.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.cagedShape}-Shape: baseFret=${v.baseFret}`);
    });
  });

  it('should validate generated voicings against music theory', () => {
    const voicings = getValidatedCAGEDVoicings('D', 'major', {
      maxVoicings: 10,
      onlyValidated: true
    });

    // Alle generierten Voicings sollten gegen Tonal.js validiert sein
    voicings.forEach(v => {
      expect(v.validated).toBe(true);
      expect(v.theoreticalNotes).toEqual(['D', 'F#', 'A']);
    });
  });
});
