'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMandaratStore } from '@/store/mandarat';
import { extractMandaratData } from '@/lib/png-metadata';
import MandaratGrid from '@/components/MandaratGrid';
import Header from '@/components/Header';

export default function Home() {
  const { initialize, isInitialized, isLoading, loadFromData } = useMandaratStore();
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) {
        alert('PNG 이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      setIsProcessing(true);

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
        setIsProcessing(false);
      }
    },
    [loadFromData]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 pb-8 overflow-x-hidden relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <Header gridRef={gridRef} />
      <main className="px-3 sm:px-4">
        <MandaratGrid ref={gridRef} />
      </main>

      {/* Drag & Drop Overlay */}
      {(isDragging || isProcessing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
            {isProcessing ? (
              <>
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">불러오는 중...</h3>
                <p className="text-sm text-slate-500">잠시만 기다려주세요</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full animate-bounce">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">이미지를 여기에 놓으세요</h3>
                <p className="text-sm text-slate-500">
                  이전에 저장한 만다라트 이미지를<br />
                  드롭하여 이어서 작성하세요
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
