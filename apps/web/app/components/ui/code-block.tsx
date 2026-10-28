"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";

const KEYWORDS = new Set([
  "package", "import", "func", "var", "const", "type", "struct", "interface",
  "map", "chan", "go", "defer", "return", "if", "else", "for", "range",
  "switch", "case", "default", "break", "continue", "select", "goto",
  "true", "false", "nil", "iota", "make", "new", "len", "cap", "append",
  "string", "int", "int64", "float64", "bool", "byte", "rune", "error",
]);

const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)/g;

type Piece = { text: string; className: string };

function tokenizeLine(line: string): Piece[] {
  const pieces: Piece[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > lastIndex) {
      pieces.push({ text: line.slice(lastIndex, match.index), className: "text-slate-600" });
    }

    const [full, comment, str, num, ident] = match;
    if (comment) pieces.push({ text: full, className: "italic text-slate-400" });
    else if (str) pieces.push({ text: full, className: "text-emerald-700" });
    else if (num) pieces.push({ text: full, className: "text-accent-700" });
    else if (ident) {
      if (KEYWORDS.has(ident)) pieces.push({ text: full, className: "font-semibold text-slate-950" });
      else if (/^[A-Z]/.test(ident)) pieces.push({ text: full, className: "font-medium text-[#7c3aed]" });
      else pieces.push({ text: full, className: "text-slate-700" });
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < line.length) {
    pieces.push({ text: line.slice(lastIndex), className: "text-slate-600" });
  }

  return pieces;
}

type CodeBlockProps = {
  code: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
};

export function CodeBlock({ code, filename, className, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </span>
          <span className="ml-1 font-mono text-[11px] text-slate-500">
            {filename ?? "main.go"}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto bg-white px-4 py-3.5">
        <pre className="font-mono text-[12.5px] leading-6">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="mr-4 w-6 shrink-0 select-none text-right text-slate-300">
                    {index + 1}
                  </span>
                )}
                <span className="whitespace-pre">
                  {line.length === 0
                    ? " "
                    : tokenizeLine(line).map((piece, pieceIndex) => (
                        <span key={pieceIndex} className={piece.className}>
                          {piece.text}
                        </span>
                      ))}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
