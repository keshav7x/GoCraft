import { cn } from "../../lib/utils";

const GO_KEYWORDS = new Set([
  "break", "case", "chan", "const", "continue", "default", "defer", "else",
  "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
  "map", "package", "range", "return", "select", "struct", "switch", "type", "var",
]);

const GO_TYPES = new Set([
  "bool", "byte", "complex64", "complex128", "error", "float32", "float64",
  "int", "int8", "int16", "int32", "int64", "rune", "string", "uint",
  "uint8", "uint16", "uint32", "uint64", "uintptr", "any", "comparable",
]);

const BUILTIN = new Set([
  "append", "cap", "clear", "close", "complex", "copy", "delete", "imag",
  "len", "make", "max", "min", "new", "panic", "print", "println", "real",
  "recover",
]);

type Token = { text: string; className: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (ch === undefined) break;

    if (ch === "/" && line[i + 1] === "/") {
      tokens.push({ text: line.slice(i), className: "text-ink-faint italic" });
      return tokens;
    }

    if (ch === '"' || ch === "`" || ch === "'") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\") {
          j += 2;
          continue;
        }
        if (line[j] === ch) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ text: line.slice(i, j), className: "text-blue-500" });
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9a-fA-FxXbBoO_.]/.test(line[j] ?? "")) j += 1;
      tokens.push({ text: line.slice(i, j), className: "text-blue-500" });
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j] ?? "")) j += 1;
      const word = line.slice(i, j);
      let className = "text-ink";
      if (GO_KEYWORDS.has(word)) className = "text-blue-600 font-medium";
      else if (GO_TYPES.has(word)) className = "text-blue-700";
      else if (BUILTIN.has(word)) className = "text-blue-700";
      else if (/^[A-Z]/.test(word)) className = "text-ink";
      tokens.push({ text: word, className });
      i = j;
      continue;
    }

    tokens.push({ text: ch, className: "text-ink-muted" });
    i += 1;
  }

  return tokens;
}

function highlight(code: string): Token[][] {
  return code.replace(/\t/g, "  ").split("\n").map(tokenizeLine);
}

type CodeBlockProps = {
  code: string;
  filename?: string;
  className?: string;
};

export function CodeBlock({ code, filename, className }: CodeBlockProps) {
  const lines = highlight(code);

  return (
    <figure
      className={cn(
        "group overflow-hidden rounded-xl border border-edge bg-panel",
        className,
      )}
    >
      {filename ? (
        <figcaption className="flex items-center justify-between border-b border-edge px-4 py-2">
          <span className="font-mono text-[11px] text-ink-muted">{filename}</span>
          <span className="rounded bg-panel-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Go
          </span>
        </figcaption>
      ) : null}
      <pre className="scrollbar-subtle overflow-x-auto px-4 py-3.5">
        <code className="block font-mono text-[12.5px] leading-[1.7]">
          {lines.map((tokens, lineIndex) => (
            <span key={`line-${lineIndex + 1}`} className="block">
              {tokens.map((token, tokenIndex) => (
                <span
                  key={`tok-${lineIndex}-${tokenIndex}`}
                  className={token.className}
                >
                  {token.text}
                </span>
              ))}
              {tokens.length === 0 ? " " : null}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
