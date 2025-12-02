import { GoogleGenAI, Type } from "@google/genai";
import { SurahData, TafsirResult, TafsirSource, ThematicResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchSurahContent = async (surahNumber: number, surahName: string, verseCount: number): Promise<SurahData> => {
  if (!apiKey) throw new Error("API Key is missing");

  // We request structured data to ensure valid rendering
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Provide the full Arabic text and Indonesian translation for Surah ${surahNumber} (${surahName}).
    It has approximately ${verseCount} verses.
    Ensure strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  text: { type: Type.STRING, description: "Arabic text of the verse with tashkeel" },
                  translation: { type: Type.STRING, description: "Indonesian translation" },
                },
                required: ["number", "text", "translation"]
              }
            }
          },
          required: ["verses"]
        }
      }
    });

    const json = JSON.parse(response.text || '{"verses": []}');
    
    return {
      meta: {
        number: surahNumber,
        name: surahName,
        englishName: "", // Populated from constants in UI
        verseCount: verseCount,
        meaning: "" // Populated from constants in UI
      },
      verses: json.verses
    };
  } catch (error) {
    console.error("Error fetching Surah content:", error);
    throw error;
  }
};

export const fetchTafsir = async (
  surahName: string,
  verseNumber: number,
  verseText: string,
  source: TafsirSource
): Promise<TafsirResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  
  const prompt = `
    Bertindaklah sebagai ahli tafsir Al-Quran.
    Berikan penjelasan tafsir yang mendalam untuk:
    Surah: ${surahName}, Ayat: ${verseNumber}
    Bunyi Ayat: "${verseText}"
    
    Sumber Tafsir yang diminta: ${source}.
    
    Jika sumber spesifik tidak memiliki komentar langsung untuk ayat ini, sintetiskan pandangan umum dari mazhab pemikiran yang diwakili oleh sumber tersebut.
    Bahasa: Indonesia.
    Format output: JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Detailed comprehensive explanation (Tafsir)" },
            keyPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3-5 concise key takeaways or lessons from this verse"
            }
          },
          required: ["text", "keyPoints"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');

    return {
      source,
      text: json.text,
      keyPoints: json.keyPoints || []
    };
  } catch (error) {
    console.error("Error fetching Tafsir:", error);
    throw error;
  }
};

export const generateThematicTafsir = async (
  theme: string,
  source: TafsirSource
): Promise<ThematicResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";

  const prompt = `
    Anda adalah asisten studi Al-Quran yang ahli.
    Tugas: Buatlah kajian Tafsir Tematik (Maudhu'i) tentang tema: "${theme}".
    Batasan: Gunakan ayat-ayat dari seluruh Al-Qur'an (Surah 1 s.d. 114) yang paling relevan.
    Sumber Rujukan: ${source}.
    
    Instruksi:
    1. Pilih 3-5 ayat paling relevan dari Al-Qur'an yang membahas tema ini.
    2. Jelaskan kaitan ayat tersebut dengan tema.
    3. Buat sintesis tafsir yang menghubungkan ayat-ayat tersebut menjadi satu pemahaman utuh.
    4. Bahasa: Indonesia yang akademis namun mudah dipahami untuk ceramah.

    Format JSON:
    - theme: Judul tema
    - introduction: Pengantar singkat tentang tema ini dalam konteks Al-Qur'an.
    - verses: Array berisi ayat-ayat relevan (surahName, verseNumber, text (Arabic), translation, relevance).
    - explanation: Penjelasan tafsir mendalam (paragraf panjang).
    - conclusion: Kesimpulan utama atau pesan moral.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            introduction: { type: Type.STRING },
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  surahName: { type: Type.STRING },
                  verseNumber: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  relevance: { type: Type.STRING, description: "Why this verse fits the theme" }
                }
              }
            },
            explanation: { type: Type.STRING },
            conclusion: { type: Type.STRING }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');

    return {
      theme: json.theme,
      introduction: json.introduction,
      verses: json.verses || [],
      explanation: json.explanation,
      conclusion: json.conclusion,
      source: source
    };

  } catch (error) {
    console.error("Error fetching Thematic Tafsir:", error);
    throw error;
  }
};