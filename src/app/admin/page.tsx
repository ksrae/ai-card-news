"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Tags,
  TrendingUp,
  Clock,
  Database,
  PlusCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalContents: number;
  totalTags: number;
  remainingToday: number;
  dailyLimit: number;
  dbConnected: boolean;
  recentContents: {
    id: string;
    title: string;
    created_at: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const remainingToday = stats?.remainingToday ?? 0;
  const dailyLimit = stats?.dailyLimit ?? 3;

  const statCards = [
    {
      label: '전체 콘텐츠',
      value: stats?.totalContents || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-200',
    },
    {
      label: '남은 생성 횟수',
      value: `${remainingToday}/${dailyLimit}`,
      icon: Zap,
      color: remainingToday > 0 ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500',
      shadowColor: remainingToday > 0 ? 'shadow-amber-200' : 'shadow-slate-200',
    },
    {
      label: '태그',
      value: stats?.totalTags || 0,
      icon: Tags,
      color: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-200',
    },
    {
      label: 'DB 상태',
      value: stats?.dbConnected ? '연결됨' : '오류',
      icon: Database,
      color: stats?.dbConnected ? 'from-teal-500 to-teal-600' : 'from-red-500 to-red-600',
      shadowColor: stats?.dbConnected ? 'shadow-teal-200' : 'shadow-red-200',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">대시보드</h1>
        <p className="text-slate-500 mt-1">콘텐츠 현황을 한눈에 확인하세요</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-lg ${stat.shadowColor} border border-slate-100 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Link
          href="/admin/create"
          className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg">새 콘텐츠 생성</h3>
            <p className="text-blue-100 text-sm">AI로 카드뉴스 생성하기</p>
          </div>
          <ArrowRight className="w-6 h-6 ml-auto" />
        </Link>

        <Link
          href="/admin/contents"
          className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">콘텐츠 관리</h3>
            <p className="text-slate-500 text-sm">전체 콘텐츠 목록 보기</p>
          </div>
          <ArrowRight className="w-6 h-6 ml-auto text-slate-400" />
        </Link>

        <Link
          href="/admin/tags"
          className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
            <Tags className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">태그 관리</h3>
            <p className="text-slate-500 text-sm">태그를 추가하고 관리하기</p>
          </div>
          <ArrowRight className="w-6 h-6 ml-auto text-slate-400" />
        </Link>
      </div>

      {/* Recent Contents */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800">최근 콘텐츠</h2>
          <Link href="/admin/contents" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            전체 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recentContents && stats.recentContents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recentContents.map((content) => (
              <Link
                key={content.id}
                href={`/admin/contents/${content.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate">{content.title}</h4>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(content.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">아직 생성된 콘텐츠가 없습니다</p>
            <Link href="/admin/create" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              첫 번째 콘텐츠 만들기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
