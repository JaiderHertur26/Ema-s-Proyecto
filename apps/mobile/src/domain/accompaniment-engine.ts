import type {
  DeathDatePrecision,
  Emotion,
  JourneyWindow,
  Relationship,
} from './types';

export type AccompanimentFocus = 'emotion' | 'time' | 'general';

export type AccompanimentDecision = {
  focus: AccompanimentFocus;
  emotion: Emotion | null;
  daySinceLoss: number | null;
  journeyWindow: JourneyWindow | null;
  contentKey: string;
};

const emotionalPriority = new Set<Emotion>([
  'anxiety',
  'guilt',
  'anger',
  'loneliness',
  'fear',
  'confusion',
  'unknown',
]);

export function calculateDaySinceLoss(
  deathDate: string | null,
  precision: DeathDatePrecision
): number | null {
  if (!deathDate || precision !== 'exact') return null;

  const [year, month, day] = deathDate.split('-').map(Number);
  const lossUtc = Date.UTC(year, month - 1, day);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.max(0, Math.floor((todayUtc - lossUtc) / 86_400_000));
}

export function getJourneyWindow(daySinceLoss: number | null): JourneyWindow | null {
  if (daySinceLoss === null) return null;
  if (daySinceLoss <= 3) return 'first_72_hours';
  if (daySinceLoss <= 9) return 'days_4_9';
  if (daySinceLoss <= 30) return 'days_10_30';
  if (daySinceLoss <= 183) return 'months_2_6';
  if (daySinceLoss <= 365) return 'months_6_12';
  if (daySinceLoss <= 395) return 'first_anniversary';
  return 'after_first_year';
}

export function decideAccompaniment(input: {
  deathDate: string | null;
  deathDatePrecision: DeathDatePrecision;
  relationship: Relationship;
  emotion: Emotion | null;
}): AccompanimentDecision {
  const daySinceLoss = calculateDaySinceLoss(input.deathDate, input.deathDatePrecision);
  const journeyWindow = getJourneyWindow(daySinceLoss);

  if (input.emotion && emotionalPriority.has(input.emotion)) {
    return {
      focus: 'emotion',
      emotion: input.emotion,
      daySinceLoss,
      journeyWindow,
      contentKey: `emotion:${input.emotion}`,
    };
  }

  if (input.emotion && ['peace', 'hope', 'gratitude'].includes(input.emotion)) {
    return {
      focus: 'emotion',
      emotion: input.emotion,
      daySinceLoss,
      journeyWindow,
      contentKey: `emotion:${input.emotion}`,
    };
  }

  if (daySinceLoss !== null && daySinceLoss <= 30) {
    const day = Math.max(1, daySinceLoss);
    return {
      focus: 'time',
      emotion: input.emotion,
      daySinceLoss,
      journeyWindow,
      contentKey: `day:${day}`,
    };
  }

  if (input.emotion) {
    return {
      focus: 'emotion',
      emotion: input.emotion,
      daySinceLoss,
      journeyWindow,
      contentKey: `emotion:${input.emotion}`,
    };
  }

  return {
    focus: 'general',
    emotion: null,
    daySinceLoss,
    journeyWindow,
    contentKey: 'general:today',
  };
}
