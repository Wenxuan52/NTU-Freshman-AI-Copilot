'use client';

import { useState } from 'react';

import {
  createManualLocation,
  ManualLocationInputSchema,
  type ManualLocationInput,
} from '@/components/map/manual-location';
import type { Location } from '@/contracts/location';

type ManualLocationFormProps = {
  onAddLocation: (location: Location) => void;
  onCancel: () => void;
};

const INITIAL_FORM: ManualLocationInput = {
  name: '',
  category: 'Place',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
};

export function ManualLocationForm({
  onAddLocation,
  onCancel,
}: ManualLocationFormProps) {
  const [form, setForm] = useState<ManualLocationInput>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ManualLocationInput, value: string) {
    setForm(current => ({ ...current, [field]: value }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = ManualLocationInputSchema.safeParse(form);

    if (!validation.success) {
      setError('Enter a name, address, and valid latitude/longitude.');
      return;
    }

    try {
      onAddLocation(createManualLocation(form));
      setForm(INITIAL_FORM);
      setError(null);
    } catch {
      setError('The location could not be added. Check the coordinate values.');
    }
  }

  return (
    <form className="manual-location-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">Local only</span>
          <h4>Add a map location</h4>
        </div>
        <button className="text-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="form-note">
        This entry stays in the current browser session and is marked needs review.
      </p>

      <label>
        Name
        <input
          required
          maxLength={120}
          value={form.name}
          onChange={event => updateField('name', event.target.value)}
        />
      </label>

      <label>
        Category
        <input
          required
          maxLength={80}
          value={form.category}
          onChange={event => updateField('category', event.target.value)}
        />
      </label>

      <label>
        Address
        <input
          required
          maxLength={240}
          value={form.address}
          onChange={event => updateField('address', event.target.value)}
        />
      </label>

      <label>
        Description <span className="muted-label">optional</span>
        <textarea
          maxLength={240}
          rows={2}
          value={form.description}
          onChange={event => updateField('description', event.target.value)}
        />
      </label>

      <div className="coordinate-fields">
        <label>
          Latitude
          <input
            required
            inputMode="decimal"
            type="number"
            min={-90}
            max={90}
            step="any"
            value={form.latitude}
            onChange={event => updateField('latitude', event.target.value)}
          />
        </label>
        <label>
          Longitude
          <input
            required
            inputMode="decimal"
            type="number"
            min={-180}
            max={180}
            step="any"
            value={form.longitude}
            onChange={event => updateField('longitude', event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="primary-button" type="submit">
        Add to map
      </button>
    </form>
  );
}
