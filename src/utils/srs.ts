// src/utils/srs.ts
import { VocabularyItem } from '../types';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculates new SRS parameters based on SM-2 / Anki spaced repetition algorithm.
 */
export function calculateSRS(item: VocabularyItem, rating: Rating): Partial<VocabularyItem> {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  let { srsLevel, intervalDays, easeFactor, repetitionCount } = item;
  easeFactor = easeFactor || 2.5;
  repetitionCount = (repetitionCount || 0) + 1;

  let nextInterval = 1;

  switch (rating) {
    case 'again': // Chưa nhớ
      srsLevel = Math.max(0, srsLevel - 1);
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      nextInterval = 0; // Due today / immediately
      break;

    case 'hard': // Hơi khó
      srsLevel = Math.max(1, srsLevel);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      nextInterval = Math.max(1, Math.round((intervalDays || 1) * 1.2));
      break;

    case 'good': // Đã nhớ / Tốt
      if (srsLevel === 0) {
        nextInterval = 1;
        srsLevel = 1;
      } else if (srsLevel === 1) {
        nextInterval = 3;
        srsLevel = 2;
      } else {
        nextInterval = Math.round((intervalDays || 1) * easeFactor);
        srsLevel = Math.min(5, srsLevel + 1);
      }
      break;

    case 'easy': // Rất dễ
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      if (srsLevel === 0) {
        nextInterval = 3;
        srsLevel = 2;
      } else {
        nextInterval = Math.max(4, Math.round((intervalDays || 1) * easeFactor * 1.3));
        srsLevel = Math.min(5, srsLevel + 2);
      }
      break;
  }

  // Next review date timestamp
  const nextReviewDate = nextInterval === 0 
    ? now + (15 * 60 * 1000) // 15 minutes for immediate retry
    : now + (nextInterval * ONE_DAY_MS);

  return {
    srsLevel,
    intervalDays: nextInterval,
    easeFactor,
    repetitionCount,
    nextReviewDate,
    lastReviewed: now
  };
}

export function getWordStatus(item: VocabularyItem): 'new' | 'learning' | 'review' | 'mastered' {
  if (item.repetitionCount === 0 || item.srsLevel === 0) return 'new';
  if (item.srsLevel >= 4) return 'mastered';
  if (item.nextReviewDate <= Date.now()) return 'review';
  return 'learning';
}
