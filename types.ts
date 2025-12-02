export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  verseCount: number;
  meaning: string;
}

export interface Verse {
  number: number;
  text: string;
  translation: string;
}

export interface SurahData {
  meta: SurahMeta;
  verses: Verse[];
}

export enum TafsirSource {
  IBN_KATHIR = "Tafsir Ibn Kathir (Classic Sunni)",
  JALALAYN = "Tafsir Al-Jalalayn (Concise)",
  AL_QURTUBI = "Tafsir Al-Qurtubi (Legal/Fiqh)",
  AS_SADI = "Tafsir As-Sa'di (Clear/Modern)",
  QURAISH_SHIHAB = "M. Quraish Shihab (Indonesian Context)",
  HAMKA = "Buya Hamka (Tafsir Al-Azhar)",
  SAYYID_QUTB = "Fi Zilal al-Quran (Literary/Social)",
  MAARIFUL_QURAN = "Ma'ariful Quran (Mufti Shafi Usmani)"
}

export interface TafsirResult {
  source: string;
  text: string;
  keyPoints: string[];
}

export interface ThematicVerseReference {
  surahName: string;
  verseNumber: number;
  text: string;
  translation: string;
  relevance: string; // How this verse relates to the theme
}

export interface ThematicResult {
  theme: string;
  introduction: string;
  verses: ThematicVerseReference[];
  explanation: string;
  conclusion: string;
  source: string;
}