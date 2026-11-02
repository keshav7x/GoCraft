"use client";

import { useState } from "react";
import type { LessonBlockPayload } from "api/schemas";
import { highlightGo, type GoToken } from "@/app/lib/go-highlight";
import { Check, Copy, Play, RotateCcw, Terminal } from "lucide-react";
import { VisualizationRenderer } from "../visualizations/VisualizationRenderer";

/* ------------------------------------------------------------------ */
/* Rich text                                                           */
/* ------------------------------------------------------------------ */

type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  href?: string;
};

function renderInlines(nodes: Inline[], keyPrefix = "i") {
  return nodes.map((n, i) => {
    let el: React.ReactNode = n.text;
    if (n.code) {
      el = (
        <code className="rounded bg-inset px-1.5 py-0.5 font-mono text-[12.5px] text-accent-ink">
          {n.text}
        </code>
      );
    }
    if (n.bold) el = <strong>{el}</strong>;
    if (n.italic) el = <em>{el}</em>;
    if (n.href) {
      el = (
        <a
          href={n.href}
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
          target="_blank"
          rel="noreferrer"
        >
          {el}
        </a>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{el}</span>;
  });
}

function RichTextView({ content }: { content: { nodes: unknown[] } }) {
  const nodes = content.nodes as Array<{
    kind: string;
    level?: number;
    ordered?: boolean;
    children?: Inline[];
    items?: Inline[][];
  }>;

  return (
    <div className="space-y-4">
      {nodes.map((node, i) => {
        if (node.kind === "heading") {
          const level = node.level ?? 2;
          const cls =
            "font-semibold tracking-tight text-ink " +
            (level === 2
              ? "text-xl"
              : level === 3
                ? "text-lg"
                : "text-[15px]");
          const children = renderInlines(node.children ?? [], `h${i}`);
          if (level === 2) return <h2 key={i} className={cls}>{children}</h2>;
          if (level === 3) return <h3 key={i} className={cls}>{children}</h3>;
          return <h4 key={i} className={cls}>{children}</h4>;
        }
        if (node.kind === "list") {
          const Tag = node.ordered ? "ol" : "ul";
          return (
            <Tag
              key={i}
              className={`list-inside space-y-1.5 text-[14.5px] leading-6 text-ink-2 ${
                node.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {(node.items ?? []).map((item, j) => (
                <li key={j}>{renderInlines(item, `l${i}-${j}`)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={i} className="text-[14.5px] leading-7 text-ink-2">
            {renderInlines(node.children ?? [], `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Code block                                                          */
/* ------------------------------------------------------------------ */

const TOKEN_CLASS: Record<GoToken["kind"], string> = {
  comment: "text-ink-faint italic",
  string: "text-success",
  number: "text-warning",
  keyword: "text-accent font-medium",
  type: "text-accent",
  builtin: "text-[#7c3aed]",
  ident: "text-ink",
  punct: "text-ink-3",
  exported: "text-[#0284c7]",
};

function GoCode({ source, highlightLines }: { source: string; highlightLines: number[] }) {
  const tokens = highlightGo(source);
  // Tokenize per line for line-number rendering
  const lines = source.split("\n");
  const highlighted = new Set(highlightLines);

  // Rebuild tokens grouped by newline
  const grouped: GoToken[][] = [[]];
  for (const t of tokens) {
    if (t.value.includes("\n")) {
      const parts = t.value.split("\n");
      parts.forEach((part, idx) => {
        if (idx > 0) grouped.push([]);
        if (part) grouped[grouped.length - 1]!.push({ ...t, value: part });
      });
    } else {
      grouped[grouped.length - 1]!.push(t);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-[13px] leading-6">
        <tbody>
          {lines.map((_, i) => {
            const lineNo = i + 1;
            const lineTokens = grouped[i] ?? [];
            return (
              <tr
                key={lineNo}
                className={highlighted.has(lineNo) ? "bg-accent-soft" : ""}
              >
                <td className="w-10 select-none border-r border-edge bg-inset px-2 text-right text-ink-faint">
                  {lineNo}
                </td>
                <td className="whitespace-pre px-3 text-ink-2">
                  {lineTokens.length > 0
                    ? lineTokens.map((t, j) => (
                        <span key={j} className={TOKEN_CLASS[t.kind] ?? ""}>
                          {t.value}
                        </span>
                      ))
                    : " "}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink"
      aria-label="Copy code"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeView({
  content,
}: {
  content: { language: string; source: string; filename?: string; highlightLines?: number[]; explanation?: string };
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
      <figcaption className="flex items-center justify-between border-b border-edge bg-inset px-3 py-1.5">
        <span className="flex items-center gap-2 font-mono text-[11.5px] text-ink-muted">
          <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-accent-ink">
            {content.language}
          </span>
          {content.filename && <span>{content.filename}</span>}
        </span>
        <CopyButton text={content.source} />
      </figcaption>
      <div className="max-h-[480px] overflow-auto">
        <GoCode
          source={content.source}
          highlightLines={content.highlightLines ?? []}
        />
      </div>
      {content.explanation && (
        <figcaption className="border-t border-edge px-4 py-2.5 text-[13px] leading-5 text-ink-muted">
          {content.explanation}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Code playground                                                     */
/* ------------------------------------------------------------------ */

function PlaygroundView({
  content,
}: {
  content: {
    language: string;
    starterCode: string;
    expectedOutput?: string;
    instructions?: string;
  };
}) {
  const [code, setCode] = useState(content.starterCode);
  const [ran, setRan] = useState(false);

  const run = () => {
    // Honest state: no execution sandbox exists on the backend.
    setRan(true);
  };

  const reset = () => {
    setCode(content.starterCode);
    setRan(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
      {content.instructions && (
        <div className="border-b border-edge px-4 py-2.5 text-[13px] leading-5 text-ink-muted">
          {content.instructions}
        </div>
      )}
      <div className="flex items-center justify-between border-b border-edge bg-inset px-3 py-1.5">
        <span className="font-mono text-[11.5px] text-ink-muted">
          {content.language} · editable
        </span>
        <div className="flex items-center gap-1">
          <CopyButton text={code} />
          <button
            type="button"
            onClick={reset}
            className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:bg-panel-muted hover:text-ink"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            type="button"
            onClick={run}
            className="focus-ring inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11.5px] font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            <Play size={12} /> Run
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setRan(false);
        }}
        spellCheck={false}
        aria-label="Editable code"
        className="block h-56 w-full resize-y bg-panel px-4 py-3 font-mono text-[13px] leading-6 text-ink-2 outline-none"
      />
      {(ran || content.expectedOutput) && (
        <div className="border-t border-edge">
          <div className="flex items-center gap-1.5 bg-inset px-3 py-1.5 font-mono text-[11px] text-ink-faint">
            <Terminal size={11} /> output
          </div>
          <pre className="overflow-x-auto px-4 py-2.5 font-mono text-[12.5px] leading-6 text-ink-2">
            {ran
              ? "Sandbox not connected — nothing was executed. Connect a code-execution service to run this snippet."
              : content.expectedOutput}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

function ComparisonView({
  content,
}: {
  content: {
    title?: string;
    sides: Array<{
      title: string;
      description?: string;
      advantages: string[];
      disadvantages: string[];
      example?: string;
    }>;
  };
}) {
  return (
    <div className="space-y-3">
      {content.title && (
        <h3 className="text-[15px] font-semibold tracking-tight text-ink">
          {content.title}
        </h3>
      )}
      <div
        className={`grid gap-3 ${content.sides.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        {content.sides.map((side, i) => (
          <div
            key={i}
            className="rounded-xl border border-edge bg-panel p-4 shadow-card"
          >
            <h4 className="text-[14px] font-semibold text-ink">{side.title}</h4>
            {side.description && (
              <p className="mt-1 text-[13px] leading-5 text-ink-muted">
                {side.description}
              </p>
            )}
            {side.advantages.length > 0 && (
              <ul className="mt-3 space-y-1">
                {side.advantages.map((a, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[13px] leading-5 text-ink-2"
                  >
                    <span className="mt-0.5 text-success">+</span>
                    {a}
                  </li>
                ))}
              </ul>
            )}
            {side.disadvantages.length > 0 && (
              <ul className="mt-2 space-y-1">
                {side.disadvantages.map((d, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[13px] leading-5 text-ink-2"
                  >
                    <span className="mt-0.5 text-danger">−</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
            {side.example && (
              <pre className="mt-3 overflow-x-auto rounded-md bg-inset px-3 py-2 font-mono text-[12px] leading-5 text-ink-2">
                {side.example}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Callout                                                             */
/* ------------------------------------------------------------------ */

const CALLOUT_TONES: Record<
  string,
  { border: string; bg: string; label: string; color: string }
> = {
  info: { border: "border-accent-border", bg: "bg-accent-soft", label: "Info", color: "text-accent-ink" },
  tip: { border: "border-success/30", bg: "bg-success-soft", label: "Tip", color: "text-success" },
  warning: { border: "border-warning/40", bg: "bg-warning-soft", label: "Warning", color: "text-warning" },
  important: { border: "border-accent-border", bg: "bg-accent-soft", label: "Important", color: "text-accent-ink" },
  common_mistake: { border: "border-danger/30", bg: "bg-danger-soft", label: "Common mistake", color: "text-danger" },
};

function CalloutView({
  content,
}: {
  content: { tone?: string; title?: string; text: string };
}) {
  const tone = CALLOUT_TONES[content.tone ?? "info"] ?? CALLOUT_TONES.info!;
  return (
    <div
      className={`rounded-xl border-l-4 ${tone.border} ${tone.bg} px-4 py-3.5`}
      role="note"
    >
      <div className={`text-[11.5px] font-semibold uppercase tracking-wide ${tone.color}`}>
        {content.title ?? tone.label}
      </div>
      <p className="mt-1 text-[14px] leading-6 text-ink-2">{content.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step sequence                                                       */
/* ------------------------------------------------------------------ */

function StepSequenceView({
  content,
}: {
  content: {
    title?: string;
    steps: Array<{
      title: string;
      explanation?: string;
      code?: string;
      illustration?: string;
    }>;
  };
}) {
  const [active, setActive] = useState(0);
  const step = content.steps[active];

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
      {content.title && (
        <div className="border-b border-edge px-4 py-3 text-[14px] font-semibold text-ink">
          {content.title}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 border-b border-edge px-4 py-2.5">
        {content.steps.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-current={i === active}
            className={`focus-ring rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
              i === active
                ? "bg-accent-soft text-accent-ink"
                : i < active
                  ? "text-success"
                  : "text-ink-muted hover:bg-panel-muted"
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
      {step && (
        <div className="px-4 py-4">
          <h4 className="text-[14.5px] font-semibold text-ink">{step.title}</h4>
          {step.explanation && (
            <p className="mt-1.5 text-[14px] leading-6 text-ink-2">
              {step.explanation}
            </p>
          )}
          {step.code && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-inset px-3.5 py-3 font-mono text-[12.5px] leading-6 text-ink-2">
              {step.code}
            </pre>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              className="rounded-md border border-edge px-2.5 py-1 text-[12px] font-medium text-ink-2 hover:bg-panel-muted disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setActive(Math.min(content.steps.length - 1, active + 1))
              }
              disabled={active >= content.steps.length - 1}
              className="rounded-md border border-edge px-2.5 py-1 text-[12px] font-medium text-ink-2 hover:bg-panel-muted disabled:opacity-40"
            >
              Next →
            </button>
            <span className="ml-auto font-mono text-[11.5px] text-ink-faint">
              {active + 1}/{content.steps.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image                                                               */
/* ------------------------------------------------------------------ */

function ImageView({
  content,
}: {
  content: { src: string; alt: string; caption?: string; width?: string };
}) {
  const widthClass =
    content.width === "sm"
      ? "max-w-sm"
      : content.width === "lg"
        ? "max-w-2xl"
        : content.width === "full"
          ? "max-w-full"
          : "max-w-xl";

  return (
    <figure className={`${widthClass} mx-auto`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content.src}
        alt={content.alt}
        className="w-full rounded-xl border border-edge shadow-card"
        loading="lazy"
      />
      {content.caption && (
        <figcaption className="mt-2 text-center text-[12.5px] text-ink-muted">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz (learner, answers stripped server-side until submitted)        */
/* ------------------------------------------------------------------ */

type LearnerQuestion =
  | { kind: "multiple_choice"; id: string; prompt: string; choices: Array<{ id: string; label: string }> }
  | { kind: "true_false"; id: string; prompt: string }
  | { kind: "predict_output"; id: string; prompt: string; code?: string };

export type QuizSubmitFn = (
  questionId: string,
  answer: string | boolean
) => Promise<{ correct: boolean; explanation?: string }>;

function QuizView({
  content,
  onSubmit,
}: {
  content: {
    title?: string;
    questions: LearnerQuestion[];
    xpReward?: number;
  };
  onSubmit?: QuizSubmitFn;
}) {
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [results, setResults] = useState<
    Record<string, { correct: boolean; explanation?: string }>
  >({});
  const [busy, setBusy] = useState<string | null>(null);

  const submit = async (q: LearnerQuestion, answer: string | boolean) => {
    setAnswers((a) => ({ ...a, [q.id]: answer }));
    if (!onSubmit) {
      // No server grader wired — show selection only.
      return;
    }
    setBusy(q.id);
    try {
      const res = await onSubmit(q.id, answer);
      setResults((r) => ({ ...r, [q.id]: res }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-ink">
          {content.title ?? "Knowledge check"}
        </h3>
        {content.xpReward ? (
          <span className="font-mono text-[12px] text-accent">
            +{content.xpReward} XP
          </span>
        ) : null}
      </div>

      {content.questions.map((q, qi) => {
        const result = results[q.id];
        const selected = answers[q.id];
        return (
          <div
            key={q.id}
            className="rounded-xl border border-edge bg-panel p-4 shadow-card"
          >
            <div className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent-ink">
                {qi + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] leading-6 text-ink">{q.prompt}</p>
                {q.kind === "predict_output" && q.code && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-inset px-3 py-2 font-mono text-[12.5px] leading-6 text-ink-2">
                    {q.code}
                  </pre>
                )}

                <div className="mt-3 space-y-2">
                  {q.kind === "multiple_choice" &&
                    q.choices.map((c) => {
                      const isSel = selected === c.id;
                      const state = result
                        ? isSel
                          ? result.correct
                            ? "border-success bg-success-soft"
                            : "border-danger bg-danger-soft"
                          : "border-edge"
                        : isSel
                          ? "border-accent-border bg-accent-soft"
                          : "border-edge hover:bg-panel-muted";
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={busy === q.id || Boolean(result)}
                          onClick={() => submit(q, c.id)}
                          className={`focus-ring block w-full rounded-lg border px-3.5 py-2.5 text-left text-[14px] transition-colors disabled:cursor-default ${state}`}
                        >
                          {c.label}
                        </button>
                      );
                    })}

                  {q.kind === "true_false" &&
                    ([true, false] as const).map((v) => {
                      const isSel = selected === v;
                      const state = result
                        ? isSel
                          ? result.correct
                            ? "border-success bg-success-soft"
                            : "border-danger bg-danger-soft"
                          : "border-edge"
                        : isSel
                          ? "border-accent-border bg-accent-soft"
                          : "border-edge hover:bg-panel-muted";
                      return (
                        <button
                          key={String(v)}
                          type="button"
                          disabled={busy === q.id || Boolean(result)}
                          onClick={() => submit(q, v)}
                          className={`focus-ring block w-full rounded-lg border px-3.5 py-2.5 text-left text-[14px] transition-colors disabled:cursor-default ${state}`}
                        >
                          {v ? "True" : "False"}
                        </button>
                      );
                    })}

                  {q.kind === "predict_output" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const val = String(data.get(`ans-${q.id}`) ?? "");
                        if (val.trim()) void submit(q, val);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        name={`ans-${q.id}`}
                        placeholder="Your answer…"
                        disabled={busy === q.id || Boolean(result)}
                        className="focus-ring flex-1 rounded-lg border border-edge bg-surface px-3 py-2 font-mono text-[13.5px] text-ink outline-none"
                      />
                      <button
                        type="submit"
                        disabled={busy === q.id || Boolean(result)}
                        className="focus-ring rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-accent-contrast hover:bg-accent-hover disabled:opacity-50"
                      >
                        Check
                      </button>
                    </form>
                  )}
                </div>

                {result && (
                  <div
                    role="status"
                    className={`mt-3 rounded-lg px-3.5 py-2.5 text-[13.5px] leading-5 ${
                      result.correct
                        ? "bg-success-soft text-success"
                        : "bg-danger-soft text-danger"
                    }`}
                  >
                    <strong>
                      {result.correct ? "Correct." : "Not quite."}
                    </strong>{" "}
                    {result.explanation}
                  </div>
                )}
                {busy === q.id && (
                  <p className="mt-2 text-[12.5px] text-ink-faint">Checking…</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

export type ChallengeSubmitFn = (input: {
  code?: string;
  answer?: string;
}) => Promise<{ accepted: boolean; message: string }>;

function ChallengeView({
  content,
  onSubmit,
}: {
  content: {
    title: string;
    statement: string;
    instructions: string[];
    starterCode: string;
    requirements: string[];
    difficulty?: string;
    xpReward?: number;
    testConfig?: { cases?: Array<{ name: string; input?: string; expected?: string }> };
  };
  onSubmit?: ChallengeSubmitFn;
}) {
  const [code, setCode] = useState(content.starterCode);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const difficultyTone =
    content.difficulty === "hard"
      ? "bg-danger-soft text-danger"
      : content.difficulty === "medium"
        ? "bg-warning-soft text-warning"
        : "bg-success-soft text-success";

  const submit = async () => {
    if (!onSubmit) {
      setFeedback(
        "No submission endpoint is connected for this challenge yet."
      );
      return;
    }
    setBusy(true);
    try {
      const res = await onSubmit({
        code: code.trim() || undefined,
        answer: answer.trim() || undefined,
      });
      setFeedback(res.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${difficultyTone}`}>
            {content.difficulty ?? "easy"}
          </span>
          <h3 className="text-[14.5px] font-semibold text-ink">
            {content.title}
          </h3>
        </div>
        {content.xpReward ? (
          <span className="font-mono text-[12px] text-accent">
            +{content.xpReward} XP
          </span>
        ) : null}
      </div>

      <div className="px-4 py-4">
        <p className="text-[14.5px] leading-7 text-ink-2">{content.statement}</p>

        {content.instructions.length > 0 && (
          <ol className="mt-3 list-inside list-decimal space-y-1 text-[13.5px] leading-6 text-ink-muted">
            {content.instructions.map((ins, i) => (
              <li key={i}>{ins}</li>
            ))}
          </ol>
        )}

        {content.requirements.length > 0 && (
          <div className="mt-3">
            <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
              Requirements
            </div>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-[13.5px] leading-6 text-ink-2">
              {content.requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {content.starterCode && (
          <div className="mt-4">
            <div className="flex items-center justify-between border-b border-edge bg-inset px-3 py-1.5">
              <span className="font-mono text-[11.5px] text-ink-muted">
                starter code · editable
              </span>
              <CopyButton text={code} />
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Challenge code"
              className="block h-44 w-full resize-y bg-panel px-4 py-3 font-mono text-[13px] leading-6 text-ink-2 outline-none"
            />
          </div>
        )}

        {content.testConfig?.cases && content.testConfig.cases.length > 0 && (
          <div className="mt-3">
            <div className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
              Test cases
            </div>
            <div className="mt-1.5 space-y-1">
              {content.testConfig.cases.map((c, i) => (
                <div
                  key={i}
                  className="rounded-md border border-edge bg-inset px-3 py-1.5 font-mono text-[12px] text-ink-2"
                >
                  {c.name}
                  {c.input ? ` · in: ${c.input}` : ""}
                  {c.expected ? ` → ${c.expected}` : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Optional answer…"
            aria-label="Challenge answer"
            className="focus-ring flex-1 min-w-[200px] rounded-lg border border-edge bg-surface px-3 py-2 text-[13.5px] text-ink outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="focus-ring rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit"}
          </button>
        </div>

        {feedback && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-inset px-3.5 py-2.5 text-[13.5px] leading-5 text-ink-2"
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public block renderer                                               */
/* ------------------------------------------------------------------ */

export type LessonQuizSubmitFn = (
  blockId: number,
  questionId: string,
  answer: string | boolean
) => Promise<{ correct: boolean; explanation?: string }>;

export type LessonChallengeSubmitFn = (
  blockId: number,
  input: { code?: string; answer?: string }
) => Promise<{ accepted: boolean; message: string }>;

export type BlockHandlers = {
  onQuizSubmit?: LessonQuizSubmitFn;
  onChallengeSubmit?: LessonChallengeSubmitFn;
};

export function BlockContent({
  block,
  blockId,
  handlers,
}: {
  block: LessonBlockPayload;
  blockId?: number;
  handlers?: BlockHandlers;
}) {
  switch (block.type) {
    case "rich_text":
      return <RichTextView content={block.content} />;
    case "image":
      return <ImageView content={block.content} />;
    case "code":
      return <CodeView content={block.content} />;
    case "code_playground":
      return <PlaygroundView content={block.content} />;
    case "visualization":
      return (
        <VisualizationRenderer
          visualizationType={block.content.visualizationType}
          title={block.content.title}
          description={block.content.description}
          config={block.content.config}
          takeaway={block.content.takeaway}
        />
      );
    case "comparison":
      return <ComparisonView content={block.content} />;
    case "callout":
      return <CalloutView content={block.content} />;
    case "step_sequence":
      return <StepSequenceView content={block.content} />;
    case "quiz":
      return (
        <QuizView
          content={{
            title: block.content.title,
            questions: block.content.questions as LearnerQuestion[],
            xpReward: block.content.xpReward,
          }}
          onSubmit={
            handlers?.onQuizSubmit && blockId !== undefined
              ? (questionId, answer) =>
                  handlers.onQuizSubmit!(blockId, questionId, answer)
              : undefined
          }
        />
      );
    case "challenge":
      return (
        <ChallengeView
          content={block.content}
          onSubmit={
            handlers?.onChallengeSubmit && blockId !== undefined
              ? (input) => handlers.onChallengeSubmit!(blockId, input)
              : undefined
          }
        />
      );
    default:
      return (
        <div className="rounded-lg border border-dashed border-line bg-inset px-4 py-4 text-[13px] text-ink-muted">
          This block type isn&apos;t supported by your version of GoCraft yet.
        </div>
      );
  }
}
