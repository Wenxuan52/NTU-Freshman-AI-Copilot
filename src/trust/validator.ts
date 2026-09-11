import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';
import { isOfficialNtuUrl } from '@/trust/official-domains';

export type TrustValidation =
  | { accepted: true; result: ToolResult; errors: [] }
  | { accepted: false; result: null; errors: string[] };

export function validateToolResult(candidate: unknown): TrustValidation {
  const parsed = ToolResultSchema.safeParse(candidate);

  if (!parsed.success) {
    return {
      accepted: false,
      result: null,
      errors: parsed.error.issues.map(issue =>
        `${issue.path.join('.') || 'result'}: ${issue.message}`,
      ),
    };
  }

  const result = parsed.data;
  const errors: string[] = [];

  if (result.sources.length === 0) {
    errors.push('A factual Tool result must include at least one source.');
  }

  const sourceIds = new Set(result.sources.map(source => source.id));

  for (const source of result.sources) {
    let url: URL;

    try {
      url = new URL(source.url);
    } catch {
      errors.push(`Source ${source.id} has an invalid URL.`);
      continue;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      errors.push(`Source ${source.id} must use http or https.`);
    }

    if (source.official && !isOfficialNtuUrl(source.url)) {
      errors.push(`Source ${source.id} is not on an exact NTU domain or safe subdomain.`);
    }

    if (!source.retrieved_at) {
      errors.push(`Source ${source.id} is missing retrieved_at.`);
    }
  }

  for (const location of result.locations) {
    if (!sourceIds.has(location.source_id)) {
      errors.push(`Location ${location.id} references an unknown source.`);
    }

    if (location.coordinate_status !== 'verified') {
      errors.push(`Location ${location.id} has unverified coordinates.`);
    }
  }

  if (errors.length > 0) {
    return { accepted: false, result: null, errors };
  }

  return { accepted: true, result, errors: [] };
}
