'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';

import curatedLocationData from '../../data/curated/locations/ntu-food-locations.json';
import type { MainAgentUIMessage } from '@/agent/main-agent';
import { ACRONYM_COUNT } from '@/components/acronyms/acronym-directory';
import { AcronymsPanel } from '@/components/acronyms/acronyms-panel';
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

type UtilityPanel = 'plan' | 'context' | 'acronyms';

type TourAnchorRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

const TOUR_STORAGE_KEY = 'ntu-freshman-copilot-tour-v1';

const TOUR_STEPS = [
  {
    target: 'chat',
    placement: 'inside' as const,
    title: 'Your conversation starts here',
    copy: 'Answers stay in this main space, with sources and useful campus details attached.',
  },
  {
    target: 'composer',
    placement: 'above' as const,
    title: 'Ask one clear question',
    copy: 'Try orientation, campus services, food, study spaces, or anything you need next.',
  },
  {
    target: 'plan',
    placement: 'left' as const,
    title: 'Build a personal Plan Lite',
    copy: 'Choose a few local preferences and get a source-backed first-month checklist.',
  },
  {
    target: 'context',
    placement: 'left' as const,
    title: 'Open the evidence and map',
    copy: 'Sources, verification notes, and campus locations slide in only when you need them.',
  },
] as const;

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

function getTourCardPosition(
  anchor: TourAnchorRect,
  placement: (typeof TOUR_STEPS)[number]['placement'],
) {
  const gap = 18;
  const edge = 16;
  const estimatedHeight = 228;
  const width = Math.min(352, window.innerWidth - edge * 2);
  const maxLeft = window.innerWidth - width - edge;
  const maxTop = window.innerHeight - estimatedHeight - edge;
  const centeredLeft = Math.min(
    maxLeft,
    Math.max(edge, anchor.left + (anchor.width - width) / 2),
  );

  if (placement === 'inside') {
    return {
      left: Math.min(maxLeft, Math.max(edge, anchor.left + 28)),
      top: Math.min(maxTop, Math.max(edge, anchor.top + 28)),
      width,
    };
  }

  if (placement === 'left' && anchor.left - width - gap >= edge) {
    return {
      left: anchor.left - width - gap,
      top: Math.min(
        maxTop,
        Math.max(edge, anchor.top + anchor.height / 2 - estimatedHeight / 2),
      ),
      width,
    };
  }

  const aboveTop = anchor.top - estimatedHeight - gap;
  if (aboveTop >= edge) {
    return { left: centeredLeft, top: aboveTop, width };
  }

  return {
    left: centeredLeft,
    top: Math.min(maxTop, anchor.bottom + gap),
    width,
  };
}

