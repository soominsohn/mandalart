'use client';

import { forwardRef } from 'react';
import MandaratCell from './MandaratCell';

const MandaratGrid = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="w-full max-w-3xl mx-auto p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-xl"
    >
      {/* 3x3 grid of blocks */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((blockIndex) => {
          const blockRow = Math.floor(blockIndex / 3);
          const blockCol = blockIndex % 3;
          const startRow = blockRow * 3;
          const startCol = blockCol * 3;

          const positions: number[] = [];
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              positions.push((startRow + r) * 9 + (startCol + c));
            }
          }

          const isCenterBlock = blockIndex === 4;

          return (
            <div
              key={blockIndex}
              className={`
                grid grid-cols-3 gap-0.5 sm:gap-1.5 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl
                ${isCenterBlock
                  ? 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80 ring-1 sm:ring-2 ring-emerald-300/50 shadow-inner'
                  : 'bg-slate-50/80'
                }
              `}
            >
              {positions.map((position) => (
                <MandaratCell key={position} position={position} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

MandaratGrid.displayName = 'MandaratGrid';

export default MandaratGrid;
