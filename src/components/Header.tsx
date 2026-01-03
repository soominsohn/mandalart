'use client';

import { useCallback, RefObject } from 'react';
import { toPng } from 'html-to-image';
import AuthButton from './AuthButton';

interface HeaderProps {
  gridRef: RefObject<HTMLDivElement | null>;
}

export default function Header({ gridRef }: HeaderProps) {
  const handleExport = useCallback(async () => {
    if (!gridRef.current) return;

    try {
      const dataUrl = await toPng(gridRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.download = `mandarat-${today}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  }, [gridRef]);

  return (
    <header className="w-full max-w-3xl mx-auto flex items-center justify-between py-4 sm:py-6 px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">만다라트</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">목표 달성 플래너</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleExport}
          className="
            inline-flex items-center justify-center
            w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2
            text-sm font-medium
            text-slate-600 bg-slate-100
            rounded-lg hover:bg-slate-200
            transition-colors
          "
          title="이미지 저장"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="hidden sm:inline sm:ml-1.5">저장</span>
        </button>
        <AuthButton />
      </div>
    </header>
  );
}
