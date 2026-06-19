/**
 * 语音合成工具 — 混合方案
 *
 * 策略优先级：
 *   1. Web Speech API（若系统安装了对应语言语音包，质量最佳）
 *   2. 百度翻译 TTS 音频（国内可用，支持英/日/韩多语言，mp3 直接播放）
 *   3. Google Translate TTS 音频（全球可用，mp3 直接播放）
 *
 * 说明：华为/荣耀/小米等国产安卓默认没有安装多语言语音包，
 *       第 1 步往往失败，此时自动降级到云端 TTS 音频播放。
 */
import type { LanguageCode } from '../types';

/** 映射目标语言到百度/Google 使用的 lang 代码 */
const BAIDU_MAP: Record<LanguageCode, string> = {
  en: 'en',
  ja: 'jp',   // 百度用 'jp' 表示日语
  ko: 'kor',  // 百度用 'kor' 表示韩语
};

const GOOGLE_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

/** 用 Audio 元素播放 mp3 音频（支持所有浏览器，包括国产安卓） */
function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    // autoplay policy: audio.play() 返回一个 promise
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('音频加载失败'));
    audio.play().catch((err) => {
      // iOS/Android 第一次 play 可能因 autoplay policy 被拦截
      // — 在用户点击时调用 play 即可，这里只是兜底提示
      console.warn('[Speech] audio.play() 失败:', err);
      reject(err);
    });
  });
}

/**
 * 使用百度翻译 TTS — 返回 mp3 音频的 URL
 * 参考：https://fanyi.baidu.com/gettts?lan=kor&text=안녕하세요&spd=3&source=web
 */
function getBaiduTtsUrl(text: string, language: LanguageCode): string {
  const lan = BAIDU_MAP[language];
  const encoded = encodeURIComponent(text);
  return `https://fanyi.baidu.com/gettts?lan=${lan}&text=${encoded}&spd=3&source=web`;
}

/**
 * 使用 Google Translate TTS — 返回 mp3 音频的 URL
 */
function getGoogleTtsUrl(text: string, language: LanguageCode): string {
  const tl = GOOGLE_MAP[language];
  const encoded = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encoded}&tl=${tl}`;
}

/**
 * 检测当前设备是否有可用的系统语音（用于 Web Speech API）
 */
function hasSystemVoice(language: LanguageCode): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  const prefix = language; // 'en' | 'ja' | 'ko'
  try {
    const voices = window.speechSynthesis.getVoices();
    // 检查是否存在匹配的语音（精确匹配 → 前缀匹配）
    return voices.some(
      (v) => v.lang === GOOGLE_MAP[language] || v.lang.startsWith(prefix)
    );
  } catch {
    return false;
  }
}

/**
 * 使用 Web Speech API 朗读（仅在系统有语音包时调用）
 */
function speakWithWebSpeech(text: string, language: LanguageCode): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    if (!synth) { reject(new Error('不支持')); return; }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = GOOGLE_MAP[language];
    utter.rate = 0.9;
    utter.pitch = 1.0;

    // 尝试指定语音
    try {
      const voices = synth.getVoices();
      const voice = voices.find(
        (v) => v.lang === GOOGLE_MAP[language] || v.lang.startsWith(language)
      );
      if (voice) utter.voice = voice;
    } catch { /* ignore */ }

    utter.onend = () => resolve();
    utter.onerror = (e) => reject(e);

    // 从暂停恢复
    try {
      if ((synth as unknown as { suspended?: boolean }).suspended) synth.resume();
    } catch { /* ignore */ }

    synth.cancel();
    synth.speak(utter);
  });
}

/**
 * 统一的朗读入口：先尝试系统语音 → 失败则用百度 TTS → 再失败用 Google TTS
 */
export const speak = (text: string, language: LanguageCode): Promise<void> => {
  // 1) 有系统语音 → 用 Web Speech API
  if (hasSystemVoice(language)) {
    return speakWithWebSpeech(text, language).catch(() =>
      // 系统语音失败，回退到云端 TTS
      speakWithCloudTts(text, language)
    );
  }

  // 2) 无系统语音 → 直接用云端 TTS
  return speakWithCloudTts(text, language);
};

/**
 * 云端 TTS 朗读：百度 → Google
 */
function speakWithCloudTts(text: string, language: LanguageCode): Promise<void> {
  // 先试百度（国内可用）
  return playAudio(getBaiduTtsUrl(text, language)).catch((err1) => {
    console.warn('[Speech] 百度TTS 失败，尝试 Google TTS:', err1?.message ?? err1);
    // 失败后试 Google
    return playAudio(getGoogleTtsUrl(text, language)).catch((err2) => {
      console.warn('[Speech] Google TTS 也失败:', err2?.message ?? err2);
      throw new Error('语音播放失败，请检查网络');
    });
  });
}

/**
 * 停止当前朗读
 */
export const stop = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }
};

/**
 * 检查 Web Speech API 是否可用
 */
export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && !!window.speechSynthesis;

/**
 * 诊断工具：返回当前设备的语音配置信息
 */
export interface SpeechDiagResult {
  webApi: boolean;                 // Web Speech API 是否存在
  systemVoices: { lang: string; name: string }[]; // 已安装的系统语音
  hasEnVoice: boolean;
  hasJaVoice: boolean;
  hasKoVoice: boolean;
  cloudTtsAvailable: boolean;       // 云端 TTS 音频（始终 true，有网络即可用）
}

export function diagnoseVoices(): SpeechDiagResult {
  const result: SpeechDiagResult = {
    webApi: typeof window !== 'undefined' && !!window.speechSynthesis,
    systemVoices: [],
    hasEnVoice: false,
    hasJaVoice: false,
    hasKoVoice: false,
    cloudTtsAvailable: true, // 云端 TTS 不依赖系统语音包，有网络即可用
  };

  if (result.webApi) {
    try {
      const voices = window.speechSynthesis.getVoices();
      result.systemVoices = voices.map((v) => ({ lang: v.lang, name: v.name }));
      result.hasEnVoice = voices.some((v) => v.lang.startsWith('en'));
      result.hasJaVoice = voices.some((v) => v.lang.startsWith('ja'));
      result.hasKoVoice = voices.some((v) => v.lang.startsWith('ko'));
    } catch { /* ignore */ }
  }

  return result;
}
