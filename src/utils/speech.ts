// Web Speech API 语音合成工具
import type { LanguageCode } from '../types';

const LANG_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export const speak = (text: string, language: LanguageCode): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }
    // 清理可能堆积的语音
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[language] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && !!window.speechSynthesis;
