"use client";

import { useRef } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className = "",
  style = {},
  showToolbar = true,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const textBeforeCursor = value.substring(0, start);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check for unordered list
      const unorderedMatch = currentLine.match(/^(\s*)[-*+]\s+/);
      if (unorderedMatch) {
        e.preventDefault();
        // If line is just the bullet with no content, remove it
        if (currentLine.trim().match(/^[-*+]\s*$/)) {
          const lineStart = start - currentLine.length;
          onChange(value.substring(0, lineStart) + value.substring(start));
          setTimeout(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Continue the list
          const indent = unorderedMatch[1];
          const bullet = currentLine.trim()[0];
          onChange(value.substring(0, start) + `\n${indent}${bullet} ` + value.substring(start));
          setTimeout(() => {
            const newPos = start + indent.length + 3;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
        return;
      }

      // Check for ordered list
      const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s+/);
      if (orderedMatch) {
        e.preventDefault();
        // If line is just the number with no content, remove it
        if (currentLine.trim().match(/^\d+\.\s*$/)) {
          const lineStart = start - currentLine.length;
          onChange(value.substring(0, lineStart) + value.substring(start));
          setTimeout(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Continue the list with next number
          const indent = orderedMatch[1];
          const nextNum = parseInt(orderedMatch[2]) + 1;
          onChange(value.substring(0, start) + `\n${indent}${nextNum}. ` + value.substring(start));
          setTimeout(() => {
            const newPos = start + indent.length + nextNum.toString().length + 3;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
        return;
      }

      // Check for checklist
      const checklistMatch = currentLine.match(/^(\s*)[-*+]\s+\[([ x])\]\s+/);
      if (checklistMatch) {
        e.preventDefault();
        // If line is just the checkbox with no content, remove it
        if (currentLine.trim().match(/^[-*+]\s+\[([ x])\]\s*$/)) {
          const lineStart = start - currentLine.length;
          onChange(value.substring(0, lineStart) + value.substring(start));
          setTimeout(() => {
            textarea.setSelectionRange(lineStart, lineStart);
          }, 0);
        } else {
          // Continue the checklist
          const indent = checklistMatch[1];
          const bullet = currentLine.trim()[0];
          onChange(value.substring(0, start) + `\n${indent}${bullet} [ ] ` + value.substring(start));
          setTimeout(() => {
            const newPos = start + indent.length + 7;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
        return;
      }
    }

    // Tab for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Remove indentation
        const textBefore = value.substring(0, start);
        const lastNewline = textBefore.lastIndexOf("\n");
        const lineStart = lastNewline + 1;
        const line = value.substring(lineStart, end);
        if (line.startsWith("  ")) {
          onChange(value.substring(0, lineStart) + line.substring(2) + value.substring(end));
          setTimeout(() => {
            textarea.setSelectionRange(Math.max(lineStart, start - 2), end - 2);
          }, 0);
        }
      } else {
        // Add indentation
        onChange(value.substring(0, start) + "  " + value.substring(end));
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`flex-1 w-full resize-none outline-none ${className}`}
        style={style}
      />

      {/* Markdown Toolbar */}
      {showToolbar && (
      <div className="flex gap-1 pt-2 border-t" style={{ borderColor: "var(--darkroom-border)" }}>
        <button
          onClick={() => insertMarkdown("**", "**")}
          className="px-2 py-1 text-xs font-bold transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown("*", "*")}
          className="px-2 py-1 text-xs italic transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => insertMarkdown("`", "`")}
          className="px-2 py-1 text-xs font-mono transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Code"
        >
          &lt;/&gt;
        </button>
        <div className="w-px h-5 self-center" style={{ backgroundColor: "var(--darkroom-border)" }} />
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const textBefore = value.substring(0, start);
            const isNewLine = textBefore.endsWith("\n") || textBefore === "";
            onChange(value.substring(0, start) + (isNewLine ? "" : "\n") + "- " + value.substring(start));
            setTimeout(() => {
              const newPos = start + (isNewLine ? 2 : 3);
              textarea.setSelectionRange(newPos, newPos);
              textarea.focus();
            }, 0);
          }}
          className="px-2 py-1 text-xs transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Bullet list"
        >
          •
        </button>
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const textBefore = value.substring(0, start);
            const isNewLine = textBefore.endsWith("\n") || textBefore === "";
            onChange(value.substring(0, start) + (isNewLine ? "" : "\n") + "1. " + value.substring(start));
            setTimeout(() => {
              const newPos = start + (isNewLine ? 3 : 4);
              textarea.setSelectionRange(newPos, newPos);
              textarea.focus();
            }, 0);
          }}
          className="px-2 py-1 text-xs transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Numbered list"
        >
          1.
        </button>
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const textBefore = value.substring(0, start);
            const isNewLine = textBefore.endsWith("\n") || textBefore === "";
            onChange(value.substring(0, start) + (isNewLine ? "" : "\n") + "- [ ] " + value.substring(start));
            setTimeout(() => {
              const newPos = start + (isNewLine ? 6 : 7);
              textarea.setSelectionRange(newPos, newPos);
              textarea.focus();
            }, 0);
          }}
          className="px-2 py-1 text-xs transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Checklist"
        >
          ☐
        </button>
        <div className="w-px h-5 self-center" style={{ backgroundColor: "var(--darkroom-border)" }} />
        <button
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const textBefore = value.substring(0, start);
            const isNewLine = textBefore.endsWith("\n") || textBefore === "";
            onChange(value.substring(0, start) + (isNewLine ? "" : "\n") + "# " + value.substring(start));
            setTimeout(() => {
              const newPos = start + (isNewLine ? 2 : 3);
              textarea.setSelectionRange(newPos, newPos);
              textarea.focus();
            }, 0);
          }}
          className="px-2 py-1 text-xs transition-colors hover:text-amber-400"
          style={{ color: "var(--darkroom-text-tertiary)" }}
          title="Heading"
        >
          H
        </button>
      </div>
      )}
    </div>
  );
}
