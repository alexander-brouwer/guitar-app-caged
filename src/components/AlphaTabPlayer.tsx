import React, { useEffect, useRef, useState } from 'react';
import { generateValidatedAlphaTeX } from '../utils/alphaTabChordGenerator';

interface AlphaTabPlayerProps {
  chordProgression: Array<{ note: string; quality: string }>;
  onClose: () => void;
}

export const AlphaTabPlayer: React.FC<AlphaTabPlayerProps> = ({ chordProgression, onClose }) => {
  const alphaTabRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alphaTexNotation, setAlphaTexNotation] = useState<string>('');

  useEffect(() => {
    // Generate AlphaTeX notation with validated chord voicings
    const notation = generateValidatedAlphaTeX(chordProgression);
    setAlphaTexNotation(notation);
    console.log('Generated validated AlphaTeX notation:', notation);
  }, [chordProgression]);

  useEffect(() => {
    if (!alphaTexNotation || !alphaTabRef.current) return;

    let api: any = null;

    const initAlphaTab = async () => {
      try {
        console.log('Starting AlphaTab initialization...');

        // Dynamically import AlphaTab
        const alphaTabModule = await import('@coderline/alphatab');
        console.log('AlphaTab imported successfully');

        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Creating AlphaTab API with settings...');

        // Create settings object with player enabled
        const settings = new alphaTabModule.Settings();
        settings.core.engine = 'html5';
        settings.player.enablePlayer = true;
        settings.player.enableCursor = true;
        settings.player.enableUserInteraction = true;
        settings.player.scrollMode = alphaTabModule.ScrollMode.Continuous;

        // Set soundfont URL - use AlphaTab's CDN soundfont
        settings.core.fontDirectory = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/font/';
        settings.player.soundFont = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2';

        // Initialize AlphaTab with settings
        api = new alphaTabModule.AlphaTabApi(alphaTabRef.current!, settings);

        // Load the AlphaTeX notation
        api.tex(alphaTexNotation);

        // Set up event listeners
        api.renderStarted.on(() => {
          console.log('AlphaTab render started');
          setError(null);
        });

        api.renderFinished.on(() => {
          console.log('AlphaTab render finished');
          setIsLoading(false);
        });

        api.error.on((e: any) => {
          console.error('AlphaTab error event:', e);
          setError(`Failed to render tablature: ${e.message || 'Unknown error'}`);
          setIsLoading(false);
        });

        // Manually wire up player controls
        const playButton = document.querySelector('.at-player-play');
        const stopButton = document.querySelector('.at-player-stop');

        if (playButton) {
          playButton.addEventListener('click', () => {
            console.log('Play button clicked');
            console.log('Current player state:', api.playerState);
            console.log('Player ready:', api.isReadyForPlayback);

            if (!api.isReadyForPlayback) {
              console.warn('Player is not ready yet. Soundfont may still be loading...');
              setError('Player is loading soundfont. Please wait a moment and try again.');
              setTimeout(() => setError(null), 3000);
              return;
            }

            api.playPause();
          });
        }

        if (stopButton) {
          stopButton.addEventListener('click', () => {
            console.log('Stop button clicked');
            api.stop();
          });
        }

        // Log player ready state
        api.playerReady.on(() => {
          console.log('✅ AlphaTab player is ready for playback!');
          setError(null);
        });

        api.playerStateChanged.on((e: any) => {
          console.log('Player state changed:', e);
        });

        // Track soundfont loading
        api.soundFontLoad.on((e: any) => {
          console.log('Soundfont loading:', e);
        });

        api.soundFontLoaded.on(() => {
          console.log('✅ Soundfont loaded successfully!');
        });

        console.log('AlphaTab initialized successfully');
        console.log('Player enabled:', api.settings.player.enablePlayer);

      } catch (err: any) {
        console.error('Failed to initialize AlphaTab:', err);
        setError(`Failed to load tablature renderer: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    initAlphaTab();

    // Cleanup
    return () => {
      if (api) {
        try {
          console.log('Destroying AlphaTab API...');
          api.destroy();
        } catch (e) {
          console.error('Error destroying AlphaTab:', e);
        }
      }
    };
  }, [alphaTexNotation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Chord Progression Tablature</h2>
              <p className="text-sm text-purple-100 mt-1">
                {chordProgression.map(c => `${c.note}${c.quality}`).join(' → ')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-4xl font-light leading-none transition-colors"
              aria-label="Close player"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading indicator */}
          {isLoading && !error && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
              <span className="ml-4 text-xl text-gray-600">Loading tablature...</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-6">
              <h3 className="font-bold text-red-900 mb-2">Error</h3>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Player controls */}
          <div className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-4">
              <button
                className="at-player-play bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                title="Play/Pause"
              >
                ▶ Play
              </button>
              <button
                className="at-player-stop bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                title="Stop"
              >
                ■ Stop
              </button>
            </div>
          </div>

          {/* AlphaTab container */}
          <div
            ref={alphaTabRef}
            className="bg-white rounded-lg border-2 border-gray-200 p-4 min-h-[400px]"
            style={{
              opacity: error ? 0.5 : 1, // Only dim on error, not during loading
              overflow: 'auto',
              transition: 'opacity 0.3s'
            }}
          ></div>

          {/* Instructions */}
          {!error && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-bold text-blue-900 mb-2">How to Use</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click the <strong>Play</strong> button to hear the chord progression with MIDI sound</li>
                <li>• The tablature shows fingering positions for each chord</li>
                <li>• Numbers indicate which fret to press on each string</li>
                <li>• The cursor will follow along as the music plays</li>
                <li>• Click anywhere on the score to start playback from that position</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

