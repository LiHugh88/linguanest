import { courses } from '../data/courses';
import { vocabItems, grammarQuestions, speakingItems, listeningItems } from '../data';
import type { Course, LanguageCode, Level } from '../types';

// 计算推荐课程
export interface RecommendInput {
  targetLanguage: LanguageCode;
  level: Level;
  accuracy: number;       // 0 - 1
  completedCourseIds: string[];
  recentlyWeak: boolean;  // 正确率是否偏低
}

export const recommendCourses = (input: RecommendInput): Course[] => {
  let list = courses.filter((c) => c.language === input.targetLanguage);
  if (list.length === 0) return [];
  // 如果有未完成基础课程，优先推荐同等级课程
  const uncompleted = list.filter((c) => !input.completedCourseIds.includes(c.id));
  if (uncompleted.length > 0) {
    list = uncompleted;
  }
  // 如果正确率偏低，优先推荐基础等级课程
  if (input.recentlyWeak) {
    list.sort((a, b) => a.level.localeCompare(b.level));
  } else {
    // 按用户等级优先
    list.sort((a, b) => {
      const matchA = a.level === input.level ? 0 : a.level < input.level ? -1 : 1;
      const matchB = b.level === input.level ? 0 : b.level < input.level ? -1 : 1;
      return matchA - matchB;
    });
  }
  return list.slice(0, 6);
};

// 简单数据导出，给练习页面用
export const getDataForCourse = (courseId: string) => ({
  vocab: vocabItems.filter((v) => v.courseId === courseId),
  grammar: grammarQuestions.filter((q) => q.courseId === courseId),
  speaking: speakingItems.filter((s) => s.courseId === courseId),
  listening: listeningItems.filter((l) => l.courseId === courseId),
});

export { courses };
