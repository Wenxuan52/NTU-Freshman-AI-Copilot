import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';
import type { Verification } from '@/contracts/verification';
import { isOfficialNtuUrl } from '@/trust/official-domains';

const UNAVAILABLE_CONTENT =
  'Source-backed information is unavailable. Check an official NTU source or try again later.';

type VerificationStatus = Verification['status'];

export type TrustSourceConflict = {
  sourceIds: readonly string[];
  description: string;
};

export type TrustFreshnessPolicy = {
  maxAgeMs: number;
  sourceIds?: readonly string[];
};

export type TrustValidationPolicy = {
  now?: string;
  freshness?: TrustFreshnessPolicy;
  conflicts?: readonly TrustSourceConflict[];
};

export type TrustValidation =
  | { accepted: true; result: ToolResult; errors: [] }
  | { accepted: false; result: null; errors: string[] };

const statusPriority: Record<VerificationStatus, number> = {
  verified: 0,
  needs_review: 1,
  stale: 2,
  conflict: 3,
  unavailable: 4,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function prepareSourceUnavailableCandidate(candidate: unknown): unknown {
  if (!isRecord(candidate) || !Array.isArray(candidate.sources)) {
    return candidate;
  }

  if (candidate.sources.length > 0 || !isRecord(candidate.verification)) {
    return candidate;
  }

  return {
    ...candidate,
    verification: {
      ...candidate.verification,
      status: 'unavailable',
    },
  };
}

function higherPriorityStatus(
  current: VerificationStatus,
  candidate: VerificationStatus,
): VerificationStatus {
  return statusPriority[candidate] > statusPriority[current]
    ? candidate
    : current;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function parseReviewTime(now: string | undefined):
  | { success: true; iso: string; epochMs: number }
  | { success: false; error: string } {
  const epochMs = now === undefined ? Date.now() : Date.parse(now);

  if (!Number.isFinite(epochMs)) {
    return {
      success: false,
      error: 'Trust validation policy now must be a valid date-time.',
    };
  }

  return { success: true, iso: new Date(epochMs).toISOString(), epochMs };
}

function reject(errors: string[]): TrustValidation {
  return { accepted: false, result: null, errors };
}

export function validateToolResult(
  candidate: unknown,
  policy: TrustValidationPolicy = {},
): TrustValidation {
  const reviewTime = parseReviewTime(policy.now);
  if (!reviewTime.success) {
    return reject([reviewTime.error]);
  }

  const parsed = ToolResultSchema.safeParse(
    prepareSourceUnavailableCandidate(candidate),
  );

  if (!parsed.success) {
    return reject(
      parsed.error.issues.map(issue =>
        `${issue.path.join('.') || 'result'}: ${issue.message}`,
      ),
    );
  }

  const result = parsed.data;
  const errors: string[] = [];
  const checks: string[] = [
    'schema_valid',
    ...result.verification.checks.map(check => `tool_declared:${check}`),
  ];
  const warnings = [...result.verification.warnings];
  let status: VerificationStatus = result.verification.status;

  const sourceIds = new Set<string>();
  for (const source of result.sources) {
    if (sourceIds.has(source.id)) {
      errors.push(`Source ID ${source.id} is duplicated.`);
    }
    sourceIds.add(source.id);
  }

  const conflicts = policy.conflicts ?? [];
  for (const [index, conflict] of conflicts.entries()) {
    const distinctConflictIds = unique(conflict.sourceIds);

    if (distinctConflictIds.length < 2 || conflict.description.trim().length === 0) {
      errors.push(
        `Trust validation policy conflict ${index} requires two source IDs and a description.`,
      );
      continue;
    }

    for (const sourceId of distinctConflictIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(
          `Trust validation policy conflict ${index} references unknown source ${sourceId}.`,
        );
      }
    }
  }

  const freshness = policy.freshness;
  if (
    freshness !== undefined &&
    (!Number.isFinite(freshness.maxAgeMs) || freshness.maxAgeMs <= 0)
  ) {
    errors.push('Trust freshness maxAgeMs must be a positive finite number.');
  }

  const freshnessSourceIds =
    freshness?.sourceIds === undefined
      ? [...sourceIds]
      : unique(freshness.sourceIds);

  for (const sourceId of freshnessSourceIds) {
    if (!sourceIds.has(sourceId)) {
      errors.push(
        `Trust freshness policy references unknown source ${sourceId}.`,
      );
    }
  }

  if (errors.length > 0) {
    return reject(errors);
  }

  if (result.sources.length === 0) {
    const unavailableResult = ToolResultSchema.parse({
      ...result,
      content: UNAVAILABLE_CONTENT,
      locations: [],
      verification: {
        status: 'unavailable',
        checks: unique([...checks, 'source_missing']),
        warnings: unique([
          ...warnings,
          'No source-backed factual information is available.',
        ]),
        reviewed_at: reviewTime.iso,
      },
    });

    return { accepted: true, result: unavailableResult, errors: [] };
  }

  checks.push('source_present');

  const normalizedSources = result.sources.map(source => {
    const url = new URL(source.url);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      errors.push(`Source ${source.id} must use http or https.`);
      return source;
    }

    checks.push(`source_url_valid:${source.id}`);

    if (url.protocol === 'http:') {
      warnings.push(`Source ${source.id} does not use HTTPS.`);
      status = higherPriorityStatus(status, 'needs_review');
    }

    const official = isOfficialNtuUrl(source.url);
    checks.push(`official_domain_checked:${source.id}`);

    if (source.official && !official) {
      warnings.push(
        `Source ${source.id} was marked official but is not on an exact NTU domain or safe subdomain.`,
      );
      status = higherPriorityStatus(status, 'needs_review');
    }

    const retrievedAtMs = Date.parse(source.retrieved_at);
    checks.push(`retrieval_time_present:${source.id}`);

    if (retrievedAtMs > reviewTime.epochMs) {
      warnings.push(`Source ${source.id} has a future retrieval timestamp.`);
      status = higherPriorityStatus(status, 'needs_review');
    }

    if (source.published_at !== null) {
      checks.push(`publication_time_present:${source.id}`);

      if (Date.parse(source.published_at) > reviewTime.epochMs) {
        warnings.push(`Source ${source.id} has a future publication timestamp.`);
        status = higherPriorityStatus(status, 'needs_review');
      }
    }

    return { ...source, official };
  });

  if (errors.length > 0) {
    return reject(errors);
  }

  if (!normalizedSources.some(source => source.official)) {
    warnings.push('No official NTU source supports this result.');
    status = higherPriorityStatus(status, 'needs_review');
  }

  if (freshness !== undefined) {
    for (const sourceId of freshnessSourceIds) {
      const source = normalizedSources.find(item => item.id === sourceId);

      if (source === undefined) {
        continue;
      }

      const evidenceTime = source.published_at ?? source.retrieved_at;
      const evidenceTimeMs = Date.parse(evidenceTime);
      checks.push(`freshness_checked:${source.id}`);

      if (evidenceTimeMs > reviewTime.epochMs) {
        warnings.push(`Source ${source.id} has a future evidence timestamp.`);
        status = higherPriorityStatus(status, 'needs_review');
        continue;
      }

      if (reviewTime.epochMs - evidenceTimeMs > freshness.maxAgeMs) {
        warnings.push(
          `Source ${source.id} is older than the configured freshness window.`,
        );
        status = higherPriorityStatus(status, 'stale');
      }
    }
  }

  for (const conflict of conflicts) {
    const conflictIds = unique(conflict.sourceIds);
    checks.push(`source_conflict_recorded:${conflictIds.join(',')}`);
    warnings.push(
      `Conflicting sources (${conflictIds.join(', ')}): ${conflict.description.trim()}`,
    );
    status = higherPriorityStatus(status, 'conflict');
  }

  const normalizedLocations = result.locations.filter(location => {
    if (!sourceIds.has(location.source_id)) {
      warnings.push(
        `Location ${location.id} was excluded because its source is missing.`,
      );
      status = higherPriorityStatus(status, 'needs_review');
      return false;
    }

    checks.push(`location_source_present:${location.id}`);

    if (location.coordinate_status !== 'verified') {
      warnings.push(
        `Location ${location.id} was excluded because its coordinates are not verified.`,
      );
      status = higherPriorityStatus(status, 'needs_review');
      return false;
    }

    checks.push(`coordinates_verified:${location.id}`);
    return true;
  });

  if (warnings.length > 0) {
    status = higherPriorityStatus(status, 'needs_review');
  }

  const normalizedResult = ToolResultSchema.parse({
    ...result,
    ...(status === 'unavailable' ? { content: UNAVAILABLE_CONTENT } : {}),
    sources: normalizedSources,
    locations: status === 'unavailable' ? [] : normalizedLocations,
    verification: {
      status,
      checks: unique(checks),
      warnings: unique(warnings),
      reviewed_at: reviewTime.iso,
    },
  });

  return { accepted: true, result: normalizedResult, errors: [] };
}
