/**
 * Web Speech API 语音合成工具
 *
 * 兼容性设计原则：
 * - 桌面 Chrome: voices 同步就绪，直接使用
 * - Android Chrome: voices 异步加载，轮询 + voiceschanged 双保险
 * - iOS Safari: 语音处于 suspended 状态，需 resume()
 * - 所有平台: 以 lang 属性为主，voice 对象为辅
 */
import type { LanguageCode } from '../types';

const LANG_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

/** 诊断信息（生产环境可查看控制台） */
function debug(tag: string, msg: string, data?: unknown): void {
  console.debug(`[Speech][${tag}] ${msg}`, data ?? '');
}

/** 获取 speechSynthesis 实例（做 null 安全） */
function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis ?? null;
}

/**
 * 等待语音列表就绪（最多等待 ms）
 * 策略: 同步获取 → voiceschanged 事件 → 轮询兜底
 */
function waitForVoices(maxWaitMs = 4000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = getSynth();
    if (!synth) {
      debug('waitForVoices', 'speechSynthesis 不可用');
      resolve([]);
      return;
    }

    debug('waitForVoices', '开始获取语音列表...');

    // 尝试直接获取
    const tryGetVoices = (): SpeechSynthesisVoice[] => {
      try {
        const v = synth!.getVoices();
        return Array.isArray(v) ? Array.from(v) : [];
      } catch {
        return [];
      }
    };

    // 同步获取成功 → 立即返回
    const immediate = tryGetVoices();
    debug('waitForVoices', `同步获取到 ${immediate.length} 个语音`, immediate.slice(0, 3));
    if (immediate.length > 0) {
      resolve(immediate);
      return;
    }

    // 注册 voiceschanged 事件
    let voicesChangedFired = false;
    const onVoicesChanged = (): void => {
      voicesChangedFired = true;
      synth!.removeEventListener('voiceschanged', onVoicesChanged);
      const voices = tryGetVoices();
      debug('waitForVoices', `voiceschanged 触发，获取到 ${voices.length} 个语音`, voices.slice(0, 3));
      resolve(voices);
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);

    // 轮询兜底（部分 Android Chrome 不触发 voiceschanged）
    let waited = 0;
    const poll = setInterval(() => {
      waited += 200;
      const voices = tryGetVoices();

      if (voices.length > 0) {
        clearInterval(poll);
        if (!voicesChangedFired) {
          synth.removeEventListener('voiceschanged', onVoicesChanged);
          debug('waitForVoices', `轮询获取到 ${voices.length} 个语音（voiceschanged 未触发）`);
        }
        resolve(voices);
        return;
      }

      if (waited >= maxWaitMs) {
        clearInterval(poll);
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        debug('waitForVoices', `超时，返回空列表（已等待 ${waited}ms）`);
        resolve([]); // 超时也返回，让 speak 继续依赖 lang 属性
      }
    }, 200);
  });
}

/**
 * 根据语言代码选择最优语音
 * 策略: 精确匹配 → 前缀匹配 → 任意匹配 → 兜底
 */
function findBestVoice(
  langCode: string,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const prefix = langCode.split('-')[0];
  debug('findBestVoice', `langCode=${langCode}, voices总数=${voices.length}`);

  const exact = voices.find((v) => v.lang === langCode);
  if (exact) { debug('findBestVoice', `精确匹配: ${exact.name} (${exact.lang})`); return exact; }

  const variant = voices.find((v) => v.lang.startsWith(prefix + '-'));
  if (variant) { debug('findBestVoice', `变体匹配: ${variant.name} (${variant.lang})`); return variant; }

  const any = voices.find((v) => v.lang.startsWith(prefix));
  if (any) { debug('findBestVoice', `任意匹配: ${any.name} (${any.lang})`); return any; }

  debug('findBestVoice', '未找到匹配语音，使用浏览器默认');
  return voices[0] ?? null;
}

/**
 * 确保音频引擎处于可播放状态
 * iOS Safari / 部分 Android Chrome 需要此步骤
 */
