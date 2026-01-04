export interface MandaratCell {
  id: string;
  position: number; // 0-80 for 9x9 grid
  title: string;
}

export interface Mandarat {
  id: string;
  title: string;
  cells: MandaratCell[];
  createdAt: string;
  updatedAt: string;
}
