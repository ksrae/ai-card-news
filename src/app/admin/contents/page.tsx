"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Trash2,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface ContentItem {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  tags: string[];
}

export default function ContentsManagementPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const toast = useToast();

  const PAGE_SIZE = 10;

  const fetchContents = useCallback(async (pageNum: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/contents?${params}`);
      const data = await res.json();

      setContents(data.contents || []);
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
      toast.error('콘텐츠를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch on filter/page change
  useEffect(() => {
    setPage(1);
    fetchContents(1, debouncedSearch);
  }, [debouncedSearch, fetchContents]);

  // Fetch on page change
  useEffect(() => {
    fetchContents(page, debouncedSearch);
  }, [page, debouncedSearch, fetchContents]);

  const handleSelectAll = () => {
    if (selectedIds.size === contents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contents.map(c => c.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 콘텐츠를 삭제하시겠습니까?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/contents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContents(prev => prev.filter(c => c.id !== id));
        setTotal(prev => prev - 1);
        toast.success('콘텐츠가 삭제되었습니다');
      } else {
        toast.error('삭제에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      toast.error('삭제 중 오류가 발생했습니다');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개의 콘텐츠를 삭제하시겠습니까?`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/contents/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setContents(prev => prev.filter(c => !selectedIds.has(c.id)));
        setTotal(prev => prev - selectedIds.size);
        setSelectedIds(new Set());
        toast.success(`${selectedIds.size}개의 콘텐츠가 삭제되었습니다`);
      } else {
        toast.error('일괄 삭제에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      toast.error('삭제 중 오류가 발생했습니다');
    } finally {
      setBulkDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">콘텐츠 관리</h1>
        <p className="text-slate-500 mt-1">전체 콘텐츠를 조회하고 관리합니다</p>
      </header>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목 또는 태그로 검색..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-600">
              {selectedIds.size}개 선택됨
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {bulkDeleting ? '삭제 중...' : '선택 삭제'}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : contents.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">콘텐츠가 없습니다</p>
            <Link href="/admin/create" className="text-blue-600 hover:underline mt-2 inline-block">
              새 콘텐츠 만들기
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === contents.length && contents.length > 0}
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">제목</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">카테고리</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">태그</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">생성일</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contents.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelect(item.id)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/contents/${item.id}`} className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                            {item.category}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-xs text-slate-400">+{item.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/contents/${item.id}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="상세보기"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deleting === item.id}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="삭제"
                          >
                            {deleting === item.id ? (
                              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/${item.id}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="사이트에서 보기"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                총 {total}개 중 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)}개 표시
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  {page} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasMore}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
