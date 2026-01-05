const { getChordNotes, validateChordVoicing } = require('./src/utils/musicTheory.ts');
const guitar = require('@tombatossals/chords-db/lib/guitar.json');

// Get Am voicings
const am = guitar.chords.A.find(c => c.suffix === 'minor');
const theoreticalNotes = ['A', 'C', 'E']; // Am notes

console.log('Am theoretical notes:', theoreticalNotes);
console.log('\nValidation Results:\n');

am.positions.forEach((pos, i) => {
  console.log(`Voicing ${i + 1}:`);
  console.log(`  baseFret: ${pos.baseFret}`);
  console.log(`  frets: [${pos.frets.join(', ')}]`);

  // Try to validate
  try {
    const isValid = validateChordVoicing(pos.frets, theoreticalNotes);
    console.log(`  ✅ Validated: ${isValid}`);
  } catch (error) {
    console.log(`  ❌ Error:`, error.message);
  }
  console.log('');
});
