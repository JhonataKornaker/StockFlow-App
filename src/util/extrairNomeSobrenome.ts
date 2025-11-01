export function extractFirstAndLastName(fullName: string): string {
  if (!fullName) return '';

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return `${firstName} ${lastName}`;
}
