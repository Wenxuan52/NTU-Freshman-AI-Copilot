export const OFFICIAL_NTU_DOMAINS = ['ntu.edu.sg'] as const;

export function isOfficialNtuHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '');

  return OFFICIAL_NTU_DOMAINS.some(
    domain =>
      normalizedHostname === domain ||
      normalizedHostname.endsWith(`.${domain}`),
  );
}

export function isOfficialNtuUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      isOfficialNtuHostname(url.hostname)
    );
  } catch {
    return false;
  }
}
