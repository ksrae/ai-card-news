"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Home } from "lucide-react";
import Link from 'next/link';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<any>(null);

  const idStr = params?.id as string;

  useEffect(() => {
    if (!idStr) return;
    fetch(`/api/contents/${idStr}`)
      .then(res => res.json())
      .then(data => setContent(data));
  }, [idStr]);

  if (!content) return null; // or loading

  const article = content.full_article || {};

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <nav className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 hover:text-black">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Card View</span>
        </button>
        <Link href="/" className="p-2 text-gray-400 hover:text-black">
          <Home className="w-6 h-6" />
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto p-6 md:p-12 bg-white mt-6 rounded-3xl shadow-sm">
        <div className="mb-8">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
            {content.category || "Article"}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            {article.title || content.title}
          </h1>
          <p className="text-xl text-gray-500 font-serif italic mb-8 border-l-4 border-blue-500 pl-4 py-1">
            {article.meta_description}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          {article.sections && article.sections.map((section: any, idx: number) => (
            <div key={idx} className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{section.sub_title}</h3>
              <p className="whitespace-pre-line leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {article.tags && (
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
