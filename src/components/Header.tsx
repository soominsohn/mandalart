'use client';

import { useCallback, useState, useRef, RefObject } from 'react';
import InfoModal from './InfoModal';
import { useMandaratStore } from '@/store/mandarat';
import { embedMandaratData, extractMandaratData } from '@/lib/png-metadata';

interface HeaderProps {
  gridRef: RefObject<HTMLDivElement | null>;
}

export default function Header({ gridRef }: HeaderProps) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mandarat, reset, loadFromData } = useMandaratStore();

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

      // 만다라트 데이터를 PNG 메타데이터에 포함
      const cellsData = mandarat.cells.map((cell) => ({
        position: cell.position,
        title: cell.title,
      }));
      const dataUrlWithMetadata = embedMandaratData(dataUrl, cellsData);

      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.download = `mandarat-${today}.png`;
      link.href = dataUrlWithMetadata;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('이미지 저장에 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setIsExporting(false);
    }
  }, [gridRef, isExporting, mandarat.cells]);

  const handleReset = useCallback(() => {
    reset();
    setIsResetModalOpen(false);
  }, [reset]);

  const handleImportClick = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const handleImportConfirm = useCallback(() => {
    setIsImportModalOpen(false);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsImporting(true);

      try {
        const cells = await extractMandaratData(file);
        if (cells) {
          loadFromData(cells);
          alert('만다라트 데이터를 성공적으로 불러왔습니다!');
        } else {
          alert(
            '이 이미지에서 만다라트 데이터를 찾을 수 없습니다.\n이 앱에서 저장한 이미지만 불러올 수 있습니다.'
          );
        }
      } catch (error) {
        console.error('Failed to import:', error);
        alert('이미지를 불러오는데 실패했습니다.');
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [loadFromData]
  );

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
          {/* Info Button */}
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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* New Button */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="
              inline-flex items-center justify-center
              px-2.5 py-2 sm:px-3 sm:py-2.5
              text-sm font-medium
              text-slate-600 bg-white
              border border-slate-200
              rounded-lg hover:bg-slate-50 hover:border-slate-300
              transition-all duration-200
            "
            title="새로 만들기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="ml-1.5 hidden sm:inline">새로 만들기</span>
          </button>

          {/* Import Button */}
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="
              inline-flex items-center justify-center
              px-2.5 py-2 sm:px-3 sm:py-2.5
              text-sm font-medium
              text-slate-600 bg-white
              border border-slate-200
              rounded-lg hover:bg-slate-50 hover:border-slate-300
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            title="이어하기 (이미지 불러오기)"
          >
            {isImporting ? (
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
            <span className="ml-1.5 hidden sm:inline">{isImporting ? '불러오는 중...' : '이어하기'}</span>
          </button>

          {/* Export Button */}
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

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsResetModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                새로 만들기
              </h3>
              <p className="text-sm text-center text-slate-600 mb-3">
                현재 작성한 내용이 모두 삭제됩니다.<br />
                계속하시겠습니까?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                <p className="text-xs text-blue-700 text-center">
                  <strong>Tip:</strong> 삭제 전에 &apos;이미지 저장&apos;을 하면<br />
                  나중에 &apos;이어하기&apos;로 복원할 수 있어요!
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  삭제하고 새로 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Guide Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsImportModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                이어하기
              </h3>
              <p className="text-sm text-center text-slate-600 mb-4">
                이전에 &apos;이미지 저장&apos;으로 다운로드한<br />
                PNG 이미지를 업로드해주세요.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-xs text-amber-700 text-center">
                  이 앱에서 저장한 이미지만 불러올 수 있습니다.<br />
                  (일반 이미지나 스크린샷은 지원되지 않습니다)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleImportConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  이미지 선택
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
