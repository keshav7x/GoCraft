import type { LessonDetail, ParsedBlock } from "@/app/lib/curriculum/types";
import { visualBlocks, visualBlockKind, visualBlockLabel } from "@/app/lib/curriculum/visuals";

/**
 * Learning context handed to Pico on every question: where the student
 * is, what the lesson covers, and what they can see right now.
 * Everything here is derived from the already-parsed lesson payload —
 * no network, no server contract.
 */
export type PicoContext = {
  moduleTitle: string;
  moduleNo: number;
  lessonTitle: string;
  lessonDescription: string | null;
  objectives: string[];
  /** h2/h3 section titles, in author order. */
  headings: string[];
  /** Flattened lesson prose, collapsed and capped — safe to quote from. */
  textDigest: string;
  /** Visualizations currently visible to the student. */
  visuals: { kind: string; title: string }[];
  codeLanguages: string[];
  checks: { quiz: number; challenge: number; exercise: number };
  challengeTitles: string[];
};

type RichNode = {
  kind?: string;
  level?: number;
  children?: Array<{ text?: string }>;
  items?: Array<Array<{ text?: string }>>;
};

function inlineText(nodes: Array<{ text?: string }> | undefined): string {
  return (nodes ?? []).map((n) => n?.text ?? "").join("");
}

function richTextParts(nodes: unknown[]): { headings: string[]; prose: string[] } {
  const headings: string[] = [];
  const prose: string[] = [];
  for (const raw of nodes) {
    const node = raw as RichNode;
    if (!node || typeof node !== "object") continue;
    if (node.kind === "heading") {
      const t = inlineText(node.children).trim();
      if ((node.level ?? 2) <= 3 && t) headings.push(t);
      continue;
    }
    if (
      node.kind === "paragraph" ||
      node.kind === "callout" ||
      node.kind === "bullet_list" ||
      node.kind === "numbered_list"
    ) {
      const t = inlineText(node.children).trim();
      if (t) prose.push(t);
      continue;
    }
    if (node.kind === "list") {
      for (const item of node.items ?? []) {
        const t = inlineText(item).trim();
        if (t) prose.push(t);
      }
    }
  }
  return { headings, prose };
}

export function buildPicoContext(
  detail: LessonDetail,
  blocks: ParsedBlock[],
): PicoContext {
  const { lesson, module } = detail;

  const headings: string[] = [];
  const prose: string[] = [];
  const codeLanguages = new Set<string>();
  const challengeTitles: string[] = [];
  let quiz = 0;
  let exercise = 0;

  for (const { payload } of blocks) {
    if (!payload) continue;
    switch (payload.type) {
      case "rich_text": {
        const parts = richTextParts(payload.content.nodes as unknown[]);
        headings.push(...parts.headings);
        prose.push(...parts.prose);
        break;
      }
      case "code":
        codeLanguages.add(payload.content.language);
        break;
      case "code_playground":
        codeLanguages.add(payload.content.language);
        break;
      case "quiz":
      case "knowledge_check":
        quiz += 1;
        break;
      case "challenge":
        challengeTitles.push(payload.content.title);
        break;
      case "exercise":
        exercise += 1;
        break;
      default:
        break;
    }
  }

  const textDigest = prose
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);

  return {
    moduleTitle: module?.title ?? "Go curriculum",
    moduleNo: module?.moduleNo ?? 0,
    lessonTitle: lesson.title,
    lessonDescription: lesson.description ?? null,
    objectives: (lesson.learningObjectives as string[] | null) ?? [],
    headings: headings.slice(0, 10),
    textDigest,
    visuals: visualBlocks(blocks).map((b) => ({
      kind: visualBlockKind(b),
      title: visualBlockLabel(b),
    })),
    codeLanguages: [...codeLanguages],
    checks: { quiz, challenge: challengeTitles.length, exercise },
    challengeTitles,
  };
}

/** Best-effort digest quote around a token match — fully local, no model. */
export function quoteDigest(digest: string, around: string, radius = 160): string | null {
  if (!digest) return null;
  const idx = digest.toLowerCase().indexOf(around.toLowerCase());
  if (idx === -1) {
    return digest.slice(0, radius * 2).trim();
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(digest.length, idx + around.length + radius);
  return `${start > 0 ? "…" : ""}${digest.slice(start, end).trim()}${end < digest.length ? "…" : ""}`;
}
