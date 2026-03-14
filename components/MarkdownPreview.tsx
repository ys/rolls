"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Compact inline rendering for small displays
          p: ({ node, ...props }) => (
            <span style={{ color: "var(--text-secondary)" }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <span style={{ color: "var(--text-secondary)" }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <span style={{ color: "var(--text-secondary)" }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <span style={{ color: "var(--text-secondary)" }} {...props}>• </span>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold" style={{ color: "var(--text-primary)" }} {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" style={{ color: "var(--text-secondary)" }} {...props} />
          ),
          code: ({ node, ...props }) => (
            <code
              className="px-1 rounded text-xs font-mono"
              style={{ backgroundColor: "var(--bg)", color: "var(--accent)" }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
