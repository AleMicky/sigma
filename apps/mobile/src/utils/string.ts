export function capitalize(value?: string | null): string {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase()
  );
}

export function initials(
  name?: string | null
): string {
  if (!name) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function truncate(
  value: string,
  maxLength = 50
): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function emptyToNull(
  value?: string | null
): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}