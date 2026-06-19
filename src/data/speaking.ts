import type { SpeakingItem } from '../types';

export const speakingItems: SpeakingItem[] = [
  // 英语
  { id: 'en-s1', courseId: 'en-a1-01', sentence: 'Hello, my name is Alex.', translation: '你好，我的名字是 Alex。', phonetic: 'həˈloʊ, maɪ neɪm ɪz ˈæleks', language: 'en' },
  { id: 'en-s2', courseId: 'en-a1-01', sentence: 'Nice to meet you.', translation: '很高兴见到你。', phonetic: 'naɪs tə miːt juː', language: 'en' },
  { id: 'en-s3', courseId: 'en-a2-01', sentence: 'I would like a cup of coffee, please.', translation: '请给我一杯咖啡。', phonetic: 'aɪ wʊd laɪk ə kʌp əv ˈkɔːfi', language: 'en' },
  { id: 'en-s4', courseId: 'en-b1-01', sentence: 'In my opinion, this is a great idea.', translation: '在我看来，这是个很棒的想法。', phonetic: 'ɪn maɪ əˈpɪnjən', language: 'en' },
  { id: 'en-s5', courseId: 'en-b2-01', sentence: 'Let me summarize our discussion today.', translation: '让我总结一下我们今天的讨论。', phonetic: 'let mi ˈsʌməraɪz', language: 'en' },

  // 日语
  { id: 'ja-s1', courseId: 'ja-a1-01', sentence: 'はじめまして、よろしくおねがいします。', translation: '初次见面，请多多关照。', phonetic: 'ha-ji-me-ma-shi-te', language: 'ja' },
  { id: 'ja-s2', courseId: 'ja-a1-01', sentence: '私は学生です。', translation: '我是学生。', phonetic: 'wa-ta-shi-wa ga-ku-sei-de-su', language: 'ja' },
  { id: 'ja-s3', courseId: 'ja-a2-01', sentence: 'コーヒーを一つください。', translation: '请给我一杯咖啡。', phonetic: 'kō-hi-wo hi-to-tsu ku-da-sa-i', language: 'ja' },
  { id: 'ja-s4', courseId: 'ja-b1-01', sentence: '私はそう思います。', translation: '我是这么认为的。', phonetic: 'wa-ta-shi-wa sō-o-mo-i-ma-su', language: 'ja' },
  { id: 'ja-s5', courseId: 'ja-b2-01', sentence: '承知いたしました。', translation: '我明白了（敬语）。', phonetic: 'shō-chi-i-ta-shi-ma-shi-ta', language: 'ja' },

  // 韩语
  { id: 'ko-s1', courseId: 'ko-a1-01', sentence: '안녕하세요, 만나서 반갑습니다.', translation: '你好，很高兴见到你。', phonetic: 'an-nyeong-ha-se-yo', language: 'ko' },
  { id: 'ko-s2', courseId: 'ko-a1-01', sentence: '저는 학생입니다.', translation: '我是学生。', phonetic: 'jeo-neun hak-saeng-im-ni-da', language: 'ko' },
  { id: 'ko-s3', courseId: 'ko-a2-01', sentence: '커피 한 잔 주세요.', translation: '请给我一杯咖啡。', phonetic: 'keo-pi han jan ju-se-yo', language: 'ko' },
  { id: 'ko-s4', courseId: 'ko-b1-01', sentence: '저도 그렇게 생각해요.', translation: '我也这么认为。', phonetic: 'jeo-do geu-reo-ke saeng-gak-hae-yo', language: 'ko' },
  { id: 'ko-s5', courseId: 'ko-b2-01', sentence: '제가 준비하겠습니다.', translation: '我来准备吧（敬语）。', phonetic: 'je-ga jun-bi-ha-gess-seum-ni-da', language: 'ko' },
];
