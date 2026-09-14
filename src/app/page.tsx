'use client';

import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';

import curatedLocationData from '../../data/curated/locations/ntu-food-locations.json';
import type { MainAgentUIMessage } from '@/agent/main-agent';
import { ChatInput } from '@/components/chat/chat-input';
import { ContextPanel } from '@/components/context-panel/context-panel';
import { LocationList } from '@/components/map/location-list';
import { SourceList } from '@/components/sources/source-list';
import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';

const DEMO_RESULT: ToolResult = ToolResultSchema.parse({
  content:
    'Offline map preview: these curated NTU food locations demonstrate the structured Location contract. Venue details and opening hours require manual confirmation before acting.',
  sources: curatedLocationData.sources,
  locations: curatedLocationData.locations,
  verification: {
    status: 'needs_review',
    checks: [
      'source_present',
      'url_valid',
      'coordinate_source_present',
      'coordinates_verified_against_curated_records',
    ],
    warnings: [
      'Venue details and opening hours have not been manually verified against current NTU listings.',
    ],
    reviewed_at: '2026-09-14T00:00:00.000Z',
  },
});

function findLatestToolResult(messages: MainAgentUIMessage[]): ToolResult | null {
  for (const message of messages.toReversed()) {
    for (const part of message.parts.toReversed()) {
      if (
        (part.type === 'tool-mockNtuInfo' || part.type === 'tool-foodLocation') &&
        part.state === 'output-available'
      ) {
        const parsed = ToolResultSchema.safeParse(part.output);
        if (parsed.success) return parsed.data;
      }
    }
  }

  return null;
}

function ToolResultCard({
  result,
  onSelectLocation,
  selectedLocationId,
}: {
  result: ToolResult;
  onSelectLocation: (locationId: string) => void;
  selectedLocationId: string | null;
}) {
  return (
    <div className="tool-result">
      <div className="tool-result-heading">
        <span className="tool-status">Tool complete</span>
        <span className={`status-pill ${result.verification.status}`}>
          {result.verification.status.replace('_', ' ')}
        </span>
      </div>
      <p>{result.content}</p>
      <SourceList sources={result.sources} />
      {result.locations.length > 0 ? (
        <LocationList
          locations={result.locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
        />
      ) : null}
      {result.verification.warnings.map(warning => (
        <p className="warning-copy" key={warning}>
          {warning}
        </p>
      ))}
    </div>
  );
}

function MessageParts({
  message,
  onSelectLocation,
  selectedLocationId,
}: {
  message: MainAgentUIMessage;
  onSelectLocation: (locationId: string) => void;
  selectedLocationId: string | null;
}) {
  return message.parts.map((part, index) => {
    if (part.type === 'text') {
      return <p key={index}>{part.text}</p>;
    }

    if (part.type === 'step-start') {
      return <div className="step-divider" key={index} />;
    }

    if (part.type === 'tool-mockNtuInfo' || part.type === 'tool-foodLocation') {
      if (part.state === 'input-streaming' || part.state === 'input-available') {
        return (
          <div className="tool-pending" key={index}>
            <span className="spinner" aria-hidden="true" />
            Running NTU information Tool…
          </div>
        );
      }

      if (part.state === 'output-error') {
        return (
          <p className="error-copy" key={index}>
            The information Tool could not return a result: {part.errorText}
          </p>
        );
      }

      if (part.state === 'output-available') {
        const result = ToolResultSchema.safeParse(part.output);
        return result.success ? (
          <ToolResultCard
            key={index}
            result={result.data}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
        ) : (
          <p className="error-copy" key={index}>
            The Tool returned an invalid result.
          </p>
        );
      }
    }

    return null;
  });
}

export default function Home() {
  const { messages, sendMessage, status, stop, error } =
    useChat<MainAgentUIMessage>();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const latestResult = useMemo(() => findLatestToolResult(messages), [messages]);
  const contextResult = latestResult ?? (messages.length === 0 ? DEMO_RESULT : null);

  useEffect(() => {
    if (
      selectedLocationId &&
      !contextResult?.locations.some(
        location => location.id === selectedLocationId,
      )
    ) {
      setSelectedLocationId(null);
    }
  }, [contextResult, selectedLocationId]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">N</div>
        <div>
          <span className="eyebrow">Ask · verify · orient</span>
          <h1>NTU Freshman AI Copilot</h1>
        </div>
        <span className="mock-badge">Curated preview</span>
      </header>

      <div className="workspace">
        <section className="chat-panel" aria-label="Chat">
          <div className="chat-scroll" aria-live="polite">
            {messages.length === 0 ? (
              <div className="demo-thread">
                <span className="eyebrow">Vertical-slice preview</span>
                <article className="message user-message">
                  <span className="message-label">You</span>
                  <p>What should I check before orientation?</p>
                </article>
                <article className="message assistant-message">
                  <span className="message-label">Copilot</span>
                  <p>I’ll use the Mock NTU Info Tool and show its evidence status.</p>
                  <ToolResultCard
                    result={DEMO_RESULT}
                    selectedLocationId={selectedLocationId}
                    onSelectLocation={setSelectedLocationId}
                  />
                </article>
              </div>
            ) : (
              messages.map(message => (
                <article
                  className={`message ${message.role}-message`}
                  key={message.id}
                >
                  <span className="message-label">
                    {message.role === 'user' ? 'You' : 'Copilot'}
                  </span>
                  <MessageParts
                    message={message}
                    selectedLocationId={selectedLocationId}
                    onSelectLocation={setSelectedLocationId}
                  />
                </article>
              ))
            )}

            {error ? (
              <p className="error-banner" role="alert">
                Chat is unavailable. Check the server configuration and try again.
              </p>
            ) : null}
          </div>

          <ChatInput
            status={status}
            onSubmit={text => sendMessage({ text })}
            onStop={stop}
          />
        </section>

        <ContextPanel
          result={contextResult}
          selectedLocationId={selectedLocationId}
          onSelectLocation={setSelectedLocationId}
        />
      </div>
    </main>
  );
}
