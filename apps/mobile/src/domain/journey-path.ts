import type { DeathDatePrecision } from './types';
import { calculateDaySinceLoss } from './accompaniment-engine';

export type JourneyStageId =
  | 'first_days'
  | 'funeral'
  | 'nine_days'
  | 'first_month'
  | 'following_months'
  | 'special_dates'
  | 'first_anniversary'
  | 'after_first_year';

export type JourneyStage = {
  id: JourneyStageId;
  title: string;
  subtitle: string;
  timeBased: boolean;
};

export const journeyStages: JourneyStage[] = [
  {
    id: 'first_days',
    title: 'Primeros días',
    subtitle: 'Acoger lo ocurrido',
    timeBased: true,
  },
  {
    id: 'funeral',
    title: 'Exequias',
    subtitle: 'Despedir con fe',
    timeBased: false,
  },
  {
    id: 'nine_days',
    title: 'Nueve días',
    subtitle: 'Orar y recordar',
    timeBased: true,
  },
  {
    id: 'first_month',
    title: 'Primer mes',
    subtitle: 'Seguir caminando',
    timeBased: true,
  },
  {
    id: 'following_months',
    title: 'Meses siguientes',
    subtitle: 'Aprender a vivir con la ausencia',
    timeBased: true,
  },
  {
    id: 'special_dates',
    title: 'Fechas importantes',
    subtitle: 'Cuando el recuerdo vuelve con más fuerza',
    timeBased: false,
  },
  {
    id: 'first_anniversary',
    title: 'Primer aniversario',
    subtitle: 'Memoria y esperanza',
    timeBased: true,
  },
  {
    id: 'after_first_year',
    title: 'Después del primer año',
    subtitle: 'La vida continúa, el amor permanece',
    timeBased: true,
  },
];

export function getCurrentJourneyStage(input: {
  deathDate: string | null;
  precision: DeathDatePrecision;
}): JourneyStageId | null {
  const day = calculateDaySinceLoss(input.deathDate, input.precision);
  if (day === null) return null;

  if (day <= 3) return 'first_days';
  if (day <= 9) return 'nine_days';
  if (day <= 30) return 'first_month';

  // El primer aniversario se trata como una ventana de acompañamiento,
  // no como un único día obligatorio.
  if (day >= 335 && day <= 395) return 'first_anniversary';

  if (day < 335) return 'following_months';
  return 'after_first_year';
}

export function getStageStatus(
  stageId: JourneyStageId,
  currentStageId: JourneyStageId | null
): 'current' | 'available' {
  return stageId === currentStageId ? 'current' : 'available';
}
