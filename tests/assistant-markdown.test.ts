import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  AssistantMarkdown,
  normalizeAssistantMarkdown,
} from '@/components/chat/assistant-markdown';

function render(source: string) {
  return renderToStaticMarkup(createElement(AssistantMarkdown, { source }));
}

describe('assistant Markdown rendering', () => {
  it('renders emphasis, lists, GFM tables, and safe external links', () => {
    const markup = render(`**Onboarding**

- Submit documents
- Attend orientation

| Step | Note |
| --- | --- |
| First week | Meet your adviser |

[NTU](https://www.ntu.edu.sg/)`);

    expect(markup).toContain('<strong>Onboarding</strong>');
    expect(markup).toContain('<ul>');
    expect(markup).toContain('<table>');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noreferrer noopener"');
  });

  it('turns model-emitted br tags into visible line breaks', () => {
    expect(normalizeAssistantMarkdown('First<br>Second<BR />Third')).toBe(
      'First  \nSecond  \nThird',
    );
    expect(render('First<br>Second')).toContain('First<br/>\nSecond');
  });

  it('does not execute or render raw HTML from assistant text', () => {
    const markup = render(
      'Before <script>alert("unsafe")</script> [unsafe](javascript:alert(1)) after',
    );

    expect(markup).not.toContain('<script>');
    expect(markup).toContain('&lt;script&gt;');
    expect(markup).not.toContain('href="javascript:');
    expect(markup).toContain('Before');
    expect(markup).toContain('after');
  });
});
