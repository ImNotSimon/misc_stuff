/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-unstable-nested-components */
import { useMemo } from 'react';

import { useIsSmallScreen } from '@/hooks/displayHooks';
import dynamic from 'next/dynamic';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import darkTheme from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
});

const languageDetectionRegex = /language-(\w+)/;

type MarkdownProps = {
  children: string;
};

function MarkdownComponent({ children }: MarkdownProps) {
  const isSmallScreen = useIsSmallScreen();

  return (
    <ReactMarkdown
      components={{
        p: ({ children, ...props }) => (
          <p
            {...props}
            style={{
              fontFamily: 'var(--inter-font)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              fontSize: isSmallScreen ? 14 : 16,
              wordBreak: 'break-word',
            }}
          >
            {children}
          </p>
        ),
        ul: ({ children, ...props }) => (
          <ul
            style={{
              lineHeight: '18px',
              paddingLeft: '16px',
              fontSize: isSmallScreen ? 14 : 16,
            }}
            {...props}
          >
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol
            style={{
              lineHeight: '18px',
              paddingLeft: '16px',
              fontSize: isSmallScreen ? 14 : 16,
            }}
            {...props}
          >
            {children}
          </ol>
        ),
        pre: (props) => {
          const reactElement = props.children as React.ReactElement;
          const hasCodeBlock = reactElement.props.node.tagName === 'code';

          // Setting the max width of the <pre> element prevents text overflow
          // horizontally.
          // There isn't a good way of limiting the max width of the <pre> element below such that
          // it doesn't exceed the parent's width, but also allow the parent's width to grow
          // or shrink to fit the chat content as needed.
          // The alternative requires sizing the parents arbitrarily, so the <pre> element is also sized
          // to fit the parent, but that removes the requirement around parent's width based on content.
          const maxWidth: string = isSmallScreen
            ? 'calc(100vw - 90px)'
            : 'calc(100vw - 150px)';

          if (hasCodeBlock) {
            const languageMatch = languageDetectionRegex.exec(
              reactElement.props.className || '',
            );
            const { children } = reactElement.props;
            if (!children) {
              return null;
            }
            return (
              <SyntaxHighlighter
                style={darkTheme}
                customStyle={{ margin: 0, overflow: 'hidden', maxWidth }}
                language={languageMatch ? languageMatch[1] : 'javascript'}
                wrapLongLines
              >
                {String(children).trimEnd()}
              </SyntaxHighlighter>
            );
          }
          return <pre>{props.children}</pre>;
        },
        code: (props) => {
          const style = darkTheme[`pre[class*="language-"]`];
          const codeStyle = {
            background: style ? style.background : 'transparent',
            color: style ? style.color : 'inherited',
            borderRadius: style ? style.borderRadius : 'none',
            fontSize: isSmallScreen ? 14 : 16,
            padding: '0.1em',
          };
          return <code style={codeStyle}>{props.children}</code>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function removeExtraEmptyLines(markdown: string) {
  const regex =
    // eslint-disable-next-line no-useless-escape
    /((?:\d+\.|\-|\*)\s[^\n]*)(\s{2,}|\n\s*|\s*\n)(?=(?:\d+\.|\-|\*))/g;
  return markdown?.replace(regex, '$1\n');
}

export function Markdown({ children }: MarkdownProps) {
  const formattedChildren = useMemo(
    () => removeExtraEmptyLines(children),
    [children],
  );
  return (
    <div className="prose dark:prose-invert">
      <MarkdownComponent>{formattedChildren}</MarkdownComponent>
    </div>
  );
}
