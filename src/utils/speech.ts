/**
 * 语音合成工具 - 混合方案
 *
 * 优先级：
 *   1. 云端 TTS 音频（优先，支持所有设备，包括华为/荣耀等没有系统语音包的安卓）
 *      - 由服务器端 Python 代理请求百度翻译 TTS，返回 mp3 音频
 *   2. Web Speech API（系统语音）- 仅作为桌面端备用方案
 *
 * 说明：之前的方案（只用 Web Speech API）在很多国产安卓手机上无法工作
 *       因为这些手机出厂时没有安装英语/日语/韩语的系统 TTS 语音包
 */
import type { LanguageCode } from '../types';

/** 语言代码映射（百度翻译 TTS） */
const BAIDU_LANG_MAP: Record<LanguageCode, string> = {
  en: 'en',
  ja: 'jp',
  ko: 'kor',
};

/** 检测当前设备是否是手机 / 平板 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** 检测是否支持 Web Speech API 并且有目标语音 */
function hasWebSpeechSupport(language: LanguageCode): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return false;
    return voices.some((v) => v.lang.toLowerCase().startsWith(language));
  } catch {
    return false;
  }
}

/**
 * 云端 TTS 音频播放（主方案）
 * 通过服务器的 Python 代理请求百度翻译 TTS，支持所有浏览器/设备
 * URL: /api/tts/?lan=en&text=hello&spd=3
 */
function speakWithCloudTTS(text: string, language: LanguageCode): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!text) { resolve(); return; }

    const lan = BAIDU_LANG_MAP[language] || 'en';
    const url = `/api/tts/?lan=${encodeURIComponent(lan)}&text=${encodeURIComponent(text)}&spd=3`;

    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.warn('[Speech] 云端 TTS 播放失败:', e);
        reject(new Error('cloud_tts_failed'));
      };

      // 移动端 autoplay 限制：必须在用户交互内触发 play()
      // speak() 被调用的时机通常是在按钮点击/卡片翻转，所以应该能满足
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          console.warn('[Speech] audio.play() 被拒绝（可能不是用户交互触发）:', err);
          reject(err);
        });
      }
    } catch (err) {
      console.warn('[Speech] Audio 创建失败:', err);
      reject(err);
    }
  });
}

/**
 * Web Speech API 朗读（备用方案，桌面端用）
 */
function speakWithWebSpeech(text: string, language: LanguageCode): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    if (!synth) { reject(new Error('no_speech_api')); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // 匹配最佳语音
    try {
      const voices = synth.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(language));
      if (voice) utterance.voice = voice;
    } catch { /* ignore */ }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn('[Speech] Web Speech API 失败:', e);
      reject(e);
    };

    try {
      // 从暂停恢复（iOS Safari 需要）
      if ((synth as unknown as { suspended?: boolean }).suspended) synth.resume();
    } catch { /* ignore */ }

    synth.cancel();
    synth.speak(utterance);
  });
}

/**
 * 统一的朗读入口
 *
 * 策略：
 *   - 手机端: 优先使用云端 TTS（解决国产安卓无语音包问题）
 *   - 桌面端: 优先使用 Web Speech API（音质更好，免费）
 *   - 任何方案失败: 自动切换到另一方案
 */
export const speak = async (text: string, language: LanguageCode): Promise<void> => {
  if (!text) return;

  const mobile = isMobileDevice();

  // 手机端：先尝试云端 TTS（主方案），失败降级到 Web Speech
  if (mobile) {
    try {
      await speakWithCloudTTS(text, language);
      return;
    } catch {
      // 云端失败，尝试系统语音
      if (hasWebSpeechSupport(language)) {
        try { await speakWithWebSpeech(text, language); return; } catch { /* ignore */ }
      }
      // 两个方案都失败，静默失败（用户体验：无声但不崩溃）
      console.warn('[Speech] 所有朗读方案均失败');
    }
  }

  // 桌面端：先尝试 Web Speech（音质佳），失败降级到云端 TTS
  else {
    if (hasWebSpeechSupport(language)) {
      try { await speakWithWebSpeech(text, language); return; } catch { /* ignore，继续尝试云端 */ }
    }
    try {
      await speakWithCloudTTS(text, language);
    } catch (e) {
      console.warn('[Speech] 所有朗读方案均失败:', e);
    }
  }
};

/** 停止朗读 */
export const stop = (): void => {
  if (typeof window !== 'undefined') {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch { /* ignore */ }
  }
};

/** 是否支持朗读（始终返回 true — 云端 TTS 只要有网络就可用） */
export const isSpeechSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  // 有 Audio 或 speechSynthesis 任一即视为支持
  return typeof Audio !== 'undefined' || !!window.speechSynthesis;
};