function ensureAudioReady(): void {
  const synth = getSynth();
  if (!synth) return;

  try {
    // paused: 调用 pause() 后变为 true，需要 resume()
    if (synth.paused) {
      debug('ensureAudioReady', '检测到 paused=true，调用 resume()');
      synth.resume();
    }
    // suspended: AudioContext 级别的暂停（iOS Safari）
    const isSuspended = (synth as unknown as Record<string, unknown>).suspended === true;
    if (isSuspended) {
      debug('ensureAudioReady', '检测到 suspended=true，调用 resume()');
      synth.resume();
    }
  } catch (e) {
    debug('ensureAudioReady', 'resume 异常（可忽略）', e);
  }
}

/**
 * 朗读文本
 */
export const speak = (text: string, language: LanguageCode): Promise<void> => {
  return new Promise((resolve) => {
    const synth = getSynth();

    if (!synth) {
      debug('speak', `不可用，语言=${language}，文本="${text}"`);
      resolve();
      return;
    }

    const langCode = LANG_MAP[language] || 'en-US';
    debug('speak', `▶ 开始，语言=${langCode}，文本="${text}"`);
    debug('speak', `synth.speaking=${synth.speaking}, synth.pending=${synth.pending}`);

    // 1. 取消所有排队中的语音
    synth.cancel();
    debug('speak', 'cancel() 完成');

    // 2. 确保音频引擎就绪
    ensureAudioReady();

    // 3. 等待语音列表就绪
    waitForVoices(4000).then((voices) => {
      debug('speak', `voices就绪=${voices.length}个，开始创建utterance`);

      // 创建 utterance（核心对象）
      const utterance = new SpeechSynthesisUtterance(text);

      // 设置语言属性（最重要，浏览器以此为首选匹配依据）
      utterance.lang = langCode;
      utterance.rate = 1.0;   // 使用默认速率，避免部分浏览器对非标准速率的兼容问题
      utterance.pitch = 1.0;
      utterance.volume = 1;

      // 尝试匹配语音对象（辅助提升质量，但非必须）
      const voice = findBestVoice(langCode, voices);
      if (voice) {
        utterance.voice = voice;
        // 若找到精确语音，使用其 lang 标签（某些浏览器 voice.lang 与 langCode 格式略有差异）
        utterance.lang = voice.lang;
        debug('speak', `使用语音: ${voice.name} (${voice.lang})`);
      } else {
        // 没有找到语音时，强制重置 lang 为目标语言
        utterance.lang = langCode;
        debug('speak', `无匹配语音，使用浏览器默认合成器，语言=${langCode}`);
      }

      // 事件处理
      utterance.onstart = () => debug('speak', '✅ onstart - 开始朗读');
      utterance.onend = () => { debug('speak', '✅ onend - 朗读结束'); resolve(); };
      utterance.onerror = (e) => {
        // "canceled"/"interrupted" 来自 cancel()，不算错误
        if (e.error === 'canceled' || e.error === 'interrupted') {
          debug('speak', `⚠️ ${e.error}（正常）`);
        } else {
          console.warn('[Speech] 朗读出错:', e.error);
        }
        resolve();
      };
      utterance.onboundary = () => debug('speak', 'onboundary');

      // 4. 最终确保就绪后再朗读
      ensureAudioReady();
      synth.speak(utterance);
      debug('speak', `speak() 调用完成，pending=${synth.pending}, speaking=${synth.speaking}`);
    });
  });
};

/** 停止朗读 */
export const stop = (): void => {
  const synth = getSynth();
  if (synth) {
    synth.cancel();
    debug('stop', '停止朗读');
  }
};

/** 检查是否支持 */
export const isSpeechSupported = (): boolean => !!getSynth();

/** 测试指定语言是否有可用语音 */
export async function probeVoice(language: LanguageCode): Promise<{
  supported: boolean;
  voiceCount: number;
  bestVoice: string | null;
}> {
  const synth = getSynth();
  if (!synth) return { supported: false, voiceCount: 0, bestVoice: null };

  const voices = await waitForVoices(2000);
  const langCode = LANG_MAP[language] || 'en-US';
  const voice = findBestVoice(langCode, voices);

  return {
    supported: synth.getVoices !== undefined,
    voiceCount: voices.length,
    bestVoice: voice ? `${voice.name} (${voice.lang})` : null,
  };
}
