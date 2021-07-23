export function doesHaveValue(value: unknown): boolean {
  return !doesNotHaveValue(value);
}

export function doesNotHaveValue(value: unknown): boolean {
  return value === null || value === undefined;
}

export function valueOrDefault<T>(value: T, defaultValue: T): T {
  if (doesHaveValue(value)) {
    return value;
  }
  return defaultValue;
}
