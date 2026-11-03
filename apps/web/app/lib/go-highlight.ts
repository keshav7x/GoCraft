/* Lightweight Go syntax tokenizer.
   Two flavors from the same scanner:
   - tokenizeGo(): semantic tokens { kind, value } for the lesson renderer.
   - highlightGo(): editor tokens { text, cls } (legacy shape kept for
     ProblemWorkspace). Pure functions — no dependencies, no execution. */

export type GoTokenKind =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "func"
  | "builtin"
  | "ident"
  | "exported"
  | "punct"
  | "plain";

export type GoToken = { kind: GoTokenKind; value: string };

export type EditorToken = { text: string; cls: string };

const CONTROL = new Set([
  "break",
  "case",
  "chan",
  "continue",
  "default",
  "defer",
  "else",
  "go",
  "goto",
  "if",
  "range",
  "return",
  "select",
  "switch",
]);

const KEYWORDS = new Set([
  "const",
  "fallthrough",
  "func",
  "import",
  "interface",
  "map",
  "package",
  "struct",
  "type",
  "var",
]);

const TYPES = new Set([
  "any",
  "bool",
  "byte",
  "comparable",
  "complex64",
  "complex128",
  "error",
  "float32",
  "float64",
  "int",
  "int8",
  "int16",
  "int32",
  "int64",
  "rune",
  "string",
  "uint",
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "uintptr",
]);

const LITERALS = new Set(["true", "false", "nil", "iota"]);

const BUILTINS = new Set([
  "append",
  "cap",
  "clear",
  "close",
  "copy",
  "delete",
  "len",
  "make",
  "max",
  "min",
  "new",
  "panic",
  "print",
  "println",
  "recover",
]);

const CLS = {
  comment: "text-ink-faint italic",
  string: "text-blue-500",
  number: "text-blue-500",
  control: "text-blue-600",
  keyword: "text-blue-600",
  type: "text-blue-700",
  func: "text-ink font-medium",
  literal: "text-blue-600",
  builtin: "text-blue-700",
  ident: "text-ink",
  exported: "text-ink",
  punct: "text-ink-muted",
} as const;

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'[^'\\\n]*'|`[^`]*`)|(\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)|([A-Za-z_]\w*)|([^\sA-Za-z0-9_])/g;

function nextNonSpaceIndex(source: string, from: number): number {
  let i = from;
  while (i < source.length && /\s/.test(source[i] ?? "")) i += 1;
  return i;
}

export function tokenizeGo(source: string): GoToken[] {
  const tokens: GoToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(source)) !== null) {
    if (match.index > last) {
      tokens.push({ kind: "plain", value: source.slice(last, match.index) });
    }

    const value = match[0];
    const end = TOKEN_RE.lastIndex;
    let kind: GoTokenKind;

    if (match[1]) {
      kind = "comment";
    } else if (match[2]) {
      kind = "string";
    } else if (match[3]) {
      kind = "number";
    } else if (match[4]) {
      const following = source[nextNonSpaceIndex(source, end)];

      if (CONTROL.has(value) || KEYWORDS.has(value) || LITERALS.has(value)) {
        kind = "keyword";
      } else if (TYPES.has(value)) {
        kind = "type";
      } else if (BUILTINS.has(value)) {
        kind = "builtin";
      } else if (following === "(") {
        kind = "func";
      } else if (/^[A-Z]/.test(value)) {
        kind = "exported";
      } else {
        kind = "ident";
      }
    } else {
      kind = "punct";
    }

    tokens.push({ kind, value });
    last = end;
  }

  if (last < source.length) {
    tokens.push({ kind: "plain", value: source.slice(last) });
  }

  return tokens;
}

/** Editor variant: semantic kinds mapped onto editor color classes. */
export function highlightGo(source: string): EditorToken[] {
  return tokenizeGo(source).map(({ kind, value }) => {
    if (kind === "plain") {
      // Whitespace/gap tokens stay unpainted, as before.
      return { text: value, cls: "" };
    }
    let cls: string;
    switch (kind) {
      case "comment":
        cls = CLS.comment;
        break;
      case "string":
        cls = CLS.string;
        break;
      case "number":
        cls = CLS.number;
        break;
      case "keyword":
        cls = CLS.keyword;
        break;
      case "type":
        cls = CLS.type;
        break;
      case "func":
        cls = CLS.func;
        break;
      case "builtin":
        cls = CLS.builtin;
        break;
      case "punct":
        cls = CLS.punct;
        break;
      case "exported":
        cls = CLS.exported;
        break;
      default:
        cls = CLS.ident;
    }
    return { text: value, cls };
  });
}
