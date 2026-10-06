import type { Emotion } from './types';

export type DifficultMomentType =
  | 'crying'
  | 'anxiety'
  | 'guilt'
  | 'anger'
  | 'loneliness'
  | 'insomnia'
  | 'fear'
  | 'reminder'
  | 'need_god'
  | 'need_talk'
  | 'unknown'
  | 'unsafe';

export type DifficultMomentOption = {
  value: DifficultMomentType;
  label: string;
  icon: string;
  emotion: Emotion | null;
  requiresIntensity: boolean;
};

export const difficultMomentOptions: DifficultMomentOption[] = [
  { value: 'crying', label: 'No puedo parar de llorar', icon: '💧', emotion: 'sadness', requiresIntensity: true },
  { value: 'anxiety', label: 'Tengo mucha ansiedad', icon: '◌', emotion: 'anxiety', requiresIntensity: true },
  { value: 'guilt', label: 'Me siento culpable', icon: '◐', emotion: 'guilt', requiresIntensity: true },
  { value: 'anger', label: 'Tengo mucha rabia', icon: '◇', emotion: 'anger', requiresIntensity: true },
  { value: 'loneliness', label: 'Me siento muy solo', icon: '☾', emotion: 'loneliness', requiresIntensity: true },
  { value: 'insomnia', label: 'No puedo dormir', icon: '◒', emotion: null, requiresIntensity: false },
  { value: 'fear', label: 'Tengo miedo', icon: '△', emotion: 'fear', requiresIntensity: true },
  { value: 'reminder', label: 'Algo me recordó a mi ser querido', icon: '✦', emotion: 'yearning', requiresIntensity: false },
  { value: 'need_god', label: 'Necesito a Dios', icon: '✝', emotion: null, requiresIntensity: false },
  { value: 'need_talk', label: 'Necesito hablar con alguien', icon: '○', emotion: 'loneliness', requiresIntensity: false },
  { value: 'unknown', label: 'No sé qué siento', icon: '…', emotion: 'unknown', requiresIntensity: false },
];

export function getDifficultMomentOption(type: DifficultMomentType) {
  return difficultMomentOptions.find((option) => option.value === type) ?? null;
}

export function normalizeDifficultMomentType(value: string | string[] | undefined): DifficultMomentType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'unsafe') return 'unsafe';
  const option = difficultMomentOptions.find((item) => item.value === raw);
  return option?.value ?? 'unknown';
}
