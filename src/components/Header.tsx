'use client';

import { useCallback, useState, RefObject } from 'react';
import InfoModal from './InfoModal';

interface HeaderProps {
  gridRef: RefObject<HTMLDivElement | null>;
}

export default function Header({ gridRef }: HeaderProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!gridRef.current || isExporting) return;

    setIsExporting(true);

    try {
      const element = gridRef.current;

      // Dynamic import to avoid SSR issues
      const { domToPng } = await import('modern-screenshot');

      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.download = `mandarat-${today}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('이미지 저장에 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setIsExporting(false);
    }
  }, [gridRef, isExporting]);

  return (
    <>
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
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
          {/* Info Button - More visible */}
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="
              ml-2 px-2.5 py-1 sm:px-3 sm:py-1.5
              inline-flex items-center gap-1
              text-xs sm:text-sm font-medium
              text-amber-700 bg-amber-50
              border border-amber-200
              rounded-full
              hover:bg-amber-100 hover:border-amber-300
              transition-all duration-200
              animate-pulse hover:animate-none
            "
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>만다라트란?</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Export Button - More visible */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="
              inline-flex items-center justify-center
              px-3 py-2 sm:px-4 sm:py-2.5
              text-sm font-semibold
              text-white bg-gradient-to-r from-emerald-500 to-teal-500
              rounded-lg hover:from-emerald-600 hover:to-teal-600
              shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            title="이미지로 저장"
          >
            {isExporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
            <span className="ml-1.5">{isExporting ? '저장 중...' : '이미지 저장'}</span>
          </button>
        </div>
      </header>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </>
  );
}
