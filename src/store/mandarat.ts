'use client';

import { create } from 'zustand';
import { MandaratCell, Mandarat } from '@/types';

const STORAGE_KEY = 'mandarat-guest-data';

// Helper to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Create default empty cells (81 cells for 9x9 grid)
function createDefaultCells(): MandaratCell[] {
  return Array.from({ length: 81 }, (_, i) => ({
    id: generateId(),
    position: i,
    title: '',
  }));
}

// Create default mandarat
function createDefaultMandarat(): Mandarat {
  return {
    id: generateId(),
    title: '나의 만다라트',
    cells: createDefaultCells(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface MandaratStore {
  mandarat: Mandarat;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  updateCellTitle: (position: number, title: string) => void;
  reset: () => void;
  loadFromData: (cells: { position: number; title: string }[]) => void;
}

export const useMandaratStore = create<MandaratStore>((set, get) => ({
  mandarat: createDefaultMandarat(),
  isLoading: false,
  isInitialized: false,

  initialize: () => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Migrate old 9-cell data to 81-cell if needed
        if (data.cells && data.cells.length === 9) {
          data.cells = createDefaultCells();
        }
        set({ mandarat: data });
      } catch {
        // Invalid data, use default
      }
    }

    set({ isInitialized: true });
  },

  updateCellTitle: (position: number, title: string) => {
    const { mandarat } = get();
    const updatedCells = mandarat.cells.map((cell) =>
      cell.position === position ? { ...cell, title } : cell
    );
    const updatedMandarat = {
      ...mandarat,
      cells: updatedCells,
      updatedAt: new Date().toISOString(),
    };

    set({ mandarat: updatedMandarat });

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMandarat));
  },

  reset: () => {
    const newMandarat = createDefaultMandarat();
    set({ mandarat: newMandarat });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMandarat));
  },

  loadFromData: (cells: { position: number; title: string }[]) => {
    const newMandarat: Mandarat = {
      id: generateId(),
      title: '나의 만다라트',
      cells: Array.from({ length: 81 }, (_, i) => {
        const cellData = cells.find((c) => c.position === i);
        return {
          id: generateId(),
          position: i,
          title: cellData?.title || '',
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ mandarat: newMandarat });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMandarat));
  },
}));
