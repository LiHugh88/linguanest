import type { ListeningItem } from '../types';

export const listeningItems: ListeningItem[] = [
  // 英语
  { id: 'en-l1', courseId: 'en-a1-01', audioText: 'Hello, how are you today?', translation: '你好，你今天怎么样？', hint: '问候语', language: 'en' },
  { id: 'en-l2', courseId: 'en-a1-01', audioText: 'My name is Alex and I am from London.', translation: '我的名字是 Alex，我来自伦敦。', hint: '自我介绍', language: 'en' },
  { id: 'en-l3', courseId: 'en-a2-01', audioText: 'Could I have the check, please?', translation: '请问可以结账吗？', hint: '餐厅用语', language: 'en' },
  { id: 'en-l4', courseId: 'en-b1-01', audioText: 'Personally, I believe this approach would work better.', translation: '就我个人而言，我相信这个方法会更好。', hint: '表达观点', language: 'en' },
  { id: 'en-l5', courseId: 'en-b2-01', audioText: 'Could you walk me through the quarterly report?', translation: '你能帮我详细讲解一下季度报告吗？', hint: '商务会议', language: 'en' },

  // 日语
  { id: 'ja-l1', courseId: 'ja-a1-01', audioText: 'おはようございます。', translation: '早上好。', hint: '早晨问候', language: 'ja' },
  { id: 'ja-l2', courseId: 'ja-a1-01', audioText: '私は中国から来ました。', translation: '我来自中国。', hint: '自我介绍', language: 'ja' },
  { id: 'ja-l3', courseId: 'ja-a2-01', audioText: 'すみません、駅はどこですか。', translation: '不好意思，请问车站在哪里？', hint: '问路', language: 'ja' },
  { id: 'ja-l4', courseId: 'ja-b1-01', audioText: '週末に映画を見に行きました。', translation: '周末我去看了电影。', hint: '过去时的活动', language: 'ja' },
  { id: 'ja-l5', courseId: 'ja-b2-01', audioText: '部長、お時間はよろしいでしょうか。', translation: '部长，请问您现在方便吗？', hint: '敬语，职场用语', language: 'ja' },

  // 韩语
  { id: 'ko-l1', courseId: 'ko-a1-01', audioText: '안녕하세요, 잘 지내세요?', translation: '你好，过得好吗？', hint: '问候语', language: 'ko' },
  { id: 'ko-l2', courseId: 'ko-a1-01', audioText: '저는 중국에서 왔어요.', translation: '我来自中国。', hint: '自我介绍', language: 'ko' },
  { id: 'ko-l3', courseId: 'ko-a2-01', audioText: '실례지만, 역이 어디예요?', translation: '不好意思，请问车站在哪里？', hint: '问路', language: 'ko' },
  { id: 'ko-l4', courseId: 'ko-b1-01', audioText: '어제 친구랑 영화를 봤어요.', translation: '昨天我和朋友看了电影。', hint: '过去时，与朋友活动', language: 'ko' },
  { id: 'ko-l5', courseId: 'ko-b2-01', audioText: '선배님, 잠시 시간 있으신가요?', translation: '前辈，请问您现在有空吗？', hint: '敬语，职场用语', language: 'ko' },
];
