'use client';

import { useMemo } from 'react';
import { useChat } from '@ai-sdk/react';

import type { MainAgentUIMessage } from '@/agent/main-agent';
import { ChatInput } from '@/components/chat/chat-input';
import { ContextPanel } from '@/components/context-panel/context-panel';
import { SourceList } from '@/components/sources/source-list';
import { ToolResultSchema, type ToolResult } from '@/contracts/tool-result';

const DEMO_RESULT: ToolResult = {
  content:
    'Synthetic mock guidance: review the official NTU website for your onboarding requirements. This preview is not verified NTU policy.',
  sources: [
    {
      id: 'ntu-homepage-preview',
      title: 'NTU Singapore official website (illustrative source)',
      url: 'https://www.ntu.edu.sg/',
      publisher: 'Nanyang Technological University',
      published_at: null,
      retrieved_at: '2026-09-11T00:00:00.000Z',
      official: true,
    },
  ],
  locations: [],
  verification: {
    status: 'needs_review',
    checks: ['source_present', 'url_valid', 'official_domain_checked'],
    warnings: ['Synthetic preview content has not been manually verified.'],
    reviewed_at: '2026-09-11T00:00:00.000Z',
  },
};

function findLatestToolResult(messages: MainAgentUIMessage[]): ToolResult | null {
  for (const message of messages.toReversed()) {
    for (const part of message.parts.toReversed()) {
      if (part.type === 'tool-mockNtuInfo' && part.state === 'output-available') {
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
      {result.verification.warnings.map(warning => (
        <p className="warning-copy" key={warning}>
          {warning}
        </p>
      ))}
    </div>
  );
}

function MessageParts({ message }: { message: MainAgentUIMessage }) {
  return message.parts.map((part, index) => {
    if (part.type === 'text') {
      return <p key={index}>{part.text}</p>;
    }

    if (part.type === 'step-start') {
      return <div className="step-divider" key={index} />;
    }

    if (part.type === 'tool-mockNtuInfo') {
      if (part.state === 'input-streaming' || part.state === 'input-available') {
        return (
          <div className="tool-pending" key={index}>
            <span className="spinner" aria-hidden="true" />
            Running Mock NTU Info Tool…
          </div>
        );
      }

      if (part.state === 'output-error') {
        return (
          <p className="error-copy" key={index}>
            The Mock Tool could not return a result: {part.errorText}
          </p>
        );
      }

      if (part.state === 'output-available') {
        const result = ToolResultSchema.safeParse(part.output);
        return result.success ? (
          <ToolResultCard key={index} result={result.data} />
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
  const latestResult = useMemo(() => findLatestToolResult(messages), [messages]);
  const contextResult = latestResult ?? (messages.length === 0 ? DEMO_RESULT : null);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">N</div>
        <div>
          <span className="eyebrow">Ask · verify · orient</span>
          <h1>NTU Freshman AI Copilot</h1>
        </div>
        <span className="mock-badge">Mock data only</span>
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
                  <ToolResultCard result={DEMO_RESULT} />
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
                  <MessageParts message={message} />
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

        <ContextPanel result={contextResult} />
      </div>
    </main>
  );
}
