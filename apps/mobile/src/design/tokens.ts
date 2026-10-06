export const colors = {
  navy: '#123F67',
  navyDeep: '#0B2E4F',
  cream: '#F8F2E7',
  creamElevated: '#FFFCF6',
  gold: '#C99336',
  goldSoft: '#E6C98C',
  hope: '#78986C',
  sky: '#9FC4D8',
  rose: '#D88B83',
  ink: '#203345',
  inkSoft: '#65717C',
  line: '#E5D9C7',
  white: '#FFFFFF',
  danger: '#A64141',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typeScale = {
  display: 44,
  title: 30,
  heading: 22,
  body: 17,
  bodySmall: 15,
  caption: 13,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
} as const;
