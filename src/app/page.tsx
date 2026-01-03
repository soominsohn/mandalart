'use client';

import { useEffect, useRef } from 'react';
import { useMandaratStore } from '@/store/mandarat';
import MandaratGrid from '@/components/MandaratGrid';
import Header from '@/components/Header';

export default function Home() {
  const { initialize, isInitialized, isLoading } = useMandaratStore();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8 overflow-x-hidden">
      <Header gridRef={gridRef} />
      <main className="px-3 sm:px-4">
        <MandaratGrid ref={gridRef} />
      </main>
    </div>
  );
}