function OnboardingTour({
  onBack,
  onClose,
  onNext,
  step,
}: {
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  step: number;
}) {
  const [anchor, setAnchor] = useState<TourAnchorRect | null>(null);
  const currentStep = TOUR_STEPS[step];

  useEffect(() => {
    function updateAnchor() {
      const element = document.querySelector<HTMLElement>(
        `[data-tour="${currentStep.target}"]`,
      );

      if (!element) return;
      const rect = element.getBoundingClientRect();
      const padding = 8;
      setAnchor({
        top: Math.max(8, rect.top - padding),
        right: Math.min(window.innerWidth - 8, rect.right + padding),
        bottom: Math.min(window.innerHeight - 8, rect.bottom + padding),
        left: Math.max(8, rect.left - padding),
        width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
        height: Math.min(window.innerHeight - 16, rect.height + padding * 2),
      });
    }

    updateAnchor();
    window.addEventListener('resize', updateAnchor);
    return () => window.removeEventListener('resize', updateAnchor);
  }, [currentStep.target]);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNext();
      if (event.key === 'ArrowLeft' && step > 0) onBack();
    }

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [onBack, onClose, onNext, step]);

  if (!anchor) return null;
  const cardPosition = getTourCardPosition(anchor, currentStep.placement);

  return (
    <div className="tour-overlay">
      <div className="tour-shade" aria-hidden="true" />
      <div
        className="tour-spotlight"
        aria-hidden="true"
        style={{
          top: anchor.top,
          left: anchor.left,
          width: anchor.width,
          height: anchor.height,
        }}
      />
      <section
        className="tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        style={cardPosition}
      >
        <button
          className="tour-skip"
          type="button"
          aria-label="Close guide"
          onClick={onClose}
        >
          ×
        </button>
        <div className="tour-copy" key={step}>
          <LionAvatar animated />
          <div>
            <span className="eyebrow">Lion guide</span>
            <h2 id="tour-title">{currentStep.title}</h2>
            <p>{currentStep.copy}</p>
          </div>
        </div>
        <footer className="tour-footer">
          <div className="tour-progress" aria-label={`Step ${step + 1} of ${TOUR_STEPS.length}`}>
            {TOUR_STEPS.map((item, index) => (
              <i className={index === step ? 'active' : ''} key={item.target} />
            ))}
          </div>
          <div className="tour-actions">
            {step > 0 ? (
              <button type="button" onClick={onBack}>
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose}>
                Skip
              </button>
            )}
            <button className="tour-next" type="button" onClick={onNext}>
              {step === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </footer>
      </section>
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
  const [tourStep, setTourStep] = useState<number | null>(null);
  const latestResult = useMemo(() => findLatestToolResult(messages), [messages]);
  const contextResult = latestResult ?? (messages.length === 0 ? DEMO_RESULT : null);

  function selectLocation(locationId: string) {
    setSelectedLocationId(locationId);
    setActivePanel('context');
  }

  useEffect(() => {
    if (
      selectedLocationId &&
      !selectedLocationId.startsWith('manual-') &&
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

  useEffect(() => {
    if (window.localStorage.getItem(TOUR_STORAGE_KEY) === 'done') return;
    const timer = window.setTimeout(() => setTourStep(0), 550);
    return () => window.clearTimeout(timer);
  }, []);

  function finishTour() {
    window.localStorage.setItem(TOUR_STORAGE_KEY, 'done');
    setTourStep(null);
  }

  function startTour() {
    setActivePanel(null);
    setTourStep(0);
  }

  function advanceTour() {
    if (tourStep === null) return;
    if (tourStep === TOUR_STEPS.length - 1) {
      finishTour();
      return;
    }
    setTourStep(tourStep + 1);
  }

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
          <div className="chat-scroll" aria-live="polite" data-tour="chat">
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
            data-tour="plan"
            onClick={() => setActivePanel('plan')}
          >
            <span aria-hidden="true">✓</span>
            <strong>Plan</strong>
          </button>
          <button
            className={activePanel === 'context' ? 'active' : ''}
            type="button"
            aria-pressed={activePanel === 'context'}
            data-tour="context"
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
          <button
            className={activePanel === 'acronyms' ? 'active' : ''}
            type="button"
            aria-pressed={activePanel === 'acronyms'}
            onClick={() => setActivePanel('acronyms')}
          >
            <span className="acronym-switcher-icon" aria-hidden="true">Aa</span>
            <strong>Acronyms</strong>
            <i aria-label={`${ACRONYM_COUNT} reviewed acronyms`}>{ACRONYM_COUNT}</i>
          </button>
          <button type="button" onClick={startTour}>
            <span aria-hidden="true">🦁</span>
            <strong>Guide</strong>
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
        aria-label="Plan, evidence and acronyms drawer"
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
            <button
              className={activePanel === 'acronyms' ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={activePanel === 'acronyms'}
              onClick={() => setActivePanel('acronyms')}
            >
              Acronyms
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
          <section
            className={`drawer-view drawer-plan ${activePanel === 'plan' ? 'active' : 'inactive'}`}
            role="tabpanel"
            aria-hidden={activePanel !== 'plan'}
          >
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

          <section
            className={`drawer-view drawer-context ${activePanel === 'context' ? 'active' : 'inactive'}`}
            role="tabpanel"
            aria-hidden={activePanel !== 'context'}
          >
            <ContextPanel
              result={contextResult}
              selectedLocationId={selectedLocationId}
              onSelectLocation={selectLocation}
            />
          </section>

          <section
            className={`drawer-view drawer-acronyms ${activePanel === 'acronyms' ? 'active' : 'inactive'}`}
            role="tabpanel"
            aria-hidden={activePanel !== 'acronyms'}
          >
            <AcronymsPanel />
          </section>
        </div>
      </aside>

      {tourStep !== null ? (
        <OnboardingTour
          step={tourStep}
          onBack={() => setTourStep(Math.max(0, tourStep - 1))}
          onNext={advanceTour}
          onClose={finishTour}
        />
      ) : null}
    </main>
  );
}
