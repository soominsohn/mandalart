'use client';

import { useState } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_IMAGES = [
  {
    title: '오타니 쇼헤이 만다라트',
    description: '고등학교 시절 작성한 유명한 목표 설정표',
    url: '/example-baseball.png',
  },
  {
    title: '신년 목표 계획',
    description: '새해 목표를 체계적으로 세분화한 만다라트',
    url: '/example.png',
  },
];

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'examples'>('info');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'info'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              만다라트란?
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'examples'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              예시 보기
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">만다라트(Mandal-Art)란?</h3>
                <p className="text-slate-600 leading-relaxed">
                  만다라트는 일본의 디자이너 <strong>이마이즈미 히로아키</strong>가 1987년에 개발한 발상법이자 목표 설정 도구입니다.
                  불교의 만다라(曼陀羅)에서 영감을 받아, 중심 목표를 둘러싼 체계적인 구조로 아이디어를 확장하고 구체화합니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">구성 방식</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <p className="text-slate-600"><strong>중심 목표 설정</strong>: 가장 중앙 칸에 달성하고 싶은 핵심 목표를 작성합니다.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <p className="text-slate-600"><strong>8가지 핵심 요소</strong>: 중심 목표 주변 8칸에 목표 달성을 위한 핵심 요소를 작성합니다.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <p className="text-slate-600"><strong>세부 실천 항목</strong>: 각 핵심 요소가 바깥쪽 블록의 중앙이 되어, 그 주변에 8가지 구체적인 실천 방안을 작성합니다.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">왜 효과적인가요?</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>추상적인 목표를 <strong>64가지 구체적 행동</strong>으로 분해</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>목표와 실천의 <strong>연결고리를 시각화</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>한눈에 전체 계획을 <strong>파악 가능</strong></span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-1">오타니 쇼헤이의 만다라트</h4>
                <p className="text-amber-700 text-sm">
                  MLB 스타 오타니 쇼헤이가 고등학교 1학년 때 &ldquo;드래프트 1순위 8개 구단 지명&rdquo;을 목표로
                  작성한 만다라트가 유명합니다. 그는 이 만다라트를 통해 체력, 멘탈, 기술 등을
                  체계적으로 발전시켜 꿈을 이뤘습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-600 text-sm">
                아래 예시들을 참고하여 나만의 만다라트를 작성해보세요.
              </p>
              <div className="grid gap-4">
                {EXAMPLE_IMAGES.map((example, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={example.url}
                        alt={example.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center text-slate-400 p-8">
                                <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm">예시 이미지 준비 중</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-800">{example.title}</h4>
                      <p className="text-sm text-slate-500">{example.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
