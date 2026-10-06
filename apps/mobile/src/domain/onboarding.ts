export type OnboardingResumeRoute =
  | '/onboarding/name'
  | '/onboarding/date'
  | '/onboarding/details'
  | '/onboarding/thanks'
  | '/onboarding/emotion'
  | '/onboarding/finish';

export function getOnboardingResumeRoute(step: number): OnboardingResumeRoute | null {
  if (step >= 6) return '/onboarding/finish';
  if (step >= 5) return '/onboarding/emotion';
  if (step >= 4) return '/onboarding/thanks';
  if (step >= 3) return '/onboarding/details';
  if (step >= 2) return '/onboarding/date';
  if (step >= 1) return '/onboarding/name';
  return null;
}
