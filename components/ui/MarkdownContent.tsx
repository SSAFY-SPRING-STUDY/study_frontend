"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 mt-8 border-b border-neutral-200 pb-2 text-2xl font-bold text-neutral-900 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-6 text-xl font-semibold text-neutral-900">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-neutral-900">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold text-neutral-900">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 text-[15px] leading-relaxed text-neutral-800">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc pl-6 text-neutral-800">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal pl-6 text-neutral-800">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-1 text-[15px] text-neutral-800">{children}</li>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm text-neutral-900">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg bg-neutral-100 p-4 text-sm text-neutral-900">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-700">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-neutral-900">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-neutral-900 underline hover:text-neutral-600"
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
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-neutral-300 bg-neutral-100 px-3 py-2 text-left font-semibold text-neutral-900">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-neutral-300 px-3 py-2 text-neutral-800">{children}</td>
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="text-neutral-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
