'use client';

import { useState } from 'react';

import {
  type PlanInterest,
  type PlanProfile,
} from '@/contracts/plan-lite';

type PlanLiteStarterProps = {
  disabled: boolean;
  onGenerate: (profile: PlanProfile) => void | Promise<void>;
};

const interestOptions: Array<{ value: PlanInterest; label: string }> = [
  { value: 'food', label: 'Food map' },
  { value: 'study', label: 'Study' },
  { value: 'wellbeing', label: 'Wellbeing' },
  { value: 'campus_life', label: 'Campus life' },
];

function formatProfileRequest(profile: PlanProfile): string {
  const interests =
    profile.interests.length > 0 ? profile.interests.join(', ') : 'none selected';

  return [
    'Create my NTU Plan Lite using the Plan Lite Tool.',
    `Student level: ${profile.student_level}.`,
    `Residency: ${profile.residency}.`,
    `Housing: ${profile.housing}.`,
    `Current stage: ${profile.arrival_stage}.`,
    `Interests: ${interests}.`,
  ].join(' ');
}

export function PlanLiteStarter({
  disabled,
  onGenerate,
}: PlanLiteStarterProps) {
  const [profile, setProfile] = useState<PlanProfile>({
    student_level: 'undergraduate',
    residency: 'international',
    housing: 'on_campus',
    arrival_stage: 'before_arrival',
    interests: ['food', 'study'],
  });

  function toggleInterest(interest: PlanInterest) {
    setProfile(current => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter(candidate => candidate !== interest)
        : [...current.interests, interest],
    }));
  }

  return (
    <form
      className="plan-starter"
      onSubmit={event => {
        event.preventDefault();
        void onGenerate(profile);
      }}
    >
      <div className="plan-starter-heading">
        <div>
          <span className="eyebrow">Plan Lite · Local profile</span>
          <h3>Build a first-month checklist</h3>
        </div>
        <span className="plan-lite-badge">No account</span>
      </div>

      <div className="profile-grid">
        <label>
          Student
          <select
            value={profile.student_level}
            onChange={event =>
              setProfile(current => ({
                ...current,
                student_level: event.target.value as PlanProfile['student_level'],
              }))
            }
          >
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </label>

        <label>
          Residency
          <select
            value={profile.residency}
            onChange={event =>
              setProfile(current => ({
                ...current,
                residency: event.target.value as PlanProfile['residency'],
              }))
            }
          >
            <option value="international">International</option>
            <option value="local">Local</option>
          </select>
        </label>

        <label>
          Housing
          <select
            value={profile.housing}
            onChange={event =>
              setProfile(current => ({
                ...current,
                housing: event.target.value as PlanProfile['housing'],
              }))
            }
          >
            <option value="on_campus">On campus</option>
            <option value="off_campus">Off campus</option>
            <option value="undecided">Undecided</option>
          </select>
        </label>

        <label>
          Current stage
          <select
            value={profile.arrival_stage}
            onChange={event =>
              setProfile(current => ({
                ...current,
                arrival_stage: event.target.value as PlanProfile['arrival_stage'],
              }))
            }
          >
            <option value="before_arrival">Before arrival</option>
            <option value="first_week">First week</option>
            <option value="first_month">First month</option>
          </select>
        </label>
      </div>

      <fieldset className="interest-picker">
        <legend>Personalize with interests</legend>
        <div>
          {interestOptions.map(option => {
            const selected = profile.interests.includes(option.value);

            return (
              <button
                className={selected ? 'selected' : ''}
                type="button"
                aria-pressed={selected}
                key={option.value}
                onClick={() => toggleInterest(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="plan-starter-footer">
        <p>Only these choices are sent. Progress stays in this browser.</p>
        <button type="submit" disabled={disabled}>
          {disabled ? 'Building…' : 'Generate Plan Lite'}
        </button>
      </div>
    </form>
  );
}

export { formatProfileRequest };
