import { describe, it, expect } from 'vitest';
import { fretsToNotes, validateChordVoicing } from '../utils/musicTheory';
import { getChordVoicingsFromDB, toAbsoluteFrets } from '../utils/chordDatabase';

describe('Debug Am Voicing Notes', () => {
  it('should show actual notes played by each Am voicing', () => {
    const voicings = getChordVoicingsFromDB('A', 'minor');
    const expectedNotes = ['A', 'C', 'E'];

    console.log('\n=== Am Voicings - Actual Notes Debug (WITH ABSOLUTE FRETS) ===\n');

    voicings.forEach((voicing, index) => {
      const absoluteFrets = toAbsoluteFrets(voicing);
      const actualNotes = fretsToNotes(absoluteFrets);
      const isValid = validateChordVoicing(absoluteFrets, expectedNotes);

      console.log(`Voicing ${index + 1}:`);
      console.log(`  baseFret: ${voicing.baseFret}`);
      console.log(`  relative frets: [${voicing.frets.join(', ')}]`);
      console.log(`  absolute frets: [${absoluteFrets.join(', ')}]`);
      console.log(`  actualNotes: [${actualNotes.join(', ')}]`);
      console.log(`  validated: ${isValid ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
  });
});
