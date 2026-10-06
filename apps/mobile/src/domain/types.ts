export type Relationship =
  | 'mother'
  | 'father'
  | 'spouse'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'family'
  | 'friend'
  | 'other';

export type DeathDatePrecision = 'exact' | 'month' | 'year' | 'unknown';

export type LossCircumstance =
  | 'illness'
  | 'sudden'
  | 'accident'
  | 'pregnancy_or_birth'
  | 'other'
  | 'prefer_not_to_say';

export type Emotion =
  | 'sadness'
  | 'yearning'
  | 'anxiety'
  | 'guilt'
  | 'anger'
  | 'loneliness'
  | 'fear'
  | 'confusion'
  | 'peace'
  | 'gratitude'
  | 'hope'
  | 'unknown';

export type EmotionIntensity = 'mild' | 'moderate' | 'strong' | 'unknown';

export type JourneyWindow =
  | 'first_72_hours'
  | 'days_4_9'
  | 'days_10_30'
  | 'months_2_6'
  | 'months_6_12'
  | 'first_anniversary'
  | 'after_first_year';

export type MemoryType = 'text' | 'photo' | 'audio';

export type SyncOperation = 'insert' | 'update' | 'delete';

export interface LocalProfile {
  id: string;
  remoteUserId: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LovedOne {
  id: string;
  ownerId: string;
  name: string | null;
  relationship: Relationship;
  birthDate: string | null;
  deathDate: string | null;
  deathDatePrecision: DeathDatePrecision;
  approximateAge: number | null;
  circumstance: LossCircumstance | null;
  photoUri: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GriefJourney {
  id: string;
  ownerId: string;
  lovedOneId: string;
  startedAt: string;
  active: boolean;
  lastCheckinAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionalCheckin {
  id: string;
  ownerId: string;
  journeyId: string;
  emotion: Emotion;
  intensity: EmotionIntensity;
  trigger: string | null;
  note: string | null;
  context: 'morning' | 'afternoon' | 'night' | 'spontaneous';
  createdAt: string;
}

export interface OnboardingDraft {
  id: 'current';
  relationship: Relationship | null;
  name: string | null;
  deathDate: string | null;
  deathDatePrecision: DeathDatePrecision | null;
  approximateAge: number | null;
  circumstance: LossCircumstance | null;
  currentEmotion: Emotion | null;
  currentStep: number;
  updatedAt: string;
}
