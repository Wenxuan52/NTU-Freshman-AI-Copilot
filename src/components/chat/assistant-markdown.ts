import { createElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AssistantMarkdownProps = {
  source: string;
};

export function normalizeAssistantMarkdown(source: string) {
  return source.replace(/<br\s*\/?\s*>/gi, '  \n');
}

export function AssistantMarkdown({ source }: AssistantMarkdownProps) {
  if (!source) return null;

  return createElement(
    'div',
    { className: 'assistant-markdown' },
    createElement(
      ReactMarkdown,
      {
        remarkPlugins: [remarkGfm],
        components: {
          a: ({ children, ...props }) =>
            createElement(
              'a',
              {
                ...props,
                target: '_blank',
                rel: 'noreferrer noopener',
              },
              children,
            ),
        },
      },
      normalizeAssistantMarkdown(source),
    ),
  );
}
