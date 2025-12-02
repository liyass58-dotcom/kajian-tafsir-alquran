import React from 'react';
import { SurahMeta } from '../types';
import { BookOpen } from 'lucide-react';

interface SurahCardProps {
  surah: SurahMeta;
  onClick: (surah: SurahMeta) => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, onClick }) => {
  return (
    <div 
      onClick={() => onClick(surah)}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-emerald-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <BookOpen size={64} className="text-emerald-600" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-100 rotate-45 group-hover:rotate-0 transition-transform duration-300">
          <span className="-rotate-45 group-hover:rotate-0 transition-transform duration-300">{surah.number}</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">
            {surah.name}
          </h3>
          <p className="text-sm text-slate-500">{surah.englishName}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center text-xs text-slate-400 font-medium">
        <span className="bg-slate-100 px-2 py-1 rounded">{surah.meaning}</span>
        <span>{surah.verseCount} Ayat</span>
      </div>
    </div>
  );
};