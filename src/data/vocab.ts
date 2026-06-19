import type { VocabItem } from '../types';

export const vocabItems: VocabItem[] = [
  // 英语
  { id: 'en-v1', courseId: 'en-a1-01', word: 'Hello', phonetic: '/həˈloʊ/', meaning: '你好', example: 'Hello, nice to meet you!', exampleTranslation: '你好，很高兴认识你！', language: 'en' },
  { id: 'en-v2', courseId: 'en-a1-01', word: 'Goodbye', phonetic: '/ɡʊdˈbaɪ/', meaning: '再见', example: 'Goodbye, see you tomorrow!', exampleTranslation: '再见，明天见！', language: 'en' },
  { id: 'en-v3', courseId: 'en-a1-01', word: 'Thank you', phonetic: '/θæŋk juː/', meaning: '谢谢', example: 'Thank you very much for your help.', exampleTranslation: '非常感谢你的帮助。', language: 'en' },
  { id: 'en-v4', courseId: 'en-a1-01', word: 'Morning', phonetic: '/ˈmɔːrnɪŋ/', meaning: '早晨', example: 'Good morning, everyone!', exampleTranslation: '大家早上好！', language: 'en' },
  { id: 'en-v5', courseId: 'en-a1-01', word: 'Friend', phonetic: '/frend/', meaning: '朋友', example: 'She is my best friend.', exampleTranslation: '她是我最好的朋友。', language: 'en' },
  { id: 'en-v6', courseId: 'en-a2-01', word: 'Coffee', phonetic: '/ˈkɔːfi/', meaning: '咖啡', example: 'I would like a cup of coffee, please.', exampleTranslation: '请给我一杯咖啡。', language: 'en' },
  { id: 'en-v7', courseId: 'en-a2-01', word: 'Menu', phonetic: '/ˈmenjuː/', meaning: '菜单', example: 'Can I see the menu?', exampleTranslation: '我可以看一下菜单吗？', language: 'en' },
  { id: 'en-v8', courseId: 'en-b1-01', word: 'Opinion', phonetic: '/əˈpɪnjən/', meaning: '观点', example: 'In my opinion, this is the best choice.', exampleTranslation: '在我看来，这是最好的选择。', language: 'en' },
  { id: 'en-v9', courseId: 'en-b1-01', word: 'Excellent', phonetic: '/ˈeksələnt/', meaning: '极好的', example: 'Your presentation was excellent!', exampleTranslation: '你的演讲非常棒！', language: 'en' },
  { id: 'en-v10', courseId: 'en-b2-01', word: 'Negotiate', phonetic: '/nɪˈɡoʊʃieɪt/', meaning: '谈判，协商', example: 'We need to negotiate the contract terms.', exampleTranslation: '我们需要协商合同条款。', language: 'en' },

  // 日语
  { id: 'ja-v1', courseId: 'ja-a1-01', word: 'こんにちは', phonetic: 'kon-ni-chi-wa', meaning: '你好', example: 'こんにちは、田中さん。', exampleTranslation: '你好，田中先生。', language: 'ja' },
  { id: 'ja-v2', courseId: 'ja-a1-01', word: 'ありがとう', phonetic: 'a-ri-ga-tō', meaning: '谢谢', example: 'ありがとうございます。', exampleTranslation: '非常感谢。', language: 'ja' },
  { id: 'ja-v3', courseId: 'ja-a1-01', word: 'はい', phonetic: 'hai', meaning: '是的', example: 'はい、そうです。', exampleTranslation: '是的，没错。', language: 'ja' },
  { id: 'ja-v4', courseId: 'ja-a1-01', word: 'いいえ', phonetic: 'ii-e', meaning: '不是', example: 'いいえ、違います。', exampleTranslation: '不，不是的。', language: 'ja' },
  { id: 'ja-v5', courseId: 'ja-a1-01', word: 'すみません', phonetic: 'su-mi-ma-sen', meaning: '对不起/不好意思', example: 'すみません、トイレはどこですか。', exampleTranslation: '不好意思，请问洗手间在哪里？', language: 'ja' },
  { id: 'ja-v6', courseId: 'ja-a2-01', word: '食べる', phonetic: 'ta-be-ru', meaning: '吃', example: '朝ごはんを食べます。', exampleTranslation: '我吃早餐。', language: 'ja' },
  { id: 'ja-v7', courseId: 'ja-a2-01', word: '飲む', phonetic: 'no-mu', meaning: '喝', example: 'コーヒーを飲みます。', exampleTranslation: '我喝咖啡。', language: 'ja' },
  { id: 'ja-v8', courseId: 'ja-b1-01', word: '思う', phonetic: 'o-mo-u', meaning: '认为，想', example: '私はそう思います。', exampleTranslation: '我是这么认为的。', language: 'ja' },
  { id: 'ja-v9', courseId: 'ja-b2-01', word: '承知いたしました', phonetic: 'shō-chi-i-ta-shi-ma-shi-ta', meaning: '我明白了（敬语）', example: '承知いたしました。', exampleTranslation: '我明白了/收到。', language: 'ja' },

  // 韩语
  { id: 'ko-v1', courseId: 'ko-a1-01', word: '안녕하세요', phonetic: 'an-nyeong-ha-se-yo', meaning: '你好（敬语）', example: '안녕하세요, 만나서 반갑습니다.', exampleTranslation: '你好，很高兴见到你。', language: 'ko' },
  { id: 'ko-v2', courseId: 'ko-a1-01', word: '감사합니다', phonetic: 'gam-sa-ham-ni-da', meaning: '谢谢（敬语）', example: '정말 감사합니다!', exampleTranslation: '真的非常感谢！', language: 'ko' },
  { id: 'ko-v3', courseId: 'ko-a1-01', word: '네', phonetic: 'ne', meaning: '是的', example: '네, 맞아요.', exampleTranslation: '是的，没错。', language: 'ko' },
  { id: 'ko-v4', courseId: 'ko-a1-01', word: '아니요', phonetic: 'a-ni-yo', meaning: '不是', example: '아니요, 제가 아니에요.', exampleTranslation: '不，不是我。', language: 'ko' },
  { id: 'ko-v5', courseId: 'ko-a2-01', word: '먹다', phonetic: 'meok-da', meaning: '吃', example: '밥을 먹어요.', exampleTranslation: '我在吃饭。', language: 'ko' },
  { id: 'ko-v6', courseId: 'ko-a2-01', word: '마시다', phonetic: 'ma-si-da', meaning: '喝', example: '커피를 마셔요.', exampleTranslation: '我在喝咖啡。', language: 'ko' },
  { id: 'ko-v7', courseId: 'ko-b1-01', word: '생각하다', phonetic: 'saeng-gak-ha-da', meaning: '认为，想', example: '저도 그렇게 생각해요.', exampleTranslation: '我也这么认为。', language: 'ko' },
  { id: 'ko-v8', courseId: 'ko-b2-01', word: '그러나', phonetic: 'geu-reo-na', meaning: '但是，然而', example: '좋은 생각이에요. 그러나 문제가 있어요.', exampleTranslation: '这是个好想法。但是有个问题。', language: 'ko' },
];
