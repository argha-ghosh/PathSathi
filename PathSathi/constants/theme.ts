// constants/theme.ts
// PLACEHOLDER – replace with the team's shared theme when integrating modules.
// This file is local to the Tutor module only.

export const Colors = {
  // Primary palette
  primary: '#4F46E5',       // indigo-600
  primaryLight: '#818CF8',  // indigo-400
  primaryDark: '#3730A3',   // indigo-800
  primarySurface: '#EEF2FF', // indigo-50

  // Neutrals
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderFocus: '#4F46E5',
  divider: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#4F46E5',

  // Status – Application / Verification
  pending: '#D97706',        // amber-600
  pendingSurface: '#FFFBEB', // amber-50
  pendingBorder: '#FCD34D',  // amber-300

  accepted: '#059669',       // emerald-600
  acceptedSurface: '#ECFDF5',
  acceptedBorder: '#6EE7B7',

  verified: '#059669',
  verifiedSurface: '#ECFDF5',
  verifiedBorder: '#6EE7B7',

  rejected: '#DC2626',       // red-600
  rejectedSurface: '#FEF2F2',
  rejectedBorder: '#FCA5A5',

  withdrawn: '#64748B',      // slate-500
  withdrawnSurface: '#F8FAFC',
  withdrawnBorder: '#CBD5E1',

  // Feedback
  error: '#DC2626',
  errorSurface: '#FEF2F2',
  success: '#059669',
  successSurface: '#ECFDF5',
  warning: '#D97706',
  warningSurface: '#FFFBEB',

  // Skeleton / loading
  skeleton: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',

  // Overlay
  overlay: 'rgba(0,0,0,0.45)',
  modalBackdrop: 'rgba(15,23,42,0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,

  // Line heights
  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  // Font weights (React Native accepts string literals)
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// Minimum touch target size (WCAG / HIG recommendation)
export const TouchTarget = 44;
