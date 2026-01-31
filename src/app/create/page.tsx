"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/components/ToastProvider";

export default function CreatePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) return;

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
      // Redirect to the newly created content or home
      router.push(`/${result.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="p-4 flex items-center border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <span className="font-bold text-lg">Create New</span>
      </nav>

      <div className="max-w-3xl mx-auto p-8 pt-12">
        <h1 className="text-3xl font-bold mb-8">What do you want to create?</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setInputType('text')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center border ${inputType === 'text' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
          >
            Text
          </button>
          <button
            onClick={() => setInputType('url')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all text-center border ${inputType === 'url' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
          >
            URL
          </button>
        </div>

        <div className="relative mb-8">
          {inputType === 'text' ? (
            <textarea
              className="w-full h-60 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none transition-all text-lg"
              placeholder="Paste your content here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          ) : (
            <input
              type="text"
              className="w-full p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-lg"
              placeholder="https://example.com/article..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Generating...
            </>
          ) : (
            'Generate Cards & Article'
          )}
        </button>
      </div>
    </div>
  );
}
