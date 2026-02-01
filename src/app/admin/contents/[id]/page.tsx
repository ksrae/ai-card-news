"use client";

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Trash2,
  ExternalLink,
  Loader2,
  Tag,
  FileText,
  X,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface ContentDetail {
  id: string;
  title: string;
  original_url: string | null;
  raw_text: string | null;
  category: string | null;
  created_at: string;
  card_slides: {
    id: string;
    slide_order: number;
    headline: string;
    description: string;
  }[];
  tags: { id: string; name: string }[];
}

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const toast = useToast();

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const contentRes = await fetch(`/api/admin/contents/${resolvedParams.id}`);

      if (!contentRes.ok) {
        toast.error('콘텐츠를 찾을 수 없습니다');
        router.push('/admin/contents');
        return;
      }

      const contentData = await contentRes.json();
      setContent(contentData);
    } catch (err) {
      console.error(err);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router, toast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleDelete = async () => {
    if (!confirm('이 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/contents/${resolvedParams.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('콘텐츠가 삭제되었습니다');
        router.push('/admin/contents');
      } else {
        toast.error('삭제에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contents"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">콘텐츠 상세</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(content.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${resolvedParams.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">보기</span>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">삭제</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-semibold text-slate-500 mb-2">
              제목
            </label>
            <h2 className="text-2xl font-bold text-slate-800">{content.title}</h2>
          </div>

          {/* Category */}
          {content.category && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-semibold text-slate-500 mb-2">
                카테고리
              </label>
              <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                {content.category}
              </span>
            </div>
          )}

          {/* Card Slides Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-700">카드 슬라이드 ({content.card_slides.length}개)</h3>
            </div>
            <div className="space-y-3">
              {content.card_slides.map((slide, index) => (
                <div key={slide.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800">{slide.headline}</h4>
                    <p className="text-sm text-slate-500 mt-1">{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Original URL/Text */}
          {(content.original_url || content.raw_text) && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">원본 정보</h3>
              {content.original_url && (
                <div className="mb-4">
                  <span className="text-sm text-slate-500">원본 URL:</span>
                  <a
                    href={content.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline truncate mt-1"
                  >
                    {content.original_url}
                  </a>
                </div>
              )}
              {content.raw_text && (
                <div>
                  <span className="text-sm text-slate-500">원본 텍스트:</span>
                  <p className="text-slate-600 mt-1 text-sm bg-slate-50 p-4 rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {content.raw_text}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-semibold text-slate-700">
                태그
              </label>
            </div>

            {content.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {content.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">태그가 없습니다</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">바로가기</h3>
            <div className="space-y-2">
              <Link
                href={`/${resolvedParams.id}`}
                target="_blank"
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">카드뉴스 보기</p>
                  <p className="text-xs text-slate-500">슬라이드 형태로 보기</p>
                </div>
              </Link>
              <Link
                href={`/${resolvedParams.id}/article`}
                target="_blank"
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">아티클 보기</p>
                  <p className="text-xs text-slate-500">상세 아티클 페이지</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
