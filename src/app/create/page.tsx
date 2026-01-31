"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/components/ToastProvider";

interface LimitStatus {
  count: number;
  limit: number;
  remaining: number;
  canCreate: boolean;
}

export default function CreatePage() {
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

      toast.success("Content generation completed!");
      router.push(`/${result.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !limitStatus?.canCreate || loading || checkingLimit;

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="p-4 flex items-center border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="font-bold text-lg">Create New</span>
      </nav>

      <div className="max-w-3xl mx-auto p-8 pt-12">
        <h1 className="text-3xl font-bold mb-4">What do you want to create?</h1>

        {/* Daily Limit Notice */}
        <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 ${limitStatus?.canCreate === false
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
          }`}>
          <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${limitStatus?.canCreate === false ? 'text-red-500' : 'text-blue-500'
            }`} />
          <div>
            {checkingLimit ? (
              <p className="text-gray-600">등록 가능 횟수를 확인 중...</p>
            ) : limitStatus?.canCreate === false ? (
              <>
                <p className="font-semibold text-red-700">오늘의 등록 한도를 초과했습니다</p>
                <p className="text-sm text-red-600 mt-1">
                  하루 최대 3개까지 등록 가능합니다. 오늘 {limitStatus.count}개를 등록했습니다.
                  <br />내일(한국 시간 기준 자정 이후) 다시 시도해주세요.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-blue-700">오늘 남은 등록 횟수: {limitStatus?.remaining}회</p>
                <p className="text-sm text-blue-600 mt-1">
                  하루 최대 3개까지 등록 가능합니다 (한국 시간 기준).
                  <br />AI 토큰 비용 절약을 위해 등록 수가 제한됩니다.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setInputType('text')}
            disabled={isDisabled}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center border ${inputType === 'text'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Text
          </button>
          <button
            onClick={() => setInputType('url')}
            disabled={isDisabled}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center border ${inputType === 'url'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            URL
          </button>
        </div>

        <div className="relative mb-8">
          {inputType === 'text' ? (
            <textarea
              className="w-full h-60 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none transition-all text-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              placeholder={isDisabled && !loading ? "등록 한도 초과로 입력이 비활성화되었습니다" : "Paste your content here..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isDisabled && !loading}
            />
          ) : (
            <input
              type="text"
              className="w-full p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              placeholder={isDisabled && !loading ? "등록 한도 초과로 입력이 비활성화되었습니다" : "https://example.com/article..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isDisabled && !loading}
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isDisabled || !input.trim()}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Generating...
            </>
          ) : limitStatus?.canCreate === false ? (
            '등록 한도 초과'
          ) : (
            'Generate Cards & Article'
          )}
        </button>
      </div>
    </div>
  );
}
