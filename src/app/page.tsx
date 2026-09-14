'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';

import curatedLocationData from '../../data/curated/locations/ntu-food-locations.json';
import type { MainAgentUIMessage } from '@/agent/main-agent';
import { ChatInput } from '@/components/chat/chat-input';
import { ContextPanel } from '@/components/context-panel/context-panel';
import { PlanLiteCard } from '@/components/plan/plan-lite-card';
import {
  formatProfileRequest,
  PlanLiteStarter,
} from '@/components/plan/plan-lite-starter';
import { SourceList } from '@/components/sources/source-list';
import { PlanLiteResultSchema } from '@/contracts/plan-lite';
import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';

type UtilityPanel = 'plan' | 'context';

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
        (part.type === 'tool-mockNtuInfo' ||
          part.type === 'tool-foodLocation' ||
          part.type === 'tool-planLite') &&
        part.state === 'output-available'
      ) {
        const parsed = ToolResultSchema.safeParse(part.output);
        if (parsed.success) return parsed.data;
      }
    }
  }

  return null;
}

function ToolResultCard({ result }: { result: ToolResult }) {
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
        <p className="location-summary">
          {result.locations.length} locations are listed in the map panel.
        </p>
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
}: {
  message: MainAgentUIMessage;
  onSelectLocation: (locationId: string) => void;
}) {
  return message.parts.map((part, index) => {
    if (part.type === 'text') {
      return <p key={index}>{part.text}</p>;
    }

    if (part.type === 'step-start') {
      return <div className="step-divider" key={index} />;
    }

    if (part.type === 'tool-planLite') {
      if (part.state === 'input-streaming' || part.state === 'input-available') {
        return (
          <div className="tool-pending" key={index}>
            <span className="spinner" aria-hidden="true" />
            Building your source-backed Plan Lite…
          </div>
        );
      }

      if (part.state === 'output-error') {
        return (
          <p className="error-copy" key={index}>
            Plan Lite could not be generated: {part.errorText}
          </p>
        );
      }

      if (part.state === 'output-available') {
        const result = PlanLiteResultSchema.safeParse(part.output);
        return result.success ? (
          <PlanLiteCard
            key={index}
            result={result.data}
            onSelectLocation={onSelectLocation}
          />
        ) : (
          <p className="error-copy" key={index}>
            Plan Lite returned an invalid result.
          </p>
        );
      }
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

function LionAvatar({
  animated = false,
  featured = false,
}: {
  animated?: boolean;
  featured?: boolean;
}) {
  return (
    <div
      className={`mascot-avatar${featured ? ' mascot-avatar-featured' : ''}${animated ? ' mascot-avatar-animated' : ''}`}
      role="img"
      aria-label="Lion Copilot"
    >
      <span aria-hidden="true">🦁</span>
      <i aria-hidden="true" />
    </div>
  );
}

export default function Home() {
  const { messages, sendMessage, status, stop, error } =
    useChat<MainAgentUIMessage>();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [activePanel, setActivePanel] = useState<UtilityPanel | null>(null);
  const latestResult = useMemo(() => findLatestToolResult(messages), [messages]);
  const contextResult = latestResult ?? (messages.length === 0 ? DEMO_RESULT : null);

  function selectLocation(locationId: string) {
    setSelectedLocationId(locationId);
    setActivePanel('context');
  }

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

  useEffect(() => {
    if (latestResult) setActivePanel('context');
  }, [latestResult]);

  useEffect(() => {
    if (!activePanel) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setActivePanel(null);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activePanel]);

  return (
    <main className={`app-shell${activePanel ? ' drawer-open' : ''}`}>
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
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="empty-mascot-stage">
                  <LionAvatar featured />
                  <span className="empty-mascot-shadow" aria-hidden="true" />
                </div>
                <p>What can I help you find at NTU?</p>
              </div>
            ) : (
              messages.map((message, messageIndex) => {
                const isAssistant = message.role === 'assistant';

                return (
                  <div
                    className={`message-row ${message.role}-row`}
                    key={message.id}
                  >
                    {isAssistant ? (
                      <LionAvatar animated={messageIndex === messages.length - 1} />
                    ) : null}
                    <article className={`message ${message.role}-message`}>
                      <span className="message-label">
                        {message.role === 'user' ? 'You' : 'Copilot'}
                      </span>
                      <MessageParts
                        message={message}
                        onSelectLocation={selectLocation}
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

        <nav className="view-switcher" aria-label="Workspace panels">
          <button
            className={activePanel === 'plan' ? 'active' : ''}
            type="button"
            aria-pressed={activePanel === 'plan'}
            onClick={() => setActivePanel('plan')}
          >
            <span aria-hidden="true">✓</span>
            <strong>Plan</strong>
          </button>
          <button
            className={activePanel === 'context' ? 'active' : ''}
            type="button"
            aria-pressed={activePanel === 'context'}
            onClick={() => setActivePanel('context')}
          >
            <span aria-hidden="true">⌖</span>
            <strong>Evidence &amp; Map</strong>
            {contextResult ? (
              <i aria-label={`${contextResult.sources.length} sources`}>
                {contextResult.sources.length}
              </i>
            ) : null}
          </button>
        </nav>
      </div>

      <button
        className={`drawer-backdrop${activePanel ? ' visible' : ''}`}
        type="button"
        aria-label="Close side panel"
        tabIndex={activePanel ? 0 : -1}
        onClick={() => setActivePanel(null)}
      />

      <aside
        className={`utility-drawer${activePanel ? ' open' : ''}`}
        aria-label="Plan and context drawer"
        aria-hidden={!activePanel}
      >
        <header className="drawer-header">
          <div className="drawer-tabs" role="tablist" aria-label="Drawer views">
            <button
              className={activePanel === 'plan' ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={activePanel === 'plan'}
              onClick={() => setActivePanel('plan')}
            >
              Plan Lite
            </button>
            <button
              className={activePanel === 'context' ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={activePanel === 'context'}
              onClick={() => setActivePanel('context')}
            >
              Evidence &amp; Map
            </button>
          </div>
          <button
            className="drawer-close"
            type="button"
            aria-label="Close side panel"
            onClick={() => setActivePanel(null)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="drawer-stage">
          {activePanel === 'plan' ? (
            <section className="drawer-view drawer-plan" role="tabpanel">
              <div className="drawer-intro">
                <span className="eyebrow">Personalize locally</span>
                <h2>Shape your first month.</h2>
                <p>
                  Choose only what matters now. Your checklist will return to
                  the chat, with sources and map links attached.
                </p>
              </div>
              <PlanLiteStarter
                disabled={status === 'submitted' || status === 'streaming'}
                onGenerate={profile => {
                  setActivePanel(null);
                  return sendMessage({ text: formatProfileRequest(profile) });
                }}
              />
            </section>
          ) : null}

          {activePanel === 'context' ? (
            <section className="drawer-view drawer-context" role="tabpanel">
              <ContextPanel
                result={contextResult}
                selectedLocationId={selectedLocationId}
                onSelectLocation={selectLocation}
              />
            </section>
          ) : null}
        </div>
      </aside>
    </main>
  );
}
