"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Newspaper, X, Trash2, Search } from "lucide-react";

interface ContentSummary {
  id: string;
  title: string;
  category: string;
  created_at: string;
  tags: string[];
}

interface TagItem {
  id: string;
  name: string;
  count: number;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [contents, setContents] = useState<ContentSummary[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchContents = useCallback(async (pageNum: number, tag: string | null, search: string = '', reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({ page: pageNum.toString() });
      if (tag) params.set('tag', tag);
      if (search) params.set('search', search);

      const res = await fetch(`/api/contents?${params}`);
      const data = await res.json();

      if (reset) {
        setContents(data.contents || []);
      } else {
        setContents(prev => [...prev, ...(data.contents || [])]);
      }
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (Array.isArray(data)) setTags(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Sync URL tag param
  useEffect(() => {
    const urlTag = searchParams.get('tag');
    if (urlTag !== selectedTag) {
      setSelectedTag(urlTag);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch on filter changes
  useEffect(() => {
    setPage(1);
    fetchContents(1, selectedTag, debouncedSearch, true);
  }, [selectedTag, debouncedSearch, fetchContents]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchContents(nextPage, selectedTag, debouncedSearch);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, selectedTag, debouncedSearch, fetchContents]);

  const handleTagClick = (tagName: string) => {
    setSelectedTag(prev => prev === tagName ? null : tagName);
  };

  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`"${title}" 콘텐츠를 삭제하시겠습니까?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/contents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContents(prev => prev.filter(c => c.id !== id));
        // Refresh tags count
        fetchTags();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
          <Newspaper className="text-blue-600 w-6 h-6" />
          AI Card News
        </Link>
        <Link
          href="/create"
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="Create New Content"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Latest Updates</h1>
          <p className="text-gray-500">Explore AI-generated card news and summaries</p>
        </header>

        {/* Search Bar - shown when contents exist */}
        {(contents.length > 0 || searchQuery || selectedTag) && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요 (제목 또는 태그)"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                #{selectedTag}
                <X className="w-4 h-4" />
              </button>
            )}
            {tags.filter(t => t.name !== selectedTag).map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                #{tag.name} <span className="opacity-50">({tag.count})</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : contents.length === 0 ? (
          <section className="animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-blue-100 border border-blue-50/50 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl shadow-lg shadow-blue-200 mb-8 transform hover:rotate-6 transition-transform">
                  <Newspaper className="text-white w-10 h-10" />
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                  복잡한 정보를<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">한눈에 들어오는 카드뉴스</span>로
                </h2>

                <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Upstage Solar Pro AI가 긴 글이나 URL의 핵심을 파악하여
                  세련된 슬라이드와 실용적인 요약 아티클로 변환해 드립니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                  {[
                    { title: "초고속 요약", desc: "AI가 단시간에 핵심만 골라냅니다.", icon: "⚡" },
                    { title: "디자인 자동화", desc: "슬라이드 레이아웃을 즉시 생성합니다.", icon: "🎨" },
                    { title: "상세 분석", desc: "심도 깊은 요약 기사까지 함께 제공합니다.", icon: "📝" }
                  ].map((feature, i) => (
                    <div key={i} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-200"
                >
                  지금 시작하기
                  <Settings className="w-5 h-5 animate-spin" />
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((item) => (
                <div key={item.id} className="relative group/card">
                  <Link href={`/${item.id}`} className="block cursor-pointer">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all h-full flex flex-col">
                      <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                        <span className="text-4xl">📰</span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">{item.category || "General"}</span>
                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover/card:text-blue-600 transition-colors">{item.title}</h2>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">#{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, item.id, item.title)}
                    disabled={deleting === item.id}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-500 text-gray-400 hover:text-white rounded-full shadow-md opacity-0 group-hover/card:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    title="삭제"
                  >
                    {deleting === item.id ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-20 flex items-center justify-center">
              {loadingMore && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              )}
              {!hasMore && contents.length > 0 && (
                <p className="text-gray-400 text-sm">모든 뉴스를 불러왔습니다</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
