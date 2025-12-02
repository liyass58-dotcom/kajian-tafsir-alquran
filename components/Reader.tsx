import React, { useEffect, useState, useRef } from 'react';
import { SurahMeta, SurahData, Verse } from '../types';
import { fetchSurahContent } from '../services/geminiService';
import { ArrowLeft, Loader2, BookOpenCheck, Type, Book } from 'lucide-react';

interface ReaderProps {
  surah: SurahMeta;
  onBack: () => void;
  onSelectVerse: (verse: Verse, surahName: string) => void;
}

export const Reader: React.FC<ReaderProps> = ({ surah, onBack, onSelectVerse }) => {
  const [data, setData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real app, we would cache this response
        const result = await fetchSurahContent(surah.number, surah.name, surah.verseCount);
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError("Gagal memuat surat. Silakan coba lagi.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadContent();
    return () => { isMounted = false; };
  }, [surah]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-emerald-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="animate-pulse font-medium">Memuat Surat {surah.name}...</p>
        <p className="text-xs text-slate-400 mt-2">Mengambil data ayat dari sumber terpercaya...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-red-500">
        <p className="text-lg font-semibold mb-4">{error}</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-700">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 py-4 border-b border-slate-200 mb-8 shadow-sm transition-all">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-lg md:text-xl font-bold text-slate-800">{surah.name}</h1>
            <p className="text-xs text-slate-500">{surah.meaning} • {surah.verseCount} Ayat</p>
          </div>

          <button 
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !showTranslation 
                ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
             {showTranslation ? <Book size={18} /> : <Type size={18} />}
             <span className="hidden md:inline">{showTranslation ? 'Mode Terjemah' : 'Mode Baca'}</span>
          </button>
        </div>
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div className="text-center mb-12 py-6">
          <p className="font-arabic text-3xl md:text-4xl text-slate-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
      )}

      {/* Verses List */}
      <div className={showTranslation ? "space-y-6" : "space-y-8"}>
        {data?.verses.map((verse) => (
          <div 
            key={verse.number} 
            className={`group relative transition-all duration-300 ${
              showTranslation 
                ? 'bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md' 
                : 'bg-transparent py-4 border-b border-slate-100/50 last:border-0'
            }`}
          >
            {/* Verse Number Badge */}
            <div className={`absolute ${showTranslation ? 'top-6 left-6' : 'top-4 left-0'} w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold font-arabic border border-emerald-200`}>
              {verse.number.toLocaleString('ar-EG')}
            </div>

            <div className={`flex flex-col gap-6 ${!showTranslation && 'items-center text-center'}`}>
              {/* Arabic Text */}
              <div className={`w-full ${showTranslation ? 'text-right pl-12 sm:pl-0' : 'px-4'}`}>
                <p className={`font-arabic text-slate-800 leading-[2.5] dir-rtl ${showTranslation ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl leading-[3] text-emerald-950'}`}>
                  {verse.text}
                </p>
              </div>

              {/* Translation & Actions */}
              {showTranslation && (
                <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <p className="text-slate-600 text-lg leading-relaxed font-light italic">
                    "{verse.translation}"
                  </p>
                  
                  <button
                    onClick={() => onSelectVerse(verse, surah.name)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 transition-colors text-sm font-medium self-start sm:self-center"
                  >
                    <BookOpenCheck size={16} />
                    <span>Lihat Tafsir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};