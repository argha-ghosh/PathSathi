// utils/validation.ts
// Validation helpers for forms. Pure functions – return error message or null.

export function required(value: string, label = 'This field'): string | null {
  return value.trim().length === 0 ? `${label} is required.` : null;
}

export function minLength(
  value: string,
  min: number,
  label = 'This field',
): string | null {
  return value.trim().length < min
    ? `${label} must be at least ${min} characters.`
    : null;
}

export function maxLength(
  value: string,
  max: number,
  label = 'This field',
): string | null {
  return value.trim().length > max
    ? `${label} must be at most ${max} characters.`
    : null;
}

export function positiveNumber(
  value: number,
  label = 'This field',
): string | null {
  return value <= 0 ? `${label} must be greater than 0.` : null;
}

export function numericString(value: string, label = 'This field'): string | null {
  return !/^\d+$/.test(value.trim())
    ? `${label} must be a number.`
    : null;
}

export function atLeastOne(
  values: string[],
  label = 'Select',
): string | null {
  return values.length === 0 ? `${label} at least one option.` : null;
}

/** Validate the apply-to-post message field. */
export function validateApplyMessage(message: string): string | null {
  const trimmed = message.trim();
  if (trimmed.length === 0) return 'Please write a message before applying.';
  if (trimmed.length < 20) return 'Message must be at least 20 characters.';
  if (trimmed.length > 300) return 'Message must be at most 300 characters.';
  return null;
}
