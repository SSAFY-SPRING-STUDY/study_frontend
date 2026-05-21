"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 mt-8 pb-2 text-2xl font-bold text-[var(--on-surface)] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-6 text-xl font-semibold text-[var(--on-surface)]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--on-surface)]">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold text-[var(--on-surface)]">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 text-[15px] leading-relaxed text-[var(--on-surface)]/85">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc pl-6 text-[var(--on-surface)]/85">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal pl-6 text-[var(--on-surface)]/85">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-1 text-[15px] text-[var(--on-surface)]/85">{children}</li>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-[var(--surface-container-low)] px-1.5 py-0.5 font-mono text-sm text-[var(--on-surface)]">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-[var(--surface-container-high)] p-4 text-sm text-[var(--on-surface)]">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-3 border-l-4 border-[var(--primary)]/30 bg-[var(--surface-container-low)] pl-4 py-2 italic text-[var(--on-surface)]/75 rounded-r-lg">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[var(--on-surface)]">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-[var(--primary)] underline decoration-[var(--primary)]/30 hover:decoration-[var(--primary)] transition-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) => {
    const srcStr = typeof src === "string" ? src : undefined;
    return srcStr ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={srcStr} alt={alt ?? ""} className="my-3 max-w-full rounded" />
    ) : null;
  },
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="mb-3 overflow-x-auto rounded-xl bg-[var(--surface-container-lowest)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="bg-[var(--surface-container-low)] px-3 py-2 text-left font-semibold text-[var(--on-surface)]">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 text-[var(--on-surface)]/80">{children}</td>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="hover:bg-[var(--surface-container-low)] transition-colors">{children}</tr>
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="ui-prose text-[var(--on-surface)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
