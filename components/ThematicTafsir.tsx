import React, { useState } from 'react';
import { TafsirSource, ThematicResult } from '../types';
import { generateThematicTafsir } from '../services/geminiService';
import { Search, Sparkles, BookOpen, Loader2, Download, FileText, ChevronDown, Share2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PRESET_THEMES = [
  "Hari Kiamat (Eskatologi)",
  "Kebesaran Allah & Alam Semesta",
  "Surga dan Neraka",
  "Akhlak Mulia",
  "Anak Yatim & Fakir Miskin",
  "Kesabaran & Ujian",
  "Waktu & Masa",
  "Kisah Kaum Terdahulu"
];

export const ThematicTafsir: React.FC = () => {
  const [themeInput, setThemeInput] = useState("");
  const [selectedSource, setSelectedSource] = useState<TafsirSource>(TafsirSource.QURAISH_SHIHAB);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThematicResult | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (themeToUse: string) => {
    if (!themeToUse.trim()) return;
    
    setLoading(true);
    setResult(null);
    setThemeInput(themeToUse);

    try {
      const data = await generateThematicTafsir(themeToUse, selectedSource);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Gagal menghasilkan tafsir tematik. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const attributionText = "Digenerate oleh Kajian Tafsir Al-Qur'an AI yang dibuat dan digagas oleh Ustadz Liyas Syarifudin, M. Pd.";

  const handleShare = async () => {
    if (!result) return;

    const shareTitle = `Tafsir Tematik: ${result.theme}`;
    const shareText = `*${attributionText}*\n\n` +
      `*${shareTitle}*\n` +
      `Sumber: ${result.source}\n\n` +
      `*Pengantar:*\n${result.introduction}\n\n` +
      `*Kesimpulan:*\n${result.conclusion}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadDoc = () => {
    if (!result) return;

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Tafsir Tematik: ${result.theme}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
          .header { text-align: center; border-bottom: 3px solid #047857; padding-bottom: 15px; margin-bottom: 20px; }
          .attribution { font-size: 16pt; font-weight: bold; color: #047857; margin-bottom: 10px; text-transform: uppercase; }
          .title { font-size: 16pt; font-weight: bold; color: #333; margin-bottom: 5px; }
          .meta { color: #555; font-size: 10pt; }
          h2 { color: #065f46; font-size: 14pt; border-bottom: 1px solid #ddd; margin-top: 20px; }
          .verse-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 15px; border-radius: 5px; }
          .arabic { font-family: 'Traditional Arabic', serif; font-size: 18pt; text-align: right; margin-bottom: 5px; }
          .translation { font-style: italic; color: #333; }
          .relevance { font-size: 10pt; color: #047857; margin-top: 5px; font-weight: bold; }
          .content { text-align: justify; }
          .timestamp { margin-top: 30px; text-align: center; font-size: 9pt; color: #64748b; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="attribution">${attributionText}</div>
          <div class="title">Tafsir Tematik Al-Qur'an</div>
          <div class="meta">Tema: ${result.theme} | Sumber: ${result.source}</div>
        </div>

        <p><strong>Pengantar:</strong> ${result.introduction}</p>

        <h2>Ayat-Ayat Pilihan</h2>
        ${result.verses.map(v => `
          <div class="verse-box">
            <div class="arabic">${v.text}</div>
            <div class="translation">"${v.translation}" (${v.surahName}: ${v.verseNumber})</div>
            <div class="relevance">Relevansi: ${v.relevance}</div>
          </div>
        `).join('')}

        <h2>Penjelasan Tafsir</h2>
        <div class="content">${result.explanation.split('\n').map(p => `<p>${p}</p>`).join('')}</div>

        <h2>Kesimpulan</h2>
        <p>${result.conclusion}</p>

        <div class="timestamp">
           Dibuat pada: ${new Date().toLocaleDateString('id-ID')}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tafsir_Tematik_${result.theme.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setLoadingPdf(true);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.backgroundColor = 'white';
    container.style.padding = '20mm';
    
    container.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; color: #333;">
        <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="color: #047857; font-size: 18px; margin: 0 0 10px 0; font-weight: 800; text-transform: uppercase; line-height: 1.4;">${attributionText}</h1>
          <h2 style="color: #333; font-size: 16px; margin: 0; font-weight: bold;">Tafsir Tematik Al-Qur'an</h2>
          <p style="color: #64748b; margin: 5px 0;">Tema: <span style="color: #000; font-weight: 600;">${result.theme}</span></p>
        </div>

        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">Pengantar</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">${result.introduction}</p>
        </div>

        <h2 style="color: #059669; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px;">Ayat-Ayat Pilihan</h2>
        ${result.verses.map(v => `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
              <p style="font-family: 'Amiri', serif; font-size: 24px; text-align: right; margin: 0 0 10px 0; direction: rtl;">${v.text}</p>
              <p style="font-style: italic; color: #334155; font-size: 13px; margin: 0;">"${v.translation}"</p>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px;">
                <span style="font-weight: bold; color: #059669;">QS. ${v.surahName}: ${v.verseNumber}</span>
              </div>
            </div>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b; padding-left: 10px; border-left: 2px solid #cbd5e1;">
              <strong>Relevansi:</strong> ${v.relevance}
            </p>
          </div>
        `).join('')}

        <h2 style="color: #059669; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; margin-top: 25px;">Penjelasan Mendalam (${result.source})</h2>
        <div style="font-size: 14px; line-height: 1.6; text-align: justify; color: #334155;">
          ${result.explanation.split('\n').map(p => `<p style="margin-bottom: 10px;">${p}</p>`).join('')}
        </div>

        <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #92400e; font-size: 14px; margin: 0 0 5px 0;">Kesimpulan</h3>
          <p style="color: #78350f; font-size: 14px; margin: 0;">${result.conclusion}</p>
        </div>

        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="font-size: 10px; color: #cbd5e1; margin: 5px 0 0 0;">
            Dibuat pada: ${new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Tafsir_Tematik_${result.theme.replace(/\s+/g, '_')}.pdf`);
    } finally {
      document.body.removeChild(container);
      setLoadingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 -mt-10 relative z-20">
      
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="text-emerald-500" />
          Mulai Kajian Tematik
        </h2>
        
        {/* Source Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Sumber Kitab Tafsir</label>
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as TafsirSource)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.values(TafsirSource).map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
        </div>

        {/* Custom Search */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
            Tulis Tema Spesifik Anda
          </label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Contoh: Keadilan Sosial, Fenomena Alam, Adab Tetangga..."
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate(themeInput)}
              className="w-full pl-12 pr-24 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <button 
              onClick={() => handleGenerate(themeInput)}
              disabled={loading || !themeInput}
              className="absolute right-2 top-2 bottom-2 bg-emerald-600 text-white px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Buat"}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div>
          <p className="text-sm text-slate-500 mb-3">Atau pilih tema populer:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_THEMES.map(theme => (
              <button
                key={theme}
                onClick={() => handleGenerate(theme)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-100 hover:scale-105 transition-all border border-emerald-100"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Area */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700">Sedang Menyusun Materi...</h3>
          <p className="text-slate-400">AI sedang menelaah seluruh Al-Qur'an untuk tema ini.</p>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Action Bar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg text-slate-800">Hasil Kajian</h3>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium text-sm transition-colors"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                <span className="hidden sm:inline">{copied ? 'Disalin' : 'Share'}</span>
              </button>
              <button 
                onClick={handleDownloadDoc}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
              >
                <Download size={16} /> <span className="hidden sm:inline">Word</span>
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={loadingPdf}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
              >
                {loadingPdf ? <Loader2 size={16} className="animate-spin"/> : <FileText size={16} />} 
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-600 p-8 text-white text-center">
              <span className="inline-block px-3 py-1 bg-emerald-500/50 rounded-full text-xs font-semibold tracking-wider mb-2">TAFSIR TEMATIK</span>
              <h1 className="text-3xl font-bold font-arabic mb-2">{result.theme}</h1>
              <p className="opacity-90 max-w-2xl mx-auto">{result.introduction}</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Verses Grid */}
              <section>
                <h3 className="text-emerald-700 font-bold uppercase tracking-wider text-sm mb-4 border-b border-emerald-100 pb-2">
                  Ayat-Ayat Pilihan dalam Al-Qur'an
                </h3>
                <div className="grid gap-6">
                  {result.verses.map((verse, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-100 relative group hover:border-emerald-200 transition-colors">
                      <div className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                        QS. {verse.surahName}: {verse.verseNumber}
                      </div>
                      <div className="text-right mt-6 mb-4">
                        <p className="font-arabic text-2xl leading-loose text-slate-800 dir-rtl">{verse.text}</p>
                      </div>
                      <p className="text-slate-600 italic text-sm mb-3">"{verse.translation}"</p>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-sm text-slate-700">
                        <span className="font-semibold text-emerald-600">Relevansi: </span>
                        {verse.relevance}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Explanation */}
              <section>
                <h3 className="text-emerald-700 font-bold uppercase tracking-wider text-sm mb-4 border-b border-emerald-100 pb-2 flex items-center gap-2">
                  <BookOpen size={18} />
                  Penjelasan Mendalam ({result.source})
                </h3>
                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                   {result.explanation.split('\n').map((p, i) => (
                     <p key={i}>{p}</p>
                   ))}
                </div>
              </section>

              {/* Conclusion */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
                 <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                   <Sparkles size={18} /> Kesimpulan
                 </h3>
                 <p className="text-amber-900/80">{result.conclusion}</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};