"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface TagItem {
  id: string;
  name: string;
  count: number;
}

export default function TagsManagementPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (Array.isArray(data)) setTags(data);
    } catch (err) {
      console.error(err);
      toast.error('태그를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    if (!newTagName.trim()) {
      toast.error('태그 이름을 입력해주세요');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.reused) {
          toast.info(`유사한 태그 "${data.name}"이(가) 이미 존재하여 재활용됩니다`);
        } else {
          toast.success('태그가 생성되었습니다');
        }
        setNewTagName('');
        fetchTags();
      } else {
        toast.error(data.error || '태그 생성에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error('태그 이름을 입력해주세요');
      return;
    }

    // Check for duplicate (excluding current tag)
    if (tags.some(t => t.id !== id && t.name.toLowerCase() === editingName.trim().toLowerCase())) {
      toast.error('이미 존재하는 태그입니다');
      return;
    }

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() })
      });

      if (res.ok) {
        toast.success('태그가 수정되었습니다');
        setEditingId(null);
        fetchTags();
      } else {
        toast.error('태그 수정에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다');
    }
  };

  const handleDelete = async (id: string, name: string, count: number) => {
    const message = count > 0
      ? `"${name}" 태그를 삭제하시겠습니까? 이 태그가 연결된 ${count}개의 콘텐츠에서 제거됩니다.`
      : `"${name}" 태그를 삭제하시겠습니까?`;

    if (!confirm(message)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('태그가 삭제되었습니다');
        setTags(prev => prev.filter(t => t.id !== id));
      } else {
        toast.error('태그 삭제에 실패했습니다');
      }
    } catch (err) {
      console.error(err);
      toast.error('오류가 발생했습니다');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (tag: TagItem) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">태그 관리</h1>
        <p className="text-slate-500 mt-1">콘텐츠에 사용되는 태그를 관리합니다</p>
      </header>

      {/* Create New Tag */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          새 태그 추가
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="태그 이름 입력..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newTagName.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            추가
          </button>
        </div>
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-400" />
            전체 태그 ({tags.length}개)
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : tags.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">태그가 없습니다</p>
            <p className="text-slate-400 text-sm mt-1">위 입력란에서 새 태그를 추가해보세요</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>

                {editingId === tag.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit(tag.id)}
                      autoFocus
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleEdit(tag.id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium text-slate-800">#{tag.name}</span>
                      <span className="ml-3 text-sm text-slate-400">
                        {tag.count}개 콘텐츠
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(tag)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name, tag.count)}
                        disabled={deletingId === tag.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="삭제"
                      >
                        {deletingId === tag.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
