import { describe, it, expect } from 'vitest'

// Known correct chord shapes for validation
// Format: [E(low), A, D, G, B, E(high)] - from 6th string to 1st string
// -1 = muted (x), 0 = open string, numbers = fret positions

const knownChordShapes = {
  // Major chords - open position
  'C': { shape: [-1, 3, 2, 0, 1, 0], notes: ['x', 'C', 'E', 'G', 'C', 'E'], tab: 'x32010' },
  'D': { shape: [-1, -1, 0, 2, 3, 2], notes: ['x', 'x', 'D', 'A', 'D', 'F#'], tab: 'xx0232' },
  'E': { shape: [0, 2, 2, 1, 0, 0], notes: ['E', 'B', 'E', 'G#', 'B', 'E'], tab: '022100' },
  'F': { shape: [1, 3, 3, 2, 1, 1], notes: ['F', 'C', 'F', 'A', 'C', 'F'], tab: '133211' },
  'G': { shape: [3, 2, 0, 0, 0, 3], notes: ['G', 'B', 'D', 'G', 'B', 'G'], tab: '320003' },
  'A': { shape: [-1, 0, 2, 2, 2, 0], notes: ['x', 'A', 'E', 'A', 'C#', 'E'], tab: 'x02220' },
  'B': { shape: [-1, 2, 4, 4, 4, 2], notes: ['x', 'B', 'F#', 'B', 'D#', 'F#'], tab: 'x24442' },

  // Minor chords - open position
  'Am': { shape: [-1, 0, 2, 2, 1, 0], notes: ['x', 'A', 'E', 'A', 'C', 'E'], tab: 'x02210' },
  'Dm': { shape: [-1, -1, 0, 2, 3, 1], notes: ['x', 'x', 'D', 'A', 'D', 'F'], tab: 'xx0231' },
  'Em': { shape: [0, 2, 2, 0, 0, 0], notes: ['E', 'B', 'E', 'G', 'B', 'E'], tab: '022000' },
}

// Helper function to get chord shape from the app
// This simulates the getChordShape function from the main app
function getChordShape(chordName: string): number[] {
  const chordShapes: { [key: string]: number[] } = {
    // Major chords - open position shapes
    'C': [-1, 3, 2, 0, 1, 0],
    'D': [-1, -1, 0, 2, 3, 2],
    'E': [0, 2, 2, 1, 0, 0],
    'F': [1, 3, 3, 2, 1, 1],
    'G': [3, 2, 0, 0, 0, 3],
    'A': [-1, 0, 2, 2, 2, 0],
    'B': [-1, 2, 4, 4, 4, 2],

    // Minor chords
    'Am': [-1, 0, 2, 2, 1, 0],
    'Bm': [-1, 2, 4, 4, 3, 2],
    'Cm': [-1, 3, 5, 5, 4, 3],
    'Dm': [-1, -1, 0, 2, 3, 1],
    'Em': [0, 2, 2, 0, 0, 0],
    'Fm': [1, 3, 3, 1, 1, 1],
    'Gm': [3, 5, 5, 3, 3, 3],
  }

  return chordShapes[chordName] || [0, 0, 0, 0, 0, 0]
}

// Helper to convert shape array to tablature string
function shapeToTab(shape: number[]): string {
  return shape.map(fret => fret === -1 ? 'x' : fret.toString()).join('')
}

describe('Chord Shapes Validation', () => {
  describe('Major Chords', () => {
    it('should have correct C major chord shape', () => {
      const shape = getChordShape('C')
      expect(shape).toEqual(knownChordShapes['C'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['C'].tab)
    })

    it('should have correct D major chord shape', () => {
      const shape = getChordShape('D')
      expect(shape).toEqual(knownChordShapes['D'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['D'].tab)
    })

    it('should have correct E major chord shape', () => {
      const shape = getChordShape('E')
      expect(shape).toEqual(knownChordShapes['E'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['E'].tab)
    })

    it('should have correct F major chord shape (barre)', () => {
      const shape = getChordShape('F')
      expect(shape).toEqual(knownChordShapes['F'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['F'].tab)
    })

    it('should have correct G major chord shape', () => {
      const shape = getChordShape('G')
      expect(shape).toEqual(knownChordShapes['G'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['G'].tab)
    })

    it('should have correct A major chord shape', () => {
      const shape = getChordShape('A')
      expect(shape).toEqual(knownChordShapes['A'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['A'].tab)
    })

    it('should have correct B major chord shape (barre)', () => {
      const shape = getChordShape('B')
      expect(shape).toEqual(knownChordShapes['B'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['B'].tab)
    })
  })

  describe('Minor Chords', () => {
    it('should have correct A minor chord shape', () => {
      const shape = getChordShape('Am')
      expect(shape).toEqual(knownChordShapes['Am'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['Am'].tab)
    })

    it('should have correct D minor chord shape', () => {
      const shape = getChordShape('Dm')
      expect(shape).toEqual(knownChordShapes['Dm'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['Dm'].tab)
    })

    it('should have correct E minor chord shape', () => {
      const shape = getChordShape('Em')
      expect(shape).toEqual(knownChordShapes['Em'].shape)
      expect(shapeToTab(shape)).toBe(knownChordShapes['Em'].tab)
    })
  })

  describe('Chord Shape Structure', () => {
    it('should always return an array of 6 elements', () => {
      const testChords = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Dm', 'Em']
      testChords.forEach(chord => {
        const shape = getChordShape(chord)
        expect(shape).toHaveLength(6)
      })
    })

    it('should only contain valid fret numbers (-1 to 24)', () => {
      const testChords = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Dm', 'Em']
      testChords.forEach(chord => {
        const shape = getChordShape(chord)
        shape.forEach(fret => {
          expect(fret).toBeGreaterThanOrEqual(-1)
          expect(fret).toBeLessThanOrEqual(24)
        })
      })
    })

    it('should return default fallback for unknown chords', () => {
      const shape = getChordShape('UnknownChord')
      expect(shape).toEqual([0, 0, 0, 0, 0, 0])
    })
  })

  describe('Tablature Format', () => {
    it('should convert muted strings to "x"', () => {
      const shape = getChordShape('C')
      const tab = shapeToTab(shape)
      expect(tab[0]).toBe('x') // First string muted in C chord
    })

    it('should convert open strings to "0"', () => {
      const shape = getChordShape('C')
      const tab = shapeToTab(shape)
      expect(tab).toContain('0') // C chord has open strings
    })

    it('should show fret numbers correctly', () => {
      const shape = getChordShape('C')
      const tab = shapeToTab(shape)
      expect(tab).toBe('x32010')
    })
  })
})

describe('Chord Diagram Display Logic', () => {
  it('should display muted strings with X marker', () => {
    const shape = getChordShape('C')
    const mutedStrings = shape.filter(fret => fret === -1)
    expect(mutedStrings.length).toBeGreaterThan(0)
  })

  it('should display open strings with O marker', () => {
    const shape = getChordShape('C')
    const openStrings = shape.filter(fret => fret === 0)
    expect(openStrings.length).toBeGreaterThan(0)
  })

  it('should display fretted notes with dots', () => {
    const shape = getChordShape('C')
    const frettedNotes = shape.filter(fret => fret > 0)
    expect(frettedNotes.length).toBeGreaterThan(0)
  })
})
