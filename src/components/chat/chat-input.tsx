import { useState, type FormEvent } from 'react';

type ChatInputProps = {
  status: string;
  onSubmit: (text: string) => void;
  onStop: () => void;
};

export function ChatInput({ status, onSubmit, onStop }: ChatInputProps) {
  const [text, setText] = useState('');
  const isRunning = status === 'streaming' || status === 'submitted';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = text.trim();

    if (!query || isRunning) return;

    onSubmit(query);
    setText('');
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <div className="composer-heading">
        <label htmlFor="chat-query">Ask about starting at NTU</label>
        <span>Source-aware answers</span>
      </div>
      <div className="composer-row">
        <input
          id="chat-query"
          value={text}
          maxLength={300}
          onChange={event => setText(event.target.value)}
          placeholder="Ask about orientation, campus services, or places…"
          disabled={isRunning}
        />
        {isRunning ? (
          <button className="secondary-button" type="button" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!text.trim()}>
            <span>Ask</span>
            <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>
    </form>
  );
}
