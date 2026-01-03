'use client';

import { useState, useRef, useEffect } from 'react';
import { useMandaratStore } from '@/store/mandarat';
import {
  isMainGoal,
  isInCenterBlock,
  isOuterBlockCenter,
  getLinkedSubGoal,
  isSubGoal,
  getSubGoalNumber,
} from '@/lib/grid';

interface MandaratCellProps {
  position: number;
}

export default function MandaratCell({ position }: MandaratCellProps) {
  const { mandarat, updateCellTitle } = useMandaratStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isCenter = isMainGoal(position);
  const isCenterBlock = isInCenterBlock(position);
  const isLinkedCenter = isOuterBlockCenter(position);
  const isSubGoalCell = isSubGoal(position);

  const linkedSubGoal = getLinkedSubGoal(position);
  const cell = mandarat.cells.find((c) => c.position === position);
  const linkedCell = linkedSubGoal !== null
    ? mandarat.cells.find((c) => c.position === linkedSubGoal)
    : null;

  const displayTitle = isLinkedCenter && linkedCell ? linkedCell.title : cell?.title || '';

  const subGoalNumber = isSubGoalCell
    ? getSubGoalNumber(position)
    : isLinkedCenter && linkedSubGoal !== null
    ? getSubGoalNumber(linkedSubGoal)
    : null;

  // All cells are now editable, including linked centers
  const isEditable = true;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isEditable) return;
    // For linked center, use the linked cell's title
    if (isLinkedCenter && linkedCell) {
      setEditValue(linkedCell.title || '');
    } else {
      setEditValue(cell?.title || '');
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    // For linked center, update the original subGoal cell in the center block
    if (isLinkedCenter && linkedSubGoal !== null) {
      updateCellTitle(linkedSubGoal, editValue.trim());
    } else {
      updateCellTitle(position, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Design tokens
  const styles = {
    mainGoal: {
      bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      border: 'border-amber-300',
      text: 'text-amber-900',
      badge: 'bg-amber-500',
      shadow: 'shadow-sm sm:shadow-md shadow-amber-200/50',
    },
    subGoal: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      badge: 'bg-emerald-500',
      shadow: '',
    },
    linkedCenter: {
      bg: 'bg-gradient-to-br from-sky-50 to-blue-100',
      border: 'border-sky-300',
      text: 'text-sky-800',
      badge: 'bg-sky-500',
      shadow: '',
    },
    actionItem: {
      bg: 'bg-white',
      border: 'border-slate-200',
      text: 'text-slate-700',
      badge: '',
      shadow: '',
    },
  };

  let currentStyle = styles.actionItem;
  if (isCenter) {
    currentStyle = styles.mainGoal;
  } else if (isSubGoalCell) {
    currentStyle = styles.subGoal;
  } else if (isLinkedCenter) {
    currentStyle = styles.linkedCenter;
  }

  const placeholder = isCenter
    ? '핵심 목표'
    : isSubGoalCell || isLinkedCenter
    ? '세부 목표'
    : '';

  return (
    <div
      className={`
        relative flex items-center justify-center
        aspect-square rounded sm:rounded-lg border
        ${currentStyle.bg} ${currentStyle.border} ${currentStyle.shadow}
        ${!isEditing ? 'cursor-pointer active:scale-95 sm:hover:shadow-lg sm:hover:scale-[1.02]' : ''}
        ${isCenter ? 'ring-1 sm:ring-2 ring-amber-400/50 ring-offset-1 sm:ring-offset-2' : ''}
      `}
      onClick={!isEditing && isEditable ? handleStartEdit : undefined}
    >
      {/* Sub-goal number badge */}
      {subGoalNumber !== null && (
        <span
          className={`
            absolute -top-1 -left-1 sm:-top-1.5 sm:-left-1.5
            w-4 h-4 sm:w-5 sm:h-5 rounded-full
            flex items-center justify-center
            text-[9px] sm:text-[11px] font-bold text-white
            shadow-sm
            ${currentStyle.badge}
          `}
        >
          {subGoalNumber}
        </span>
      )}

      {isEditing ? (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-full p-1 sm:p-2 text-center bg-transparent resize-none
            text-[10px] sm:text-[13px] leading-tight sm:leading-snug font-medium
            ${currentStyle.text}
            ${subGoalNumber !== null ? 'pt-2 sm:pt-3' : ''}
          `}
          placeholder={placeholder}
          maxLength={100}
        />
      ) : (
        <span
          className={`
            text-[10px] sm:text-[13px] leading-tight sm:leading-snug text-center break-keep
            font-medium px-0.5 sm:px-1.5
            ${currentStyle.text}
            ${!displayTitle ? 'opacity-30 font-normal text-[8px] sm:text-[11px]' : ''}
            ${subGoalNumber !== null ? 'pt-1 sm:pt-2' : ''}
          `}
        >
          {displayTitle || placeholder}
        </span>
      )}
    </div>
  );
}
