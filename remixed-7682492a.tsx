import React, { useState, useRef } from 'react';
import { ChordVoicing } from './src/utils/cagedSystem';
import { getValidatedCAGEDVoicings, getCommonVoicing } from './src/utils/cagedSystemEnhanced';
import { ChordModal } from './src/components/ChordModal';
import { AlphaTabPlayer } from './src/components/AlphaTabPlayer';
import { getExtendedChordShape } from './src/data/extendedChords';

const GuitarScaleApp = () => {
  const [selectedKey, setSelectedKey] = useState('C');
  const [isMinor, setIsMinor] = useState(false);
  const [scaleType, setScaleType] = useState<'pentatonic' | 'blues' | 'modal'>('pentatonic');
  const [modalType, setModalType] = useState<'ionian' | 'aeolian'>('ionian');
  const [chordExtension, setChordExtension] = useState<'basic' | 'maj7' | 'min7' | '7' | 'sus2' | 'sus4'>('basic');

  // CAGED Modal state
  const [selectedChordForModal, setSelectedChordForModal] = useState<{note: string, quality: string} | null>(null);
  const [isChordModalOpen, setIsChordModalOpen] = useState(false);
  const [chordVoicings, setChordVoicings] = useState<ChordVoicing[]>([]);

  // AlphaTab Player state
  const [isAlphaTabOpen, setIsAlphaTabOpen] = useState(false);
  const [selectedProgression, setSelectedProgression] = useState<Array<{note: string, quality: string}>>([]);

  // Circle of Fifths data
  const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];
  const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Dm', 'Gm', 'Cm', 'Fm'];
  
  // Note names
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Guitar tuning (standard tuning) - low E to high E from bottom to top
  const tuning = ['E', 'B', 'G', 'D', 'A', 'E'];
  
  // Scale patterns (intervals from root)
  const scalePatterns = {
    pentatonic: {
      major: [0, 2, 4, 7, 9],
      minor: [0, 3, 5, 7, 10]
    },
    blues: {
      major: [0, 2, 3, 4, 7, 9],
      minor: [0, 3, 5, 6, 7, 10]
    },
    modal: {
      ionian: [0, 2, 4, 5, 7, 9, 11],     // Major scale (W-W-H-W-W-W-H)
      aeolian: [0, 2, 3, 5, 7, 8, 10]     // Natural minor scale (W-H-W-W-H-W-W)
    }
  };

  // Get root note from selected key
  const getRootNote = (key) => {
    if (key.includes('m')) {
      return key.replace('m', '');
    }
    return key;
  };

  // Get note index
  const getNoteIndex = (note) => {
    return noteNames.indexOf(note);
  };

  // Get note at fret
  const getNoteAtFret = (stringNote, fret) => {
    const stringIndex = getNoteIndex(stringNote);
    return noteNames[(stringIndex + fret) % 12];
  };

  // Check if note is in scale
  const isNoteInScale = (note, rootNote, scaleType, isMinor, modalScaleType?: 'ionian' | 'aeolian') => {
    const rootIndex = getNoteIndex(rootNote);
    const noteIndex = getNoteIndex(note);
    const interval = (noteIndex - rootIndex + 12) % 12;

    if (scaleType === 'modal' && modalScaleType) {
      const pattern = scalePatterns.modal[modalScaleType];
      return pattern.includes(interval);
    }

    const pattern = scalePatterns[scaleType as 'pentatonic' | 'blues'][isMinor ? 'minor' : 'major'];
    return pattern.includes(interval);
  };

  // Check if note is a blue note (the added note in blues scales)
  const isBlueNote = (note, rootNote, isMinor) => {
    const rootIndex = getNoteIndex(rootNote);
    const noteIndex = getNoteIndex(note);
    const interval = (noteIndex - rootIndex + 12) % 12;
    
    // Blue notes: b3 in major blues, b5 in minor blues
    if (isMinor) {
      return interval === 6; // b5 (tritone)
    } else {
      return interval === 3; // b3
    }
  };

  // Check if note is root
  const isRootNote = (note, rootNote) => {
    return note === rootNote;
  };

  // Diatonic chord progressions
  const getDiatonicChords = (key, isMinor) => {
    const rootNote = getRootNote(key);
    const rootIndex = getNoteIndex(rootNote);
    
    if (isMinor) {
      // Natural minor scale intervals
      const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
      const chordQualities = ['m', 'dim', '', 'm', 'm', '', ''];
      const romanNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
      
      return minorIntervals.map((interval, index) => ({
        note: noteNames[(rootIndex + interval) % 12],
        quality: chordQualities[index],
        roman: romanNumerals[index],
        degree: index + 1
      }));
    } else {
      // Major scale intervals
      const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
      const chordQualities = ['', 'm', 'm', '', '', 'm', 'dim'];
      const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
      
      return majorIntervals.map((interval, index) => ({
        note: noteNames[(rootIndex + interval) % 12],
        quality: chordQualities[index],
        roman: romanNumerals[index],
        degree: index + 1
      }));
    }
  };

  // Apply chord extension to a chord object
  const applyChordExtension = (chord: { note: string; quality: string; roman: string; degree: number }, extension: string) => {
    if (extension === 'basic') {
      return chord;
    }

    let newQuality = chord.quality;
    let newRoman = chord.roman;

    // Apply extension based on the original chord quality
    if (extension === 'maj7') {
      // Only major chords get maj7
      if (chord.quality === '') {
        newQuality = 'maj7';
        newRoman = chord.roman + 'maj7';
      } else {
        // Keep original quality for non-major chords
        return chord;
      }
    } else if (extension === 'min7' || extension === 'm7') {
      // Only minor chords get min7
      if (chord.quality === 'm') {
        newQuality = 'm7';
        newRoman = chord.roman.replace('i', 'i') + '7';
      } else {
        return chord;
      }
    } else if (extension === '7') {
      // Major chords get dominant 7th
      if (chord.quality === '') {
        newQuality = '7';
        newRoman = chord.roman + '7';
      } else {
        return chord;
      }
    } else if (extension === 'sus2') {
      // Can apply sus2 to any major chord
      if (chord.quality === '') {
        newQuality = 'sus2';
        newRoman = chord.roman + 'sus2';
      } else {
        return chord;
      }
    } else if (extension === 'sus4') {
      // Can apply sus4 to any major chord
      if (chord.quality === '') {
        newQuality = 'sus4';
        newRoman = chord.roman + 'sus4';
      } else {
        return chord;
      }
    }

    return {
      ...chord,
      quality: newQuality,
      roman: newRoman
    };
  };

  // Get validated chord shape from database or fallback to hardcoded shapes
  // Array format: [E(low), A, D, G, B, E(high)] - from 6th string to 1st string
  const getChordShape = (chordName: string): { frets: number[], baseFret: number } => {
    // 1. Check for extended chords first (7th, sus, etc.) from extended chords data
    const extendedShape = getExtendedChordShape(chordName);
    if (extendedShape) {
      console.log(`✅ Using extended chord shape for ${chordName}`);
      return { frets: extendedShape, baseFret: 1 }; // Extended shapes are open chords
    }

    // 2. Parse chord name to extract note and quality
    const parseChord = (name: string) => {
      const match = name.match(/^([A-G][#b]?)(.*)/);
      if (!match) return { note: 'C', quality: 'major' };

      const note = match[1];
      let quality = match[2] || 'major';

      if (quality === '') quality = 'major';
      if (quality === 'm' && quality.length === 1) quality = 'minor';

      return { note, quality };
    };

    const { note, quality } = parseChord(chordName);

    // 3. Try to get validated voicing from chords-db database
    try {
      const voicing = getCommonVoicing(note, quality);
      if (voicing && voicing.frets) {
        const baseFret = (voicing as any).baseFret || 1;
        console.log(`✅ Using validated voicing from chords-db for ${chordName} (${note} ${quality}):`, voicing.frets, 'baseFret:', baseFret);
        return { frets: voicing.frets, baseFret };
      } else {
        console.warn(`⚠️ No voicing found in chords-db for ${chordName} (${note} ${quality})`);
      }
    } catch (error) {
      console.error(`❌ Error getting voicing for ${chordName}:`, error);
    }

    // 4. Fallback to basic hardcoded shapes for common open chords
    const basicShapes: { [key: string]: number[] } = {
      'C': [-1, 3, 2, 0, 1, 0],
      'D': [-1, -1, 0, 2, 3, 2],
      'E': [0, 2, 2, 1, 0, 0],
      'F': [1, 3, 3, 2, 1, 1],
      'G': [3, 2, 0, 0, 0, 3],
      'A': [-1, 0, 2, 2, 2, 0],
      'Am': [-1, 0, 2, 2, 1, 0],
      'Dm': [-1, -1, 0, 2, 3, 1],
      'Em': [0, 2, 2, 0, 0, 0],
    };

    if (basicShapes[chordName]) {
      console.warn(`⚠️ Using basic fallback shape for ${chordName}`);
      return { frets: basicShapes[chordName], baseFret: 1 };
    }

    console.error(`❌ No shape found for ${chordName} - using C major as last resort`);
    return { frets: basicShapes['C'], baseFret: 1 };
  };

  // Guitar tablature component
  const GuitarTablature = ({ chord }) => {
    const chordName = `${chord.note}${chord.quality}`;
    const { frets, baseFret } = getChordShape(chordName); // ✅ Destructure to get frets and baseFret
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']; // Low to high

    // Double-click detection (fixed timing issue)
    const lastClickTimeRef = useRef<number>(0);

    const handleTap = () => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;

      if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
        // Double click detected - open CAGED modal with validated voicings
        const voicings = getValidatedCAGEDVoicings(chord.note, chord.quality, {
          maxVoicings: 5,
          onlyValidated: true
        });

        if (voicings.length === 0) {
          console.error(`❌ No valid voicings found for ${chord.note}${chord.quality}`);
          // Still open modal to show the error/empty state
        } else {
          console.log(`✅ Found ${voicings.length} validated voicings for ${chord.note}${chord.quality}`);
        }

        setChordVoicings(voicings);
        setSelectedChordForModal({ note: chord.note, quality: chord.quality });
        setIsChordModalOpen(true);
        lastClickTimeRef.current = 0; // Reset to prevent triple-click
      } else {
        // First click - just record the time
        lastClickTimeRef.current = now;
      }
    };

    // ✅ Use baseFret for diagram display (same logic as ChordModal)
    const hasOpenStrings = frets.some((f: number) => f === 0);

    // Determine start fret and fret span using baseFret
    let startFret = 0;
    let fretSpan = 5; // Default: show 5 frets

    if (baseFret > 1 && !hasOpenStrings) {
      // Barre chord: use baseFret as starting position
      startFret = baseFret;
      fretSpan = 4; // Show baseFret + 3 more frets
    } else {
      // Open chord: start at fret 0
      startFret = 0;
      fretSpan = 5;
    }

    // ✅ Frets are already relative to baseFret - no normalization needed!
    const normalizedFrets = frets;

    // Calculate dynamic SVG height
    const svgHeight = 20 + fretSpan * 12 + 10;

    return (
      <div
        className="flex flex-col items-center bg-white border rounded-lg p-3 shadow-sm cursor-pointer hover:scale-105 hover:shadow-md transition-all"
        onClick={handleTap}
      >
        <div className="text-sm font-bold text-gray-800 mb-2">{chordName}</div>

        {/* Chord diagram */}
        <svg width="60" height={svgHeight} viewBox={`0 0 60 ${svgHeight}`} className="mb-2">
          {/* Fret position indicator (if not at nut) */}
          {startFret > 0 && (
            <text x="2" y="28" className="text-xs font-bold fill-gray-700" style={{ fontSize: '8px' }}>
              {startFret}fr
            </text>
          )}

          {/* Nut indicator (thick line at top if position 0) */}
          {startFret === 0 && (
            <line x1="10" y1="15" x2="50" y2="15" stroke="#333" strokeWidth="3"/>
          )}

          {/* Frets (horizontal lines) */}
          {Array.from({ length: fretSpan }, (_, i) => i).map(fret => (
            <line key={fret} x1="10" y1={15 + fret * 12} x2="50" y2={15 + fret * 12}
                  stroke="#666" strokeWidth={fret === 0 && startFret === 0 ? "2" : "1"}/>
          ))}

          {/* Strings (vertical lines) */}
          {[0, 1, 2, 3, 4, 5].map(string => (
            <line key={string} x1={10 + string * 8} y1="15" x2={10 + string * 8} y2={15 + (fretSpan - 1) * 12}
                  stroke="#666" strokeWidth="1"/>
          ))}

          {/* Finger positions */}
          {normalizedFrets.map((fret: number, stringIndex: number) => {
            const originalFret = frets[stringIndex];

            if (originalFret === -1) {
              // X for muted string
              return (
                <g key={stringIndex}>
                  <line x1={6 + stringIndex * 8} y1="8" x2={14 + stringIndex * 8} y2="2"
                        stroke="red" strokeWidth="2"/>
                  <line x1={6 + stringIndex * 8} y1="2" x2={14 + stringIndex * 8} y2="8"
                        stroke="red" strokeWidth="2"/>
                </g>
              );
            } else if (originalFret === 0) {
              // Open string (only if original fret is 0)
              return (
                <circle key={stringIndex} cx={10 + stringIndex * 8} cy="5" r="3"
                        fill="none" stroke="green" strokeWidth="2"/>
              );
            } else {
              // Fretted note (use normalized fret for position)
              // Frets are already relative to startFret, no need to shift
              const displayFret = fret;
              return (
                <circle key={stringIndex} cx={10 + stringIndex * 8} cy={15 + (displayFret - 0.5) * 12}
                        r="4" fill="#333"/>
              );
            }
          })}
        </svg>

        {/* Tablature notation */}
        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
          {frets.map(fret => {
            if (fret === -1) return 'x';
            if (fret === 0) return '0';
            // Convert relative to absolute for display
            return baseFret > 1 ? baseFret + fret - 1 : fret;
          }).join('-')}
        </div>

        {/* Position indicator text */}
        {startFret > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Position {startFret}
          </div>
        )}
      </div>
    );
  };

  // Chord tab component
  const ChordTab = ({ chord, isMinor, isProgression = false }) => {
    const chordName = `${chord.note}${chord.quality}`;
    
    return (
      <div className="flex flex-col items-center mx-2">
        <svg width="80" height="100" viewBox="0 0 80 100" className="mb-2">
          {/* Tab background */}
          <rect x="0" y="0" width="80" height="100" rx="8" ry="8" 
                fill={chord.degree === 1 ? (isMinor ? '#8b5cf6' : '#3b82f6') : 'white'} 
                stroke="#d1d5db" strokeWidth="2"/>
          
          {/* Chord name */}
          <text x="40" y="35" textAnchor="middle" 
                className={`text-lg font-bold ${chord.degree === 1 ? 'fill-white' : 'fill-gray-800'}`}>
            {chordName}
          </text>
          
          {/* Roman numeral */}
          <text x="40" y="55" textAnchor="middle" 
                className={`text-sm ${chord.degree === 1 ? 'fill-white' : 'fill-gray-600'}`}>
            {chord.roman}
          </text>
          
          {/* Degree number */}
          <circle cx="40" cy="75" r="12" 
                  fill={chord.degree === 1 ? 'rgba(255,255,255,0.3)' : '#f3f4f6'} 
                  stroke={chord.degree === 1 ? 'white' : '#d1d5db'} strokeWidth="1"/>
          <text x="40" y="80" textAnchor="middle" 
                className={`text-sm font-medium ${chord.degree === 1 ? 'fill-white' : 'fill-gray-700'}`}>
            {chord.degree}
          </text>
        </svg>
        
        {!isProgression && (
          <div className="text-center">
            <div className={`text-sm font-semibold ${chord.degree === 1 ? (isMinor ? 'text-purple-600' : 'text-blue-600') : 'text-gray-700'}`}>
              {chordName}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Popular chord progressions by genre
  const chordProgressions = {
    Rock: [
      { name: "I-V-vi-IV", progression: [1, 5, 6, 4], description: "The most popular rock progression" },
      { name: "vi-IV-I-V", progression: [6, 4, 1, 5], description: "Emotional pop-rock ballad progression" },
      { name: "I-bVII-IV-I", progression: [1, 7, 4, 1], description: "Classic rock anthem progression" },
      { name: "I-IV-V-I", progression: [1, 4, 5, 1], description: "Traditional blues-rock progression" },
      { name: "vi-V-IV-V", progression: [6, 5, 4, 5], description: "Building tension rock progression" }
    ],
    Pop: [
      { name: "vi-IV-I-V", progression: [6, 4, 1, 5], description: "The pop ballad progression" },
      { name: "I-V-vi-IV", progression: [1, 5, 6, 4], description: "Feel-good pop progression" },
      { name: "I-vi-IV-V", progression: [1, 6, 4, 5], description: "50s pop progression" },
      { name: "vi-V-IV-V", progression: [6, 5, 4, 5], description: "Building pop progression" },
      { name: "I-IV-vi-V", progression: [1, 4, 6, 5], description: "Uplifting pop progression" }
    ]
  };

  const [selectedGenre, setSelectedGenre] = useState('Rock');

  // Get chord from degree
  const getChordFromDegree = (degree, key, isMinor) => {
    const chords = getDiatonicChords(key, isMinor);
    if (degree <= chords.length) {
      return chords[degree - 1];
    }
    // Handle borrowed chords (like bVII in major)
    if (degree === 7 && !isMinor) {
      // bVII chord in major key
      const rootNote = getRootNote(key);
      const rootIndex = getNoteIndex(rootNote);
      const bVII = noteNames[(rootIndex + 10) % 12];
      return { note: bVII, quality: '', roman: 'bVII', degree: 7 };
    }
    return chords[0]; // fallback
  };

  // Chord Progressions component
  const ChordProgressions = () => {
    const progressions = chordProgressions[selectedGenre];

    // Double-tap detection for progressions
    const ProgressionCard = ({ progression, index }) => {
      const [tapCount, setTapCount] = useState(0);
      const tapTimeoutRef = useRef<number | null>(null);

      const handleProgressionTap = () => {
        setTapCount(prev => prev + 1);

        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);

        tapTimeoutRef.current = setTimeout(() => {
          if (tapCount === 1) {
            // Double tap detected - open AlphaTab player
            const chordSequence = progression.progression.map(degree => {
              const chord = getChordFromDegree(degree, selectedKey, isMinor);
              return { note: chord.note, quality: chord.quality };
            });
            setSelectedProgression(chordSequence);
            setIsAlphaTabOpen(true);
          }
          setTapCount(0);
        }, 300);
      };

      return (
        <div
          key={index}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-purple-400 transition-all"
          onClick={handleProgressionTap}
        >
          <div className="text-center mb-3">
            <h4 className="text-lg font-bold text-gray-800">{progression.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{progression.description}</p>
            <p className="text-xs text-purple-600 mt-2 font-medium">Double-tap to play with MIDI</p>
          </div>

          {/* Chord tabs for progression */}
          <div className="flex flex-wrap justify-center items-center gap-1 mb-3">
            {progression.progression.map((degree, chordIndex) => {
              const chord = getChordFromDegree(degree, selectedKey, isMinor);
              return (
                <div key={chordIndex} className="flex items-center">
                  <div className="scale-75">
                    <ChordTab chord={chord} isMinor={isMinor} isProgression={true} />
                  </div>
                  {chordIndex < progression.progression.length - 1 && (
                    <div className="text-gray-400 mx-1">-</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chord names in text */}
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">
              {progression.progression.map((degree, chordIndex) => {
                const chord = getChordFromDegree(degree, selectedKey, isMinor);
                const chordName = `${chord.note}${chord.quality}`;
                return (
                  <span key={chordIndex}>
                    {chordName}
                    {chordIndex < progression.progression.length - 1 && ' - '}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Popular {selectedGenre} Chord Progressions in {selectedKey}
        </h3>

        {/* Genre selector */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedGenre('Rock')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedGenre === 'Rock'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rock
          </button>
          <button
            onClick={() => setSelectedGenre('Pop')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedGenre === 'Pop'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pop
          </button>
        </div>

        {/* Progressions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {progressions.map((progression, index) => (
            <ProgressionCard key={index} progression={progression} index={index} />
          ))}
        </div>
        
        <div className="mt-6 text-center max-w-2xl">
          <p className="text-sm text-gray-600">
            These progressions use Roman numeral notation where I = tonic, V = dominant, vi = relative minor, etc. 
            Try playing these progressions to hear how they create different emotional feels in your songs.
          </p>
        </div>
      </div>
    );
  };

  // Diatonic chords component
  const DiatonicChords = () => {
    const baseChords = getDiatonicChords(selectedKey, isMinor);
    const chords = baseChords.map(chord => applyChordExtension(chord, chordExtension));

    return (
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Diatonic Chords in {selectedKey}
        </h3>

        {/* Chord extension selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-semibold text-gray-700 self-center mr-2">Chord Type:</span>
          <button
            onClick={() => setChordExtension('basic')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chordExtension === 'basic'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setChordExtension('maj7')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chordExtension === 'maj7'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            maj7
          </button>
          <button
            onClick={() => setChordExtension('min7')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chordExtension === 'min7'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            min7
          </button>
          <button
            onClick={() => setChordExtension('7')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chordExtension === '7'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            7th
          </button>
          <button
            onClick={() => setChordExtension('sus2')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chordExtension === 'sus2'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            sus2
          </button>
          <button
            onClick={() => setChordExtension('sus4')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chordExtension === 'sus4'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            sus4
          </button>
        </div>

        {/* Roman numeral tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2 p-4 bg-gray-50 rounded-lg mb-6">
          {chords.map((chord, index) => (
            <ChordTab key={index} chord={chord} isMinor={isMinor} />
          ))}
        </div>
        
        {/* Guitar tablature for each chord */}
        <div className="w-full max-w-5xl">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Guitar Chord Diagrams & Tablature
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {chords.map((chord, index) => (
              <GuitarTablature key={index} chord={chord} />
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-center max-w-2xl">
          <p className="text-sm text-gray-600 mb-2">
            These are the seven diatonic chords built from the {isMinor ? 'natural minor' : 'major'} scale. 
            The tonic chord ({chords[0].note}{chords[0].quality}) is highlighted above.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Chord Diagrams:</strong> Dots show finger positions, X = muted string, O = open string</p>
            <p><strong>Tablature:</strong> Numbers show fret positions (x = muted, 0 = open)</p>
          </div>
        </div>
      </div>
    );
  };

  // Circle of Fifths component
  const CircleOfFifths = () => {
    const keys = isMinor ? minorKeys : majorKeys;
    const radius = 140;
    const centerX = 160;
    const centerY = 160;

    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setIsMinor(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !isMinor 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Major
          </button>
          <button
            onClick={() => setIsMinor(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMinor 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Minor
          </button>
        </div>
        
        <svg width="320" height="320" className="border rounded-full bg-gray-50">
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="2" />
          {keys.map((key, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const isSelected = selectedKey === key;
            
            return (
              <g key={key}>
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill={isSelected ? (isMinor ? '#8b5cf6' : '#3b82f6') : 'white'}
                  stroke={isSelected ? (isMinor ? '#7c3aed' : '#2563eb') : '#d1d5db'}
                  strokeWidth="2"
                  className="cursor-pointer hover:stroke-gray-400 transition-colors"
                  onClick={() => setSelectedKey(key)}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className={`cursor-pointer text-sm font-medium ${
                    isSelected ? 'fill-white' : 'fill-gray-700'
                  }`}
                  onClick={() => setSelectedKey(key)}
                >
                  {key}
                </text>
              </g>
            );
          })}
          <text x={centerX} y={centerY - 10} textAnchor="middle" className="text-lg font-bold fill-gray-700">
            Circle of
          </text>
          <text x={centerX} y={centerY + 10} textAnchor="middle" className="text-lg font-bold fill-gray-700">
            Fifths
          </text>
        </svg>
      </div>
    );
  };

  // Fretboard component
  const Fretboard = () => {
    const rootNote = getRootNote(selectedKey);
    const fretCount = 17;

    // Fret markers (dots on the fretboard)
    const fretMarkers = [3, 5, 7, 9, 12, 15, 17];
    const doubleFretMarkers = [12];

    return (
      <div className="flex flex-col items-center w-full">
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setScaleType('pentatonic')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              scaleType === 'pentatonic'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pentatonic Scale
          </button>
          <button
            onClick={() => setScaleType('blues')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              scaleType === 'blues'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Blues Scale
          </button>
          <button
            onClick={() => setScaleType('modal')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              scaleType === 'modal'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Modal Scales
          </button>
        </div>

        {/* Modal scale type selector */}
        {scaleType === 'modal' && (
          <div className="mb-4 flex gap-3 bg-purple-50 p-3 rounded-lg">
            <span className="text-sm font-semibold text-gray-700 self-center">Mode:</span>
            <button
              onClick={() => setModalType('ionian')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                modalType === 'ionian'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Ionian (Major)
            </button>
            <button
              onClick={() => setModalType('aeolian')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                modalType === 'aeolian'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Aeolian (Minor)
            </button>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <div className="min-w-max bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 p-4 rounded-lg shadow-xl">
            <div className="flex flex-col">
              {/* Fret numbers */}
              <div className="flex items-center mb-2">
                <div className="w-16 text-center text-xs font-bold text-amber-100">String</div>
                {Array.from({ length: fretCount + 1 }, (_, fret) => (
                  <div key={fret} className="w-12 text-center text-xs font-bold text-amber-100">
                    {fret}
                  </div>
                ))}
              </div>

              {/* Strings (horizontal rows) */}
              <div className="flex flex-col bg-gradient-to-b from-amber-900 to-amber-800 rounded p-2">
                {tuning.map((stringNote, stringIndex) => (
                  <div key={stringIndex} className="flex items-center relative" style={{ height: '40px' }}>
                    {/* String name */}
                    <div className="w-16 text-center text-sm font-bold text-amber-100 z-10">
                      {stringNote}
                    </div>

                    {/* Frets */}
                    <div className="flex-1 flex relative">
                      {/* The string line */}
                      <div
                        className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300"
                        style={{
                          height: `${1 + stringIndex * 0.3}px`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      />

                      {Array.from({ length: fretCount + 1 }, (_, fret) => {
                        const note = getNoteAtFret(stringNote, fret);
                        const inScale = isNoteInScale(note, rootNote, scaleType, isMinor, modalType);
                        const isRoot = isRootNote(note, rootNote);
                        const isBlue = scaleType === 'blues' && isBlueNote(note, rootNote, isMinor);

                        return (
                          <div
                            key={fret}
                            className="w-12 h-10 flex items-center justify-center relative"
                            style={{
                              borderLeft: fret > 0 ? '3px solid #78350f' : 'none',
                              borderRight: fret === 0 ? '4px solid #451a03' : 'none',
                            }}
                          >
                            {/* Fret markers (dots) */}
                            {stringIndex === 2 && fretMarkers.includes(fret) && (
                              <div className="absolute w-2 h-2 bg-amber-200 rounded-full opacity-40"
                                   style={{ top: doubleFretMarkers.includes(fret) ? '8px' : '50%', transform: doubleFretMarkers.includes(fret) ? 'none' : 'translateY(-50%)' }} />
                            )}
                            {stringIndex === 3 && doubleFretMarkers.includes(fret) && (
                              <div className="absolute w-2 h-2 bg-amber-200 rounded-full opacity-40 bottom-2" />
                            )}

                            {/* Scale notes */}
                            {inScale && (
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs z-10 ${
                                  isRoot
                                    ? 'bg-red-500 border-2 border-red-700 shadow-lg'
                                    : isBlue
                                      ? 'bg-blue-500 border-2 border-blue-700 shadow-lg'
                                      : 'bg-green-500 shadow-md'
                                }`}
                              >
                                {note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-gray-800">
            {selectedKey} {scaleType === 'pentatonic' ? 'Pentatonic' : 'Blues'} Scale
          </p>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded-full border border-red-700"></div>
              <span>Root Note ({rootNote})</span>
            </div>
            {scaleType === 'blues' && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full border border-blue-700"></div>
                <span>Blue Notes</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Scale Notes</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Guitar Scale Explorer
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Select Key
          </h2>
          <CircleOfFifths />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Fretboard
          </h2>
          <Fretboard />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <DiatonicChords />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <ChordProgressions />
        </div>
      </div>

      {/* CAGED Modal */}
      {selectedChordForModal && (
        <ChordModal
          isOpen={isChordModalOpen}
          onClose={() => setIsChordModalOpen(false)}
          chord={selectedChordForModal}
          voicings={chordVoicings}
        />
      )}

      {/* AlphaTab Player Modal */}
      {isAlphaTabOpen && (
        <AlphaTabPlayer
          chordProgression={selectedProgression}
          onClose={() => setIsAlphaTabOpen(false)}
        />
      )}
    </div>
  );
};

export default GuitarScaleApp;