// hooks/use-theme-color.ts — stub (PathSathi uses constants/theme.ts directly)
export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName: string,
): string {
  return props.light ?? props.dark ?? '#000000';
}
