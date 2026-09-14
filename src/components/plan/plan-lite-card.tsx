'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  type PlanItem,
  type PlanLiteResult,
  type PlanPhase,
} from '@/contracts/plan-lite';

type PlanLiteCardProps = {
  result: PlanLiteResult;
  onSelectLocation: (locationId: string) => void;
};

const phaseLabels: Record<PlanPhase, string> = {
  before_arrival: 'Before arrival',
  first_week: 'First week',
  first_month: 'First month',
};

const phases: PlanPhase[] = ['before_arrival', 'first_week', 'first_month'];

function progressKey(result: PlanLiteResult): string {
  const profile = result.profile;
  return [
    'ntu-plan-lite-v1',
    profile.student_level,
    profile.residency,
    profile.housing,
    profile.arrival_stage,
    [...profile.interests].sort().join('-'),
  ].join(':');
}

function readProgress(key: string): Set<string> {
  try {
    const stored = window.localStorage.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

function PlanTask({
  item,
  completed,
  result,
  onToggle,
  onSelectLocation,
}: {
  item: PlanItem;
  completed: boolean;
  result: PlanLiteResult;
  onToggle: () => void;
  onSelectLocation: (locationId: string) => void;
}) {
  const sources = item.source_ids
    .map(sourceId => result.sources.find(source => source.id === sourceId))
    .filter(source => source !== undefined);

  return (
    <li className={`plan-task${completed ? ' completed' : ''}`}>
      <label className="plan-task-check">
        <input type="checkbox" checked={completed} onChange={onToggle} />
        <span aria-hidden="true" />
      </label>
      <div className="plan-task-body">
        <div className="plan-task-title">
          <strong>{item.title}</strong>
          <span className={`priority-${item.priority}`}>{item.priority}</span>
        </div>
        <p>{item.description}</p>
        <p className="plan-reason">Why this applies: {item.reason}</p>
        <div className="plan-task-actions">
          {sources.map(source => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              {source.official ? 'NTU source' : 'Map source'}
            </a>
          ))}
          {item.location_ids.length > 0 ? (
            <button
              type="button"
              onClick={() => onSelectLocation(item.location_ids[0])}
            >
              Show {item.location_ids.length} on map
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function PlanLiteCard({
  result,
  onSelectLocation,
}: PlanLiteCardProps) {
  const storageKey = useMemo(() => progressKey(result), [result]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletedIds(readProgress(storageKey));
  }, [storageKey]);

  function toggleItem(itemId: string) {
    setCompletedIds(current => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);

      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // The checklist remains usable when browser storage is unavailable.
      }

      return next;
    });
  }

  const completedCount = result.items.filter(item => completedIds.has(item.id)).length;

  return (
    <div className="plan-lite-result">
      <div className="plan-result-heading">
        <div>
          <span className="eyebrow">Personalized roadmap</span>
          <h3>Your Plan Lite</h3>
        </div>
        <span className="plan-progress">
          {completedCount}/{result.items.length} done
        </span>
      </div>

      <p className="plan-summary">{result.content}</p>

      {phases.map(phase => {
        const phaseItems = result.items.filter(item => item.phase === phase);
        if (phaseItems.length === 0) return null;

        return (
          <section className="plan-phase" key={phase}>
            <div className="plan-phase-heading">
              <h4>{phaseLabels[phase]}</h4>
              <span>{phaseItems.length}</span>
            </div>
            <ul>
              {phaseItems.map(item => (
                <PlanTask
                  item={item}
                  completed={completedIds.has(item.id)}
                  result={result}
                  onToggle={() => toggleItem(item.id)}
                  onSelectLocation={onSelectLocation}
                  key={item.id}
                />
              ))}
            </ul>
          </section>
        );
      })}

      <div className={`plan-warning ${result.verification.status}`}>
        <strong>{result.verification.status.replace('_', ' ')}</strong>
        <p>{result.verification.warnings.join(' ')}</p>
      </div>
    </div>
  );
}
