/* Lightweight Go syntax tokenizer for the problem editor.
   Pure function — no dependencies, no execution. */

export type GoToken = { text: string; cls: string };

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
  punct: "text-ink-muted",
} as const;

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'[^'\\\n]*'|`[^`]*`)|(\b(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)|([A-Za-z_]\w*)|([^\sA-Za-z0-9_])/g;

export function highlightGo(source: string): GoToken[] {
  const tokens: GoToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(source)) !== null) {
    if (match.index > last) {
      tokens.push({ text: source.slice(last, match.index), cls: "" });
    }

    const text = match[0];
    let cls = "";

    if (match[1]) {
      cls = CLS.comment;
    } else if (match[2]) {
      cls = CLS.string;
    } else if (match[3]) {
      cls = CLS.number;
    } else if (match[4]) {
      let next = TOKEN_RE.lastIndex;
      while (next < source.length && /\s/.test(source[next])) next += 1;
      const following = source[next];

      if (CONTROL.has(text)) cls = CLS.control;
      else if (KEYWORDS.has(text)) cls = CLS.keyword;
      else if (LITERALS.has(text)) cls = CLS.literal;
      else if (TYPES.has(text)) cls = CLS.type;
      else if (BUILTINS.has(text)) cls = CLS.builtin;
      else if (following === "(") cls = CLS.func;
      else cls = CLS.ident;
    } else {
      cls = CLS.punct;
    }

    tokens.push({ text, cls });
    last = TOKEN_RE.lastIndex;
  }

  if (last < source.length) {
    tokens.push({ text: source.slice(last), cls: "" });
  }

  return tokens;
}
