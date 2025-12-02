import React, { useState, useEffect } from 'react';
import { TafsirSource, TafsirResult, Verse } from '../types';
import { fetchTafsir } from '../services/geminiService';
import { X, Loader2, Sparkles, Book, ChevronDown, Download, FileText, Share2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface TafsirPanelProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse | null;
  surahName: string;
}

export const TafsirPanel: React.FC<TafsirPanelProps> = ({ isOpen, onClose, verse, surahName }) => {
  const [selectedSource, setSelectedSource] = useState<TafsirSource>(TafsirSource.IBN_KATHIR);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [result, setResult] = useState<TafsirResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset when verse changes or panel opens
  useEffect(() => {
    if (isOpen && verse) {
      handleFetchTafsir(selectedSource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, verse]);

  const handleFetchTafsir = async (source: TafsirSource) => {
    if (!verse) return;
    setLoading(true);
    setResult(null);
    setSelectedSource(source); // Update UI immediately

    try {
      const data = await fetchTafsir(surahName, verse.number, verse.text, source);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const attributionText = "Digenerate oleh Kajian Tafsir Al-Qur'an AI yang dibuat dan digagas oleh Ustadz Liyas Syarifudin, M. Pd.";

  const handleShare = async () => {
    if (!result || !verse) return;

    const shareTitle = `Tafsir ${surahName} Ayat ${verse.number}`;
    const shareText = `*${attributionText}*\n\n` +
      `*${shareTitle}*\n\n` +
      `${verse.text}\n` +
      `_"${verse.translation}"_\n\n` +
      `*Penjelasan (${result.source}):*\n` +
      `${result.text.substring(0, 500)}${result.text.length > 500 ? '...' : ''}\n\n` +
      `*Hikmah:*\n` +
      result.keyPoints.map(p => `• ${p}`).join('\n');

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
      // Fallback for desktop
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadDoc = () => {
    if (!result || !verse) return;

    // Create an HTML structure compatible with Word
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Materi Tafsir ${surahName} Ayat ${verse.number}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #047857; padding-bottom: 15px; }
          .attribution { font-size: 16pt; font-weight: bold; color: #047857; margin-bottom: 10px; text-transform: uppercase; }
          .title { font-size: 14pt; font-weight: bold; color: #333; margin-bottom: 5px; }
          .subtitle { font-size: 11pt; color: #555; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 13pt; font-weight: bold; color: #065f46; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 10px; margin-top: 15px; }
          .arabic-box { background-color: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 5px; text-align: right; margin-bottom: 10px; }
          .arabic { font-family: 'Traditional Arabic', 'Amiri', sans-serif; font-size: 24pt; direction: rtl; color: #000; line-height: 2; }
          .translation { font-style: italic; color: #334155; margin-bottom: 5px; display: block; }
          .source-badge { background-color: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; display: inline-block; margin-bottom: 10px; border: 1px solid #a7f3d0; }
          .content-text { text-align: justify; }
          .hikmah-list { background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 5px; }
          .timestamp { font-size: 9pt; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="attribution">${attributionText}</div>
          <div class="title">Materi Tafsir & Ceramah</div>
          <div class="subtitle">Kajian Tafsir Al-Qur'an Global</div>
        </div>

        <div class="section">
          <div class="section-title">Ayat Pilihan</div>
          <div class="arabic-box">
            <div class="arabic">${verse.text}</div>
          </div>
          <p class="translation"><strong>Artinya:</strong> "${verse.translation}"</p>
          <p style="font-size: 10pt; color: #666;">(${surahName}: ${verse.number})</p>
        </div>

        <div class="section">
          <div class="section-title">Penjelasan Tafsir</div>
          <div class="source-badge">Sumber: ${result.source}</div>
          <div class="content-text">
            ${result.text.split('\n').map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>

        ${result.keyPoints.length > 0 ? `
        <div class="section">
          <div class="section-title">Poin Hikmah (Untuk Disampaikan)</div>
          <div class="hikmah-list">
            <ul>
              ${result.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        <div class="timestamp">
          Dokumen ini dihasilkan oleh AI berdasarkan referensi kitab tafsir.<br>
          Dibuat pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </body>
      </html>
    `;

    // Create Blob and trigger download
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create safe filename
    const safeSurah = surahName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `Materi_Ceramah_${safeSurah}_Ayat_${verse.number}.doc`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!result || !verse) return;
    setLoadingPdf(true);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.backgroundColor = 'white';
    container.style.padding = '20mm';
    container.style.boxSizing = 'border-box';
    
    container.innerHTML = `
      <div style="font-family: 'Inter', sans-serif; color: #333;">
        <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #047857; font-size: 18px; margin: 0 0 10px 0; font-weight: 800; text-transform: uppercase; line-height: 1.4;">${attributionText}</h1>
          <h2 style="color: #333; font-size: 16px; margin: 0; font-weight: bold;">Materi Tafsir & Ceramah</h2>
          <p style="color: #666; margin: 5px 0 0 0;">Kajian Tafsir Al-Qur'an Global</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #065f46; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-weight: bold;">Ayat Pilihan</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: right; margin: 10px 0; border: 1px solid #e2e8f0;">
            <p style="font-family: 'Amiri', serif; font-size: 32px; line-height: 2; margin: 0; direction: rtl; color: black;">${verse.text}</p>
          </div>
          <p style="font-style: italic; color: #475569; margin: 10px 0;">"${verse.translation}"</p>
          <p style="font-size: 12px; color: #94a3b8;">(${surahName}: ${verse.number})</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #065f46; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-weight: bold;">Penjelasan Tafsir</h2>
          <span style="background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #a7f3d0; display: inline-block; margin-bottom: 8px;">Sumber: ${result.source}</span>
          <div style="margin-top: 10px; font-size: 14px; line-height: 1.6; text-align: justify; color: #334155;">
             ${result.text.split('\n').map(p => `<p style="margin-bottom: 10px;">${p}</p>`).join('')}
          </div>
        </div>

        ${result.keyPoints.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #065f46; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-weight: bold;">Poin Hikmah</h2>
          <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px;">
            <ul style="margin: 0; padding-left: 20px; color: #78350f;">
              ${result.keyPoints.map(point => `<li style="margin-bottom: 5px; font-size: 14px;">${point}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="font-size: 10px; color: #cbd5e1; margin: 5px 0 0 0;">
            Dokumen ini dihasilkan oleh AI berdasarkan referensi kitab tafsir.<br>
            Dibuat pada: ${new Date().toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2, 
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; 
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const safeSurah = surahName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`Materi_Ceramah_${safeSurah}_Ayat_${verse.number}.pdf`);
      
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Gagal mengekspor PDF. Silakan coba lagi.");
    } finally {
      document.body.removeChild(container);
      setLoadingPdf(false);
    }
  };

  if (!isOpen || !verse) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tafsir & Tadabbur</h2>
            <p className="text-sm text-slate-500">{surahName}: Ayat {verse.number}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 space-y-6">
            
            {/* Verse Context */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-arabic text-2xl text-right text-slate-800 mb-3 leading-loose">{verse.text}</p>
              <p className="text-slate-600 italic">"{verse.translation}"</p>
            </div>

            {/* Source Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Pilih Sumber Tafsir
              </label>
              <div className="relative">
                <select
                  value={selectedSource}
                  onChange={(e) => handleFetchTafsir(e.target.value as TafsirSource)}
                  className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  disabled={loading}
                >
                  {Object.values(TafsirSource).map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-3 text-emerald-500" size={32} />
                <p>Sedang menelaah kitab tafsir...</p>
              </div>
            )}

            {/* Result */}
            {!loading && result && (
              <div className="space-y-6 animate-in fade-in duration-500">
                
                {/* Action Bar: Download Buttons */}
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm font-medium text-sm group"
                  >
                    {copied ? (
                      <Check size={16} className="text-white" />
                    ) : (
                      <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>{copied ? 'Disalin' : 'Share'}</span>
                  </button>
                  <button
                    onClick={handleDownloadDoc}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm font-medium text-sm group"
                  >
                    <Download size={16} className="group-hover:scale-110 transition-transform" />
                    <span>Word</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={loadingPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm font-medium text-sm group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingPdf ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileText size={16} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>PDF</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-emerald-50/50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
                    <Book size={18} className="text-emerald-600" />
                    <h3 className="font-semibold text-emerald-900">Penjelasan ({result.source})</h3>
                  </div>
                  <div className="p-5 prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {result.text}
                    </p>
                  </div>
                </div>

                {/* Key Points */}
                {result.keyPoints.length > 0 && (
                  <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                    <div className="flex items-center gap-2 mb-3 text-amber-800 font-semibold">
                      <Sparkles size={18} />
                      <h3>Poin Utama (Hikmah)</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-amber-900/80 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 bg-amber-200/50 rounded-full flex items-center justify-center text-xs font-bold text-amber-800">
                            {idx + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Konten dihasilkan oleh AI berdasarkan referensi kitab tafsir.
            Mohon merujuk ke ulama untuk fatwa hukum.
          </p>
        </div>
      </div>
    </div>
  );
};