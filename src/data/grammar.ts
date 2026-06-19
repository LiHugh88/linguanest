import type { GrammarQuestion } from '../types';

export const grammarQuestions: GrammarQuestion[] = [
  // 英语
  { id: 'en-g1', courseId: 'en-a1-01', question: 'She ___ a teacher.', options: ['is', 'are', 'am', 'be'], correctIndex: 0, explanation: '第三人称单数 (she) 使用 is。', language: 'en' },
  { id: 'en-g2', courseId: 'en-a1-01', question: 'I ___ from China.', options: ['is', 'are', 'am', 'be'], correctIndex: 2, explanation: '第一人称单数 (I) 使用 am。', language: 'en' },
  { id: 'en-g3', courseId: 'en-a1-01', question: 'They ___ students.', options: ['is', 'are', 'am', 'be'], correctIndex: 1, explanation: '复数 (They) 使用 are。', language: 'en' },
  { id: 'en-g4', courseId: 'en-a2-01', question: 'I usually ___ coffee in the morning.', options: ['drink', 'drinks', 'drank', 'drinking'], correctIndex: 0, explanation: '一般现在时，第一人称用原形 drink。', language: 'en' },
  { id: 'en-g5', courseId: 'en-a2-01', question: 'She ___ to work every day.', options: ['go', 'goes', 'went', 'going'], correctIndex: 1, explanation: '第三人称单数在一般现在时时，动词加 s/es。', language: 'en' },
  { id: 'en-g6', courseId: 'en-b1-01', question: 'If I ___ rich, I would travel the world.', options: ['am', 'was', 'were', 'be'], correctIndex: 2, explanation: '虚拟语气中，if 从句用 were（不论人称）。', language: 'en' },
  { id: 'en-g7', courseId: 'en-b2-01', question: 'The project ___ by the end of next month.', options: ['will finish', 'will be finished', 'is finishing', 'has finished'], correctIndex: 1, explanation: '将来时被动语态，"项目被完成"。', language: 'en' },

  // 日语
  { id: 'ja-g1', courseId: 'ja-a1-01', question: '私___学生です。', options: ['は', 'が', 'を', 'に'], correctIndex: 0, explanation: 'は 用于提示主题，"我是学生"。', language: 'ja' },
  { id: 'ja-g2', courseId: 'ja-a1-01', question: 'これ___本です。', options: ['は', 'が', 'を', 'に'], correctIndex: 0, explanation: 'は 提示主题，"这是书"。', language: 'ja' },
  { id: 'ja-g3', courseId: 'ja-a2-01', question: '朝ごはん___食べます。', options: ['は', 'が', 'を', 'に'], correctIndex: 2, explanation: 'を 提示他动词的宾语，"吃早饭"。', language: 'ja' },
  { id: 'ja-g4', courseId: 'ja-a2-01', question: '学校___行きます。', options: ['は', 'が', 'を', 'に'], correctIndex: 3, explanation: 'に 表示动作的目的地，"去学校"。', language: 'ja' },
  { id: 'ja-g5', courseId: 'ja-b1-01', question: '昨日、映画を___。', options: ['見ます', '見ました', '見ています', '見て'], correctIndex: 1, explanation: '昨日表示过去，动词需用过去式 ました。', language: 'ja' },
  { id: 'ja-g6', courseId: 'ja-b2-01', question: '部長、私が資料を___。', options: ['見ます', 'ご覧になります', '拝見します', '見て'], correctIndex: 2, explanation: '拝見する 是 "看" 的谦让语，用于对上司讲话时。', language: 'ja' },

  // 韩语
  { id: 'ko-g1', courseId: 'ko-a1-01', question: '저___ 학생입니다.', options: ['은', '는', '이', '가'], correctIndex: 1, explanation: '는 用于开音节后（저 最后为元音），提示主语。', language: 'ko' },
  { id: 'ko-g2', courseId: 'ko-a1-01', question: '이것___ 책이에요.', options: ['은', '는', '이', '가'], correctIndex: 0, explanation: '은 用于闭音节后，提示主语。', language: 'ko' },
  { id: 'ko-g3', courseId: 'ko-a2-01', question: '밥___ 먹어요.', options: ['은/는', '이/가', '을/를', '에'], correctIndex: 2, explanation: '을/를 提示宾语，"吃饭" 的 "饭" 是宾语。', language: 'ko' },
  { id: 'ko-g4', courseId: 'ko-a2-01', question: '학교___ 가요.', options: ['은', '이', '를', '에'], correctIndex: 3, explanation: '에 表示地点/目的地，"去学校"。', language: 'ko' },
  { id: 'ko-g5', courseId: 'ko-b1-01', question: '어제 영화를___.', options: ['봐요', '봤어요', '볼 거예요', '보고 있어요'], correctIndex: 1, explanation: '어제 (昨天) 需要用过去式，봤어요 是 보다 的过去式。', language: 'ko' },
  { id: 'ko-g6', courseId: 'ko-b2-01', question: '선배님, 제가 커피를___.', options: ['사요', '사드릴게요', '사시겠어요', '사고 있어요'], correctIndex: 1, explanation: '사드릴게요 是 "买给你" 的谦让语形式，用于长辈/上级。', language: 'ko' },
];
