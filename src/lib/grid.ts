// 9x9 Mandarat Grid Utilities

// Grid is 9x9 = 81 cells, divided into 9 blocks of 3x3

// Position to row/col
export function positionToRowCol(position: number): { row: number; col: number } {
  return {
    row: Math.floor(position / 9),
    col: position % 9,
  };
}

// Row/col to position
export function rowColToPosition(row: number, col: number): number {
  return row * 9 + col;
}

// Get block index (0-8) for a position
export function getBlockIndex(position: number): number {
  const { row, col } = positionToRowCol(position);
  const blockRow = Math.floor(row / 3);
  const blockCol = Math.floor(col / 3);
  return blockRow * 3 + blockCol;
}

// Check if position is a block center
export function isBlockCenter(position: number): boolean {
  const { row, col } = positionToRowCol(position);
  return row % 3 === 1 && col % 3 === 1;
}

// Check if position is the main goal (center of center block)
export function isMainGoal(position: number): boolean {
  return position === 40; // Row 4, Col 4
}

// Check if position is in the center block
export function isInCenterBlock(position: number): boolean {
  const { row, col } = positionToRowCol(position);
  return row >= 3 && row <= 5 && col >= 3 && col <= 5;
}

// Get the sub-goal positions (8 cells around center of center block)
// Numbered 1-8: top-left(1), top(2), top-right(3), left(4), right(5), bottom-left(6), bottom(7), bottom-right(8)
export function getSubGoalPositions(): number[] {
  return [30, 31, 32, 39, 41, 48, 49, 50];
}

// Sub-goal position to number (1-8)
const subGoalNumbers: Record<number, number> = {
  30: 1, // top-left
  31: 2, // top
  32: 3, // top-right
  39: 4, // left
  41: 5, // right
  48: 6, // bottom-left
  49: 7, // bottom
  50: 8, // bottom-right
};

// Get sub-goal number for a position (returns null if not a sub-goal)
export function getSubGoalNumber(position: number): number | null {
  return subGoalNumbers[position] ?? null;
}

// Check if position is a sub-goal (in center block, around main goal)
export function isSubGoal(position: number): boolean {
  return position in subGoalNumbers;
}

// Mapping from sub-goal position to outer block center position
const subGoalToBlockCenter: Record<number, number> = {
  30: 10, // Block (0,0) center
  31: 13, // Block (0,1) center
  32: 16, // Block (0,2) center
  39: 37, // Block (1,0) center
  41: 43, // Block (1,2) center
  48: 64, // Block (2,0) center
  49: 67, // Block (2,1) center
  50: 70, // Block (2,2) center
};

// Mapping from outer block center to its corresponding sub-goal
const blockCenterToSubGoal: Record<number, number> = {
  10: 30,
  13: 31,
  16: 32,
  37: 39,
  43: 41,
  64: 48,
  67: 49,
  70: 50,
};

// Get the linked sub-goal position for an outer block center
export function getLinkedSubGoal(position: number): number | null {
  return blockCenterToSubGoal[position] ?? null;
}

// Get the linked outer block center for a sub-goal
export function getLinkedBlockCenter(position: number): number | null {
  return subGoalToBlockCenter[position] ?? null;
}

// Check if a position is an outer block center (linked to a sub-goal)
export function isOuterBlockCenter(position: number): boolean {
  return position in blockCenterToSubGoal;
}

// Get all positions in a specific block
export function getBlockPositions(blockIndex: number): number[] {
  const blockRow = Math.floor(blockIndex / 3);
  const blockCol = blockIndex % 3;
  const startRow = blockRow * 3;
  const startCol = blockCol * 3;

  const positions: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      positions.push(rowColToPosition(startRow + r, startCol + c));
    }
  }
  return positions;
}
