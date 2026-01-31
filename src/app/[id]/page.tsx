"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const idStr = params?.id as string;

  useEffect(() => {
    if (!idStr) return;
    fetch(`/api/contents/${idStr}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setContent(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [idStr]);

  const goToSlide = (index: number) => {
    if (!content || !content.card_slides || isAnimating) return;
    if (index < 0) index = 0;
    if (index >= content.card_slides.length) index = content.card_slides.length - 1;
    if (index === currentSlide) return;

    setSlideDirection(index > currentSlide ? 'right' : 'left');
    setIsAnimating(true);
    setCurrentSlide(index);

    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleSlideClick = () => {
    router.push(`/${idStr}/article`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contents/${idStr}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("뉴스가 삭제되었습니다.");
        router.push('/');
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch (e) {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;
  if (!content) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Content not found.</div>;

  const slides = content.card_slides || [];

  // Different gradient backgrounds for each slide
  const slideGradients = [
    'from-indigo-600 to-purple-700',
    'from-rose-500 to-orange-500',
    'from-emerald-500 to-teal-600',
    'from-blue-600 to-cyan-500',
    'from-violet-600 to-fuchsia-600',
    'from-amber-500 to-pink-500',
    'from-sky-500 to-indigo-600',
    'from-pink-500 to-rose-600',
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-10">
        <Link href="/" className="text-white/70 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-white/50 hover:text-red-500 transition-colors"
          title="삭제"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">정말 삭제하시겠습니까?</h3>
            <p className="text-gray-500 mb-6">이 작업은 되돌릴 수 없습니다. 카드뉴스와 상세 내용이 모두 삭제됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative w-full max-w-lg aspect-[3/5] md:aspect-[3/4]" style={{ perspective: '1200px' }}>
        {/* All Slides - stacked */}
        {slides.map((slide: any, idx: number) => {
          const isActive = idx === currentSlide;
          const isPrev = idx === currentSlide - 1;
          const isNext = idx === currentSlide + 1;
          const isVisible = isActive || isPrev || isNext;
          const gradient = slideGradients[idx % slideGradients.length];

          if (!isVisible) return null;

          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full bg-gradient-to-br ${gradient} rounded-3xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out`}
              onClick={isActive ? handleSlideClick : undefined}
              style={{
                transform: isActive
                  ? 'translateX(0) rotateY(0deg) scale(1)'
                  : isPrev
                    ? 'translateX(-75%) rotateY(20deg) scale(0.7)'
                    : 'translateX(75%) rotateY(-20deg) scale(0.7)',
                opacity: isActive ? 1 : 0.25,
                zIndex: isActive ? 10 : 5,
                pointerEvents: isActive ? 'auto' : 'none',
                filter: isActive ? 'none' : 'blur(3px) grayscale(0.3)',
              }}
            >
              {/* Content of Slide */}
              <div className="p-8 h-full flex flex-col justify-center text-white">
                <div className="text-sm font-bold opacity-60 mb-4 tracking-wider">
                  SLIDE {slide.slide_order} / {slides.length}
                </div>
                <h2 className="text-3xl font-extrabold mb-6 leading-tight">
                  {slide.headline}
                </h2>
                <p className="text-lg opacity-90 leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* Navigation Buttons */}
        <button
          className="absolute top-1/2 -left-16 -translate-y-1/2 text-white/50 hover:text-white transition-colors disabled:opacity-20"
          onClick={(e) => { e.stopPropagation(); goToSlide(currentSlide - 1); }}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-12 h-12" />
        </button>
        <button
          className="absolute top-1/2 -right-16 -translate-y-1/2 text-white/50 hover:text-white transition-colors disabled:opacity-20"
          onClick={(e) => { e.stopPropagation(); goToSlide(currentSlide + 1); }}
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className="w-12 h-12" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-8 flex gap-2">
        {slides.map((_: any, idx: number) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all hover:bg-white/60 ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/30 w-2'}`}
          />
        ))}
      </div>
    </div>
  );
}
