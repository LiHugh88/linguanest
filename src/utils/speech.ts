/**
 * Web Speech API 语音合成工具
 *
 * 已知兼容性问题及处理策略：
 * - iOS Safari: 语音暂停(suspended)，需 resume()
 * - Android Chrome: voiceschanged 可能不触发 → 改用轮询等待
 * - 语音列表异步加载 → speak() 内部主动等待 voices 就绪
 */
import type { LanguageCode } from '../types';

const LANG_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

/** 等待语音列表加载，最多等待 ms 毫秒后强制使用默认值 */
function waitForVoices(maxWaitMs = 3000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) {
      resolve([]);
      return;
    }

    const tryGet = (): SpeechSynthesisVoice[] => {
      try {
        return Array.from(synth.getVoices());
      } catch {
        return [];
      }
    };

    const voices = tryGet();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // voiceschanged 触发时立即返回
    const onVoicesChanged = (): void => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(tryGet());
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);

    // Android Chrome: 轮询等待（voiceschanged 可能不触发）
    let waited = 0;
    const interval = setInterval(() => {
      waited += 100;
      const v = tryGet();
      if (v.length > 0) {
        clearInterval(interval);
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(v);
        return;
      }
      if (waited >= maxWaitMs) {
        clearInterval(interval);
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(v); // 强制返回（即使为空，让 speak 继续用 lang 属性）
      }
    }, 100);
  });
}

/** 根据语言代码选择最优语音 */
function findBestVoice(
  langCode: string,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const prefix = langCode.split('-')[0];

  // 1. 精确匹配（"ja-JP" == "ja-JP"）
  const exact = voices.find(
    (v) => v.lang === langCode && !v.name.includes('Enhanced')
  );
  if (exact) return exact;

  // 2. 前缀匹配变体（如 "ja-JP", "ja-KY" 都以 "ja-" 开头）
  const variant = voices.find(
    (v) => v.lang.startsWith(prefix + '-') && !v.name.includes('Enhanced')
  );
  if (variant) return variant;

  // 3. 任意前缀匹配（如 "en-AU"）
  const any = voices.find((v) => v.lang.startsWith(prefix));
  if (any) return any;

  // 4. 兜底：返回列表第一个
  return voices[0] ?? null;
}

/** 确保 iOS Safari / Android Chrome 从暂停中恢复 */
function resumeAudioContext(): void {
  const synth = window.speechSynthesis;
  if (!synth) return;

  try {
    // suspended 属性在部分浏览器中可能不存在，用 try/catch 安全访问
    if ((synth as unknown as { suspended?: boolean }).suspended) {
      synth.resume();
    }
  } catch {
    // ignore
  }
}

/**
 * 朗读文本（异步，等待语音加载完成后执行朗读）
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

    // 1. 取消之前所有语音
    synth.cancel();

    // 2. 立即执行 resume（iOS/Android 需要）
    resumeAudioContext();

    // 3. 等待语音就绪后创建 utterance
    waitForVoices(3000).then((voices) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // 设置语言（最重要，浏览器会根据此属性自动选择语音）
      utterance.lang = langCode;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      // 尝试匹配更精确的语音（若 voices 已加载）
      const voice = findBestVoice(langCode, voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // 使用 voice 的实际 lang 标签
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // 忽略 cancel/interrupted（由 synth.cancel() 主动触发）
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[Speech] 朗读出错:', e.error);
        }
        resolve();
      };

      // 4. 最终 resume + 朗读
      resumeAudioContext();
      synth.speak(utterance);
    });
  });
};

/** 停止当前朗读 */
export const stop = (): void => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/** 检查是否支持语音合成 */
export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && !!window.speechSynthesis;
