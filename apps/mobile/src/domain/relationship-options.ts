import type { Relationship } from './types';

export type RelationshipOption = {
  value: Relationship;
  label: string;
  icon: string;
};

export const relationshipOptions: RelationshipOption[] = [
  { value: 'mother', label: 'Mamá', icon: '♥' },
  { value: 'father', label: 'Papá', icon: '●' },
  { value: 'spouse', label: 'Esposo/a', icon: '◯' },
  { value: 'child', label: 'Hijo/a', icon: '✦' },
  { value: 'sibling', label: 'Hermano/a', icon: '●' },
  { value: 'grandparent', label: 'Abuelo/a', icon: '♟' },
  { value: 'family', label: 'Familiar', icon: '⌂' },
  { value: 'friend', label: 'Amigo/a', icon: '●' },
  { value: 'other', label: 'Otra persona', icon: '…' },
];
