/**
 * Web Speech API 语音合成工具
 * 兼容桌面端和移动端（iOS Safari / Android Chrome）
 */
import type { LanguageCode } from '../types';

const LANG_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

// 缓存已加载的语音列表
let cachedVoices: SpeechSynthesisVoice[] = [];

// 是否已初始化语音列表
let voicesInitialized = false;

// 获取语音列表（兼容各浏览器）
function getVoices(): SpeechSynthesisVoice[] {
  const synth = window.speechSynthesis;
  if (!synth) return [];

  // Chrome/Edge: voices 同步就绪
  if (synth.getVoices().length > 0) {
    return synth.getVoices();
  }
  return cachedVoices;
}

// 根据语言代码找到最优语音
function findBestVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = getVoices();
  if (!voices.length) return null;

  // 优先精确匹配（完整 BCP 47 标签，如 "en-US"）
  let voice = voices.find((v) => v.lang === langCode && !v.name.includes('Enhanced'));
  if (voice) return voice;

  // 其次前缀匹配（en-US, en-GB 都以 en 开头则可混用）
  const prefix = langCode.split('-')[0];
  voice = voices.find((v) => v.lang.startsWith(prefix + '-') && !v.name.includes('Enhanced'));
  if (voice) return voice;

  // 再降为任意前缀匹配
  voice = voices.find((v) => v.lang.startsWith(prefix));
  if (voice) return voice;

  // 兜底：返回列表第一个（避免完全无声）
  return voices[0] ?? null;
}

// 确保 iOS Safari 等平台已从暂停中恢复语音合成
function resumeIfNeeded(): Promise<void> {
  const synth = window.speechSynthesis;
  if (!synth) return Promise.resolve();

  // synth.suspended 是移动端 Safari/Chrome 的属性，TypeScript 默认类型未定义，需断言
  if ((synth as unknown as { suspended?: boolean }).suspended) {
    synth.resume();
  }
  return Promise.resolve();
}

/**
 * 朗读文本
 * @param text 要朗读的内容
 * @param language 语言代码 en | ja | ko
 */
export const speak = (text: string, language: LanguageCode): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('[Speech] 浏览器不支持语音合成');
      resolve();
      return;
    }

    const synth = window.speechSynthesis;
    const langCode = LANG_MAP[language] || 'en-US';

    // 取消所有正在排队/播放的语音（防止快速点击产生叠加）
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.85;   // 稍慢一点，移动端语音引擎更友好
    utterance.pitch = 1.0;
    utterance.volume = 1;

    // 尝试匹配高质量语音（移动端尤其重要）
    const voice = findBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // iOS Safari 有时会触发 "interrupted" 错误（由 cancel 引起），忽略即可
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[Speech] 朗读出错:', e.error);
      }
      resolve();
    };

    // iOS Safari / 部分 Android：必须确保从暂停中恢复
    resumeIfNeeded().then(() => {
      synth.speak(utterance);
    });
  });
};

/**
 * 停止当前朗读
 */
export const stop = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * 检查浏览器是否支持语音合成
 */
export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && !!window.speechSynthesis;

// ─── 初始化语音列表（整个模块只执行一次） ───────────────────────────────
function initVoices(): void {
  if (voicesInitialized) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  // Chrome: 语音列表在页面加载时就绪
  cachedVoices = Array.from(synth.getVoices());

  if (cachedVoices.length > 0) {
    voicesInitialized = true;
    return;
  }

  // Safari / 移动端: 语音列表异步加载，需要监听事件
  const onVoicesChanged = (): void => {
    cachedVoices = Array.from(synth.getVoices());
    voicesInitialized = true;
    synth.removeEventListener('voiceschanged', onVoicesChanged);
  };

  synth.addEventListener('voiceschanged', onVoicesChanged);

  // 部分浏览器 500ms 后仍未触发 voiceschanged，手动触发一次
  setTimeout(() => {
    if (!voicesInitialized) {
      cachedVoices = Array.from(synth.getVoices());
      voicesInitialized = true;
      synth.removeEventListener('voiceschanged', onVoicesChanged);
    }
  }, 800);
}

// 模块加载时立即初始化（桌面端尽早准备，移动端等待 voiceschanged）
if (typeof window !== 'undefined') {
  initVoices();
}
