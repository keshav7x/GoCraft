import { cn } from "@/app/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Minimal Go syntax highlighter. No external highlighter is installed */
/* in this project, so this tokenizer covers comments, strings,        */
/* keywords, numbers, builtin types and exported identifiers. It is a  */
/* presentation layer only — never executed.                           */
/* ------------------------------------------------------------------ */

const KEYWORDS = new Set([
  "break", "case", "chan", "const", "continue", "default", "defer", "else",
  "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
  "map", "package", "range", "return", "select", "struct", "switch", "type",
  "var",
]);

const BUILTIN_TYPES = new Set([
  "bool", "byte", "complex64", "complex128", "error", "float32", "float64",
  "int", "int8", "int16", "int32", "int64", "rune", "string", "uint",
  "uint8", "uint16", "uint32", "uint64", "uintptr", "any", "comparable",
]);

const BUILTIN_FUNCS = new Set([
  "append", "cap", "clear", "close", "complex", "copy", "delete", "imag",
  "len", "make", "max", "min", "new", "panic", "print", "println", "real",
  "recover",
]);

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*')|\b(0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)\b|\b([A-Za-z_]\w*)\b/g;

type Piece = { text: string; cls: string };

function tokenize(code: string): Piece[] {
  const pieces: Piece[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(code)) !== null) {
    if (match.index > lastIndex) {
      pieces.push({ text: code.slice(lastIndex, match.index), cls: "" });
    }

    const [full, comment, str, num, word] = match;
    if (comment) {
      pieces.push({ text: full, cls: "text-ink-4 italic" });
    } else if (str) {
      pieces.push({ text: full, cls: "text-emerald-600 dark:text-emerald-400" });
    } else if (num) {
      pieces.push({ text: full, cls: "text-amber-600 dark:text-amber-400" });
    } else if (word) {
      if (KEYWORDS.has(word)) {
        pieces.push({ text: full, cls: "text-indigo-600 dark:text-indigo-400 font-medium" });
      } else if (BUILTIN_TYPES.has(word)) {
        pieces.push({ text: full, cls: "text-cyan-700 dark:text-cyan-400" });
      } else if (BUILTIN_FUNCS.has(word)) {
        pieces.push({ text: full, cls: "text-violet-600 dark:text-violet-400" });
      } else if (/^[A-Z]/.test(word)) {
        pieces.push({ text: full, cls: "text-sky-700 dark:text-sky-300" });
      } else {
        pieces.push({ text: full, cls: "" });
      }
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < code.length) {
    pieces.push({ text: code.slice(lastIndex), cls: "" });
  }

  return pieces;
}

type CodeBlockProps = {
  code: string;
  filename?: string;
  className?: string;
  showCopy?: boolean;
};

export function GoCodeBlock({
  code,
  filename,
  className,
  showCopy = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const trimmed = code.replace(/\s+$/, "");
  const pieces = tokenize(trimmed);

  async function copy() {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure
      className={cn(
        "group overflow-hidden rounded-xl border border-line bg-inset",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-line bg-surface-2/60 px-4 py-2">
        <span className="font-mono text-[11px] text-ink-3">
          {filename ?? "main.go"}
        </span>
        {showCopy ? (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy code"}
            className="gc-focus-ring rounded-md p-1 text-ink-4 opacity-0 transition hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        ) : null}
      </figcaption>
      <pre className="gc-scrollbar overflow-x-auto px-4 py-3.5 text-[12.5px] leading-6">
        <code className="font-mono">
          {pieces.map((piece, index) => (
            <span key={index} className={piece.cls || undefined}>
              {piece.text}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
