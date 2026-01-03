'use client';

import { create } from 'zustand';
import { MandaratCell, Mandarat, DbMandarat, DbMandaratCell } from '@/types';
import { createClient } from '@/lib/supabase';

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
    userId: null,
    title: '나의 만다라트',
    cells: createDefaultCells(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface MandaratStore {
  mandarat: Mandarat;
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  updateCellTitle: (position: number, title: string) => void;
  setUserId: (userId: string | null) => void;
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  migrateLocalToSupabase: () => Promise<void>;
}

export const useMandaratStore = create<MandaratStore>((set, get) => ({
  mandarat: createDefaultMandarat(),
  userId: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const supabase = createClient();

    // Check auth state
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      set({ userId: user.id });
      await get().loadFromSupabase();
    } else {
      // Load from localStorage for guests
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
    }

    set({ isInitialized: true });
  },

  updateCellTitle: (position: number, title: string) => {
    const { mandarat, userId } = get();
    const updatedCells = mandarat.cells.map((cell) =>
      cell.position === position ? { ...cell, title } : cell
    );
    const updatedMandarat = {
      ...mandarat,
      cells: updatedCells,
      updatedAt: new Date().toISOString(),
    };

    set({ mandarat: updatedMandarat });

    // Persist
    if (userId) {
      get().syncToSupabase();
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMandarat));
    }
  },

  setUserId: (userId: string | null) => {
    set({ userId });
  },

  syncToSupabase: async () => {
    const { mandarat, userId } = get();
    if (!userId) return;

    const supabase = createClient();

    // Upsert mandarat
    await supabase.from('mandarats').upsert({
      id: mandarat.id,
      user_id: userId,
      title: mandarat.title,
      updated_at: new Date().toISOString(),
    });

    // Upsert cells
    const cellsToUpsert = mandarat.cells.map((cell) => ({
      id: cell.id,
      mandarat_id: mandarat.id,
      position: cell.position,
      title: cell.title,
    }));

    await supabase.from('mandarat_cells').upsert(cellsToUpsert);
  },

  loadFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true });
    const supabase = createClient();

    // Get user's mandarat
    const { data: mandarats } = await supabase
      .from('mandarats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (mandarats && mandarats.length > 0) {
      const dbMandarat = mandarats[0] as DbMandarat;

      // Get cells
      const { data: cells } = await supabase
        .from('mandarat_cells')
        .select('*')
        .eq('mandarat_id', dbMandarat.id)
        .order('position');

      const mandaratCells: MandaratCell[] = cells
        ? (cells as DbMandaratCell[]).map((c) => ({
            id: c.id,
            position: c.position,
            title: c.title,
          }))
        : createDefaultCells();

      // Fill in missing cells
      const cellMap = new Map(mandaratCells.map((c) => [c.position, c]));
      const fullCells = Array.from({ length: 81 }, (_, i) =>
        cellMap.get(i) || {
          id: generateId(),
          position: i,
          title: '',
        }
      );

      set({
        mandarat: {
          id: dbMandarat.id,
          userId: dbMandarat.user_id,
          title: dbMandarat.title,
          cells: fullCells,
          createdAt: dbMandarat.created_at,
          updatedAt: dbMandarat.updated_at,
        },
      });
    } else {
      // Create new mandarat for user
      const newMandarat = {
        ...createDefaultMandarat(),
        userId,
      };
      set({ mandarat: newMandarat });
      await get().syncToSupabase();
    }

    set({ isLoading: false });
  },

  migrateLocalToSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const localData = JSON.parse(stored) as Mandarat;

      // Load from Supabase first
      await get().loadFromSupabase();

      const { mandarat: supabaseMandarat } = get();

      // Merge: Supabase wins for existing data, but preserve local titles if Supabase is empty
      const mergedCells = supabaseMandarat.cells.map((supabaseCell) => {
        const localCell = localData.cells.find((c) => c.position === supabaseCell.position);

        // If Supabase cell is empty but local has data, use local title
        if (!supabaseCell.title && localCell?.title) {
          return {
            ...supabaseCell,
            title: localCell.title,
          };
        }

        return supabaseCell;
      });

      set({
        mandarat: {
          ...supabaseMandarat,
          cells: mergedCells,
        },
      });

      await get().syncToSupabase();

      // Clear localStorage after migration
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Migration failed, just load from Supabase
      await get().loadFromSupabase();
    }
  },
}));
