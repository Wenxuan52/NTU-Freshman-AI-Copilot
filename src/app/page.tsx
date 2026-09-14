'use client';

import Image from 'next/image';
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
        <div className="brand-lockup">
          <div className="brand-mark">
            <Image
              src="/branding/ntu-logo.png"
              alt="Nanyang Technological University, Singapore"
              width={3006}
              height={1079}
              sizes="(max-width: 580px) 112px, 148px"
              priority
            />
          </div>
          <div className="brand-copy">
            <span className="topbar-kicker">NTU · Singapore</span>
            <h1>Freshman AI Copilot</h1>
            <p>Campus guidance, grounded in visible sources.</p>
          </div>
        </div>

        <div className="topbar-status">
          <span className="campus-status">
            <i aria-hidden="true" />
            Campus companion
          </span>
          <span className="mock-badge">Curated preview</span>
        </div>

        <div className="campus-motif" aria-hidden="true">
          <span className="motif-orbit motif-orbit-one" />
          <span className="motif-orbit motif-orbit-two" />
          <span className="motif-building motif-building-one" />
          <span className="motif-building motif-building-two" />
          <span className="motif-building motif-building-three" />
        </div>
      </header>

      <div className="workspace">
        <section className="chat-panel" aria-label="Chat">
          <div className="chat-scroll" aria-live="polite">
            <div className="chat-intro">
              <div>
                <span className="eyebrow">Freshman launchpad</span>
                <h2>Find your footing at NTU.</h2>
                <p>
                  Ask one clear question. The Copilot will show the answer,
                  its source, and how confidently it was verified.
                </p>
              </div>
              <div className="topic-row" aria-label="Example topics">
                <span>Orientation</span>
                <span>Campus life</span>
                <span>Places &amp; food</span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="demo-thread">
                <div className="thread-divider">
                  <span>Example conversation</span>
                </div>
                <div className="message-row user-row">
                  <article className="message user-message">
                    <span className="message-label">You</span>
                    <p>Where can I eat near North Spine?</p>
                  </article>
                </div>
                <div className="message-row assistant-row">
                  <div className="mascot-avatar" role="img" aria-label="Lion Copilot">
                    <span aria-hidden="true">🦁</span>
                    <i aria-hidden="true" />
                  </div>
                  <article className="message assistant-message">
                    <span className="message-label">Copilot</span>
                    <p>I’ll use the Food / Location Tool and show its evidence status.</p>
                    <ToolResultCard
                      result={DEMO_RESULT}
                      selectedLocationId={selectedLocationId}
                      onSelectLocation={setSelectedLocationId}
                    />
                  </article>
                </div>
              </div>
            ) : (
              messages.map(message => {
                const isAssistant = message.role === 'assistant';

                return (
                  <div
                    className={`message-row ${message.role}-row`}
                    key={message.id}
                  >
                    {isAssistant ? (
                      <div className="mascot-avatar" role="img" aria-label="Lion Copilot">
                        <span aria-hidden="true">🦁</span>
                        <i aria-hidden="true" />
                      </div>
                    ) : null}
                    <article className={`message ${message.role}-message`}>
                      <span className="message-label">
                        {message.role === 'user' ? 'You' : 'Copilot'}
                      </span>
                      <MessageParts
                        message={message}
                        selectedLocationId={selectedLocationId}
                        onSelectLocation={setSelectedLocationId}
                      />
                    </article>
                  </div>
                );
              })
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
