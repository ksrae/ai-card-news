"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertTriangle, Sparkles, Link2, FileText } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface LimitStatus {
  count: number;
  limit: number;
  remaining: number;
  canCreate: boolean;
}

export default function AdminCreatePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [loading, setLoading] = useState(false);
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const toast = useToast();

  // Check daily limit on mount
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const res = await fetch('/api/limit');
        const data = await res.json();
        setLimitStatus(data);
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkLimit();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || !limitStatus?.canCreate) return;

    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, type: inputType }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Generation failed');

      toast.success("콘텐츠가 생성되었습니다!");
      router.push(`/admin/contents/${result.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "콘텐츠 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !limitStatus?.canCreate || loading || checkingLimit;

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">새 콘텐츠 생성</h1>
        <p className="text-slate-500 mt-1">AI를 활용해 카드뉴스와 아티클을 생성합니다</p>
      </header>

      {/* Daily Limit Notice */}
      <div className={`mb-8 p-5 rounded-2xl flex items-start gap-4 ${limitStatus?.canCreate === false
        ? 'bg-red-50 border border-red-200'
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
        }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${limitStatus?.canCreate === false
            ? 'bg-red-100'
            : 'bg-blue-100'
          }`}>
          <AlertTriangle className={`w-6 h-6 ${limitStatus?.canCreate === false ? 'text-red-500' : 'text-blue-500'
            }`} />
        </div>
        <div>
          {checkingLimit ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              <p className="text-slate-600">등록 가능 횟수를 확인 중...</p>
            </div>
          ) : limitStatus?.canCreate === false ? (
            <>
              <p className="font-bold text-red-700 text-lg">오늘의 등록 한도를 초과했습니다</p>
              <p className="text-sm text-red-600 mt-1">
                하루 최대 3개까지 등록 가능합니다. 오늘 {limitStatus.count}개를 등록했습니다.
                <br />내일(한국 시간 기준 자정 이후) 다시 시도해주세요.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-blue-700 text-lg">
                오늘 남은 등록 횟수: <span className="text-2xl">{limitStatus?.remaining}</span>회
              </p>
              <p className="text-sm text-blue-600 mt-1">
                하루 최대 3개까지 등록 가능합니다 (한국 시간 기준).
                AI 토큰 비용 절약을 위해 등록 수가 제한됩니다.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Input Type Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          입력 유형 선택
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setInputType('text')}
            disabled={isDisabled && !loading}
            className={`p-5 rounded-xl font-medium transition-all text-left border-2 ${inputType === 'text'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FileText className={`w-8 h-8 mb-3 ${inputType === 'text' ? 'text-blue-500' : 'text-slate-400'}`} />
            <div className="font-bold">텍스트</div>
            <div className="text-sm opacity-70 mt-1">기사나 글을 직접 붙여넣기</div>
          </button>
          <button
            onClick={() => setInputType('url')}
            disabled={isDisabled && !loading}
            className={`p-5 rounded-xl font-medium transition-all text-left border-2 ${inputType === 'url'
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Link2 className={`w-8 h-8 mb-3 ${inputType === 'url' ? 'text-blue-500' : 'text-slate-400'}`} />
            <div className="font-bold">URL</div>
            <div className="text-sm opacity-70 mt-1">웹 페이지 URL로 불러오기</div>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          {inputType === 'text' ? '콘텐츠 내용' : '웹 페이지 URL'}
        </label>
        {inputType === 'text' ? (
          <textarea
            className="w-full h-72 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all text-slate-800 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            placeholder={isDisabled && !loading ? "등록 한도 초과로 입력이 비활성화되었습니다" : "변환할 기사나 글을 여기에 붙여넣으세요..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isDisabled && !loading}
          />
        ) : (
          <input
            type="url"
            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            placeholder={isDisabled && !loading ? "등록 한도 초과로 입력이 비활성화되었습니다" : "https://example.com/article..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isDisabled && !loading}
          />
        )}
        <p className="text-sm text-slate-400 mt-3">
          {inputType === 'text'
            ? '긴 기사나 글을 입력하면 AI가 핵심 내용을 분석하여 카드뉴스와 요약 아티클을 생성합니다.'
            : 'URL을 입력하면 해당 페이지의 내용을 자동으로 추출하여 변환합니다.'
          }
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isDisabled || !input.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-6 w-6" />
            AI가 콘텐츠를 생성하고 있습니다...
          </>
        ) : limitStatus?.canCreate === false ? (
          '등록 한도 초과'
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            카드뉴스 & 아티클 생성
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-sm text-slate-500 mt-4">
          생성에는 약 10~30초 정도 소요됩니다. 페이지를 닫지 마세요.
        </p>
      )}
    </div>
  );
}
