export interface MandaratCell {
  id: string;
  position: number; // 0-80 for 9x9 grid
  title: string;
}

export interface Mandarat {
  id: string;
  userId: string | null;
  title: string;
  cells: MandaratCell[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
}

// Database types for Supabase
export interface DbMandarat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMandaratCell {
  id: string;
  mandarat_id: string;
  position: number;
  title: string;
}
