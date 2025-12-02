import React, { useState } from 'react';
import { ALL_SURAHS } from './constants';
import { SurahCard } from './components/SurahCard';
import { Reader } from './components/Reader';
import { TafsirPanel } from './components/TafsirPanel';
import { ThematicTafsir } from './components/ThematicTafsir';
import { SurahMeta, Verse } from './types';
import { Search, BookOpen, LayoutGrid, LibraryBig } from 'lucide-react';

type AppMode = 'surah' | 'theme';

export default function App() {
  const [mode, setMode] = useState<AppMode>('surah');
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tafsir Modal State
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const filteredSurahs = ALL_SURAHS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  const handleOpenTafsir = (verse: Verse, surahName: string) => {
    setSelectedVerse(verse);
    setIsTafsirOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      <div className="flex-grow">
        {/* Reader State (Full Screen Override) */}
        {selectedSurah ? (
          <Reader 
            surah={selectedSurah} 
            onBack={() => setSelectedSurah(null)} 
            onSelectVerse={handleOpenTafsir}
          />
        ) : (
          <>
            {/* Hero Header */}
            <header className="bg-emerald-600 text-white pb-24 pt-8 px-4 relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                 <BookOpen size={400} />
              </div>
              
              <div className="max-w-4xl mx-auto relative z-10">
                {/* App Title */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold font-arabic mb-3">Kajian Tafsir Al-Qur'an</h1>
                    <p className="text-white font-bold text-lg md:text-xl mb-2 tracking-wide opacity-95">
                      Developed @2025 by Liyas Syarifudin, M.Pd.
                    </p>
                    <p className="text-emerald-100 text-sm md:text-base font-light">Eksplorasi makna Al-Quran dengan Kecerdasan Buatan (AI)</p>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex p-1 bg-emerald-700/50 backdrop-blur-sm rounded-xl mb-6 w-full md:w-fit">
                  <button 
                    onClick={() => setMode('surah')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === 'surah' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-emerald-100 hover:bg-emerald-600/50'
                    }`}
                  >
                    <LayoutGrid size={18} />
                    <span>Indeks Surat</span>
                  </button>
                  <button 
                    onClick={() => setMode('theme')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === 'theme' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-emerald-100 hover:bg-emerald-600/50'
                    }`}
                  >
                    <LibraryBig size={18} />
                    <span>Tafsir Tematik</span>
                  </button>
                </div>

                {/* Conditional Search Bar for Surah Mode */}
                {mode === 'surah' && (
                  <div className="relative max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <input 
                      type="text" 
                      placeholder="Cari surat (Contoh: Al-Baqarah atau 2)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border-0 text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/30 outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                )}
              </div>
            </header>

            {/* Main Content */}
            {mode === 'surah' ? (
              <main className="max-w-4xl mx-auto px-4 -mt-10 pb-20 relative z-20 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSurahs.map((surah) => (
                    <SurahCard 
                      key={surah.number} 
                      surah={surah} 
                      onClick={setSelectedSurah} 
                    />
                  ))}
                </div>
                
                {filteredSurahs.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                    <p>Tidak ada surat yang cocok dengan pencarian Anda.</p>
                  </div>
                )}
              </main>
            ) : (
              <ThematicTafsir />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 bg-slate-100 border-t border-slate-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs">
            © 2025 Kajian Tafsir Al-Qur'an AI
          </p>
        </div>
      </footer>

      {/* Tafsir Slide-over (For Reader Mode) */}
      <TafsirPanel 
        isOpen={isTafsirOpen}
        onClose={() => setIsTafsirOpen(false)}
        verse={selectedVerse}
        surahName={selectedSurah?.name || ''}
      />
    </div>
  );
}