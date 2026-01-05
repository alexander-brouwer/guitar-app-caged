import React, { useEffect } from 'react';
import { ChordVoicing } from '../utils/cagedSystem';
import { getChordNotes } from '../utils/musicTheory';
import { getDatabaseStats, getVoicingCount } from '../utils/chordDatabase';

interface ChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  chord: { note: string; quality: string };
  voicings: ChordVoicing[];
}

// Chord diagram component (reused from main app logic)
const ChordDiagram: React.FC<{ voicing: ChordVoicing }> = ({ voicing }) => {
  const frets = voicing.frets;
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']; // Low to high

  // ✅ Get baseFret from voicing (frets are already relative to baseFret)
  const baseFret = (voicing as any).baseFret || 1;
  const hasOpenStrings = frets.some(f => f === 0);

  // ✅ Determine start fret and fret span using baseFret
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

  return (
    <div className="flex flex-col items-center bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      {/* Voicing name and difficulty */}
      <div className="text-center mb-2">
        <div className="text-sm font-bold text-gray-800">{voicing.name}</div>
        <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${
          voicing.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
          voicing.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {voicing.difficulty}
        </div>
      </div>

      {/* CAGED shape label */}
      <div className="text-2xl font-bold text-blue-600 mb-2">
        {voicing.cagedShape}
      </div>

      {/* Chord diagram */}
      <svg width="90" height={20 + fretSpan * 15 + 10} viewBox={`0 0 90 ${20 + fretSpan * 15 + 10}`} className="mb-2">
        {/* Fret position indicator (if not at nut) */}
        {startFret > 0 && (
          <text x="2" y="15" className="text-xs font-bold fill-gray-700">
            {startFret}fr
          </text>
        )}

        {/* Nut indicator (thick line at top if position 0) */}
        {startFret === 0 && (
          <line x1="20" y1="20" x2="70" y2="20" stroke="#333" strokeWidth="4"/>
        )}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: fretSpan }, (_, i) => i).map(fret => (
          <line key={fret} x1="20" y1={20 + fret * 15} x2="70" y2={20 + fret * 15}
                stroke="#666" strokeWidth={fret === 0 && startFret === 0 ? "3" : "1.5"}/>
        ))}

        {/* Strings (vertical lines) */}
        {[0, 1, 2, 3, 4, 5].map(string => (
          <line key={string} x1={20 + string * 10} y1="20" x2={20 + string * 10} y2={20 + (fretSpan - 1) * 15}
                stroke="#666" strokeWidth="1.5"/>
        ))}

        {/* Barre indicators */}
        {voicing.barrePositions && voicing.barrePositions.map((barreFret, idx) => {
          const normalizedBarreFret = barreFret - startFret;
          const firstString = normalizedFrets.findIndex(f => f === normalizedBarreFret);
          const lastString = normalizedFrets.lastIndexOf(normalizedBarreFret);
          if (firstString !== lastString && firstString !== -1 && normalizedBarreFret >= 0) {
            const displayBarreFret = normalizedBarreFret; // Already relative, no shift needed
            return (
              <rect
                key={idx}
                x={20 + firstString * 10 - 3}
                y={20 + (displayBarreFret - 0.5) * 15 - 3}
                width={(lastString - firstString) * 10 + 6}
                height="6"
                fill="#333"
                rx="3"
              />
            );
          }
          return null;
        })}

        {/* Finger positions */}
        {normalizedFrets.map((fret, stringIndex) => {
          const originalFret = frets[stringIndex];

          if (originalFret === -1) {
            // X for muted string
            return (
              <g key={stringIndex}>
                <line x1={16 + stringIndex * 10} y1="12" x2={24 + stringIndex * 10} y2="4"
                      stroke="red" strokeWidth="2.5"/>
                <line x1={16 + stringIndex * 10} y1="4" x2={24 + stringIndex * 10} y2="12"
                      stroke="red" strokeWidth="2.5"/>
              </g>
            );
          } else if (originalFret === 0) {
            // Open string (only if original fret is 0)
            return (
              <circle key={stringIndex} cx={20 + stringIndex * 10} cy="8" r="4"
                      fill="none" stroke="green" strokeWidth="2.5"/>
            );
          } else {
            // Fretted note (use normalized fret for position)
            // Frets are already relative to startFret, no shift needed
            const displayFret = fret;
            return (
              <circle key={stringIndex} cx={20 + stringIndex * 10} cy={20 + (displayFret - 0.5) * 15}
                      r="5" fill="#333"/>
            );
          }
        })}
      </svg>

      {/* Tablature notation */}
      <div className="text-xs font-mono bg-gray-100 px-3 py-1 rounded">
        {frets.map(fret => {
          if (fret === -1) return 'x';
          if (fret === 0) return '0';
          // Convert relative to absolute for display
          return baseFret > 1 ? baseFret + fret - 1 : fret;
        }).join('-')}
      </div>

      {/* Position indicator */}
      {startFret > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Starts at fret {startFret}
        </div>
      )}
    </div>
  );
};

export const ChordModal: React.FC<ChordModalProps> = ({ isOpen, onClose, chord, voicings }) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const chordName = `${chord.note}${chord.quality}`;

  // Get theoretical notes from Tonal.js
  const theoreticalNotes = getChordNotes(chord.note, chord.quality);

  // Get voicing count from chords-db
  const totalVoicingsInDB = getVoicingCount(chord.note, chord.quality);

  // Get database statistics
  const dbStats = getDatabaseStats();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {chordName} - CAGED System Voicings
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Explore {voicings.length} different voicings across the fretboard
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-4xl font-light leading-none transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Music Theory Info */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-500 p-4 mb-6 rounded-lg">
            <h3 className="font-bold text-purple-900 mb-3">Music Theory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-70 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Chord Notes</p>
                <p className="text-lg font-bold text-purple-900">
                  {theoreticalNotes.length > 0 ? theoreticalNotes.join(' - ') : 'N/A'}
                </p>
              </div>
              <div className="bg-white bg-opacity-70 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Available Voicings</p>
                <p className="text-lg font-bold text-blue-900">
                  {voicings.length} / {totalVoicingsInDB} <span className="text-sm font-normal text-gray-600">(shown/total in DB)</span>
                </p>
              </div>
              <div className="bg-white bg-opacity-70 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Database Stats</p>
                <p className="text-sm text-gray-700">
                  {dbStats.totalChords} chords, {dbStats.totalPositions} positions
                </p>
              </div>
            </div>
          </div>

          {/* CAGED explanation */}
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <h3 className="font-bold text-blue-900 mb-2">About the CAGED System</h3>
            <p className="text-sm text-blue-800">
              The CAGED system uses five basic open chord shapes (C, A, G, E, D) that can be moved
              up and down the neck to play the same chord in different positions. Each shape creates
              a unique voicing with different tonal characteristics.
            </p>
          </div>

          {/* Voicings grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {voicings.map((voicing, index) => (
              <ChordDiagram key={index} voicing={voicing} />
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              <strong>Tip:</strong> Try different voicings to find the sound that fits your music best.
              Higher positions offer brighter tones, while lower positions sound warmer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
