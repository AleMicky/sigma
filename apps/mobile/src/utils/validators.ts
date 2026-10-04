export function isValidEmail(
  email: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

export function isValidPhone(
  phone: string
): boolean {
  return /^[0-9+\-\s()]{7,20}$/.test(
    phone.trim()
  );
}

export function isRequired(
  value?: string | null
): boolean {
  return Boolean(value?.trim());
}

export function isValidUrl(
  value: string
): boolean {
  try {
    new URL(value);

    return true;
  } catch {
    return false;
  }
}