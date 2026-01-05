import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChordModal } from '../components/ChordModal';
import { generateCAGEDVoicings } from '../utils/cagedSystem';

describe('ChordModal Component Tests', () => {
  const mockChord = { note: 'C', quality: '' };
  const mockVoicings = generateCAGEDVoicings('C', '');
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ChordModal
          isOpen={false}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );
      expect(screen.getByText(/C - CAGED System Voicings/i)).toBeInTheDocument();
    });

    it('should display chord name in header', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );
      expect(screen.getByText(/C - CAGED System Voicings/i)).toBeInTheDocument();
    });

    it('should display correct chord name for minor chords', () => {
      const minorChord = { note: 'A', quality: 'm' };
      const minorVoicings = generateCAGEDVoicings('A', 'm');
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={minorChord}
          voicings={minorVoicings}
        />
      );
      expect(screen.getByText(/Am - CAGED System Voicings/i)).toBeInTheDocument();
    });

    it('should display correct chord name for extended chords', () => {
      const extendedChord = { note: 'C', quality: 'maj7' };
      const extendedVoicings = generateCAGEDVoicings('C', 'maj7');
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={extendedChord}
          voicings={extendedVoicings}
        />
      );
      expect(screen.getByText(/Cmaj7 - CAGED System Voicings/i)).toBeInTheDocument();
    });
  });

  describe('Voicing Display', () => {
    it('should display all 5 CAGED voicings', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // Each CAGED shape should be visible
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('should display voicing count in description', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );
      expect(screen.getByText(/Explore 5 different voicings/i)).toBeInTheDocument();
    });

    it('should render SVG chord diagrams', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(5); // One for each voicing
    });

    it('should display tablature notation for each voicing', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // Should have tablature format (numbers separated by dashes or x for muted)
      mockVoicings.forEach(voicing => {
        const tab = voicing.frets.map(f => f === -1 ? 'x' : f).join('-');
        expect(screen.getByText(tab)).toBeInTheDocument();
      });
    });
  });

  describe('Difficulty Indicators', () => {
    it('should display difficulty level for each voicing', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // Use getAllByText to handle multiple voicings with the same difficulty
      const difficulties = mockVoicings.map(v => v.difficulty);
      const uniqueDifficulties = [...new Set(difficulties)];

      uniqueDifficulties.forEach(difficulty => {
        const elements = screen.getAllByText(difficulty);
        const expectedCount = difficulties.filter(d => d === difficulty).length;
        expect(elements).toHaveLength(expectedCount);
      });
    });

    it('beginner difficulty should have green styling', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      const beginnerBadges = container.querySelectorAll('.bg-green-100');
      expect(beginnerBadges.length).toBeGreaterThan(0);
    });

    it('intermediate difficulty should have yellow styling', () => {
      // Use a chord with intermediate voicings
      const chord = { note: 'F#', quality: '' };
      const voicings = generateCAGEDVoicings('F#', '');
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={chord}
          voicings={voicings}
        />
      );

      const intermediateBadges = container.querySelectorAll('.bg-yellow-100');
      expect(intermediateBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // Click the backdrop overlay
      const overlay = container.querySelector('.fixed.inset-0');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when modal content is clicked', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // Click the modal content (not the overlay)
      const modalContent = container.querySelector('.bg-gradient-to-br');
      if (modalContent) {
        fireEvent.click(modalContent);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close modal on ESC key press', async () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not close modal on other key presses', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'a' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should only register ESC when modal is open', () => {
      const { rerender } = render(
        <ChordModal
          isOpen={false}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();

      rerender(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Body Scroll Lock', () => {
    it('should prevent body scroll when modal is open', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <ChordModal
          isOpen={false}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('CAGED Information Display', () => {
    it('should display CAGED system explanation', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      expect(screen.getByText(/About the CAGED System/i)).toBeInTheDocument();
      expect(screen.getByText(/uses five basic open chord shapes/i)).toBeInTheDocument();
    });

    it('should display usage tip', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      expect(screen.getByText(/Try different voicings/i)).toBeInTheDocument();
    });
  });

  describe('Chord Diagram Details', () => {
    it('should display position indicator for non-open chords', () => {
      // F# major will have higher position chords
      const chord = { note: 'F#', quality: '' };
      const voicings = generateCAGEDVoicings('F#', '');
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={chord}
          voicings={voicings}
        />
      );

      // Should have some position indicators like "Starts at fret X"
      const positionIndicators = screen.queryAllByText(/Starts at fret/i);
      expect(positionIndicators.length).toBeGreaterThan(0);
    });

    it('should display fret markers for barre chords', () => {
      const chord = { note: 'F', quality: '' };
      const voicings = generateCAGEDVoicings('F', '');
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={chord}
          voicings={voicings}
        />
      );

      // Barre chords should have rect elements for barre indicators
      const barreIndicators = container.querySelectorAll('rect[rx="3"]');
      expect(barreIndicators.length).toBeGreaterThan(0);
    });

    it('should mark muted strings with X', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // C chord has muted low E string
      // Check for red X markers in SVG
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      const mutedMarkers = container.querySelectorAll('line[stroke="red"]');
      expect(mutedMarkers.length).toBeGreaterThan(0);
    });

    it('should mark open strings with O', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // C chord has open strings
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      const openMarkers = container.querySelectorAll('circle[stroke="green"]');
      expect(openMarkers.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('should use responsive grid classes', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      // Check for responsive grid classes
      const grid = container.querySelector('.grid');
      expect(grid?.className).toMatch(/lg:grid-cols-3|xl:grid-cols-5/);
    });

    it('should have scrollable content area', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      const scrollableContent = container.querySelector('.overflow-y-auto');
      expect(scrollableContent).toBeInTheDocument();
    });

    it('should limit modal height', () => {
      const { container } = render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={mockVoicings}
        />
      );

      const modal = container.querySelector('.max-h-\\[90vh\\]');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty voicings array', () => {
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={mockChord}
          voicings={[]}
        />
      );

      expect(screen.getByText(/Explore 0 different voicings/i)).toBeInTheDocument();
    });

    it('should handle sharp notes', () => {
      const chord = { note: 'F#', quality: '' };
      const voicings = generateCAGEDVoicings('F#', '');
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={chord}
          voicings={voicings}
        />
      );

      expect(screen.getByText(/F# - CAGED System Voicings/i)).toBeInTheDocument();
    });

    it('should handle flat notes', () => {
      const chord = { note: 'Bb', quality: '' };
      const voicings = generateCAGEDVoicings('Bb', '');
      render(
        <ChordModal
          isOpen={true}
          onClose={mockOnClose}
          chord={chord}
          voicings={voicings}
        />
      );

      expect(screen.getByText(/Bb - CAGED System Voicings/i)).toBeInTheDocument();
    });

    it('should handle all extended chord qualities', () => {
      const qualities = ['maj7', 'm7', '7', 'sus2', 'sus4'];

      qualities.forEach(quality => {
        const chord = { note: 'C', quality };
        const voicings = generateCAGEDVoicings('C', quality);
        const { container } = render(
          <ChordModal
            isOpen={true}
            onClose={mockOnClose}
            chord={chord}
            voicings={voicings}
          />
        );

        expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument();
      });
    });
  });
});
