"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { DIFFICULTY_LABEL, DIFFICULTY_TONE } from "@/app/lib/admin/format";
import type { Block } from "@/app/lib/admin/types";

function CodeView({
  code,
  language,
  highlightLines,
}: {
  code: string;
  language: string;
  highlightLines?: string;
}) {
  const highlighted = new Set<number>();
  for (const part of (highlightLines ?? "").split(",")) {
    const trimmed = part.trim();
    const range = trimmed.match(/^(\d+)-(\d+)$/);
    if (range) {
      for (let i = Number(range[1]); i <= Number(range[2]); i += 1) highlighted.add(i);
    } else if (/^\d+$/.test(trimmed)) {
      highlighted.add(Number(trimmed));
    }
  }
  const lines = (code || "").split("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#0c0e13]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f0685f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e0a82e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34c48f]" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6b7385]">
          {language}
        </span>
      </div>
      <pre className="gc-scrollbar overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-6">
        <code>
          {lines.map((line, index) => (
            <span
              key={index}
              className={cn(
                "block min-w-max px-1",
                highlighted.has(index + 1)
                  ? "rounded bg-[#34c48f]/15 text-[#d9f7ea]"
                  : "text-[#e6edf3]",
              )}
            >
              <span className="mr-4 inline-block w-6 select-none text-right text-[#6b7385]">
                {index + 1}
              </span>
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

const CALLOUT_STYLES = {
  info: { wrapper: "border-focus/25 bg-focus/5", Icon: Info, accent: "text-focus" },
  success: { wrapper: "border-easy/25 bg-easy-soft", Icon: CheckCircle2, accent: "text-easy" },
  warning: { wrapper: "border-medium/30 bg-medium-soft", Icon: AlertTriangle, accent: "text-medium" },
  danger: { wrapper: "border-hard/25 bg-hard-soft", Icon: OctagonAlert, accent: "text-hard" },
} as const;

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "heading1":
      return <h1 className="mt-2 text-3xl font-semibold tracking-tight">{block.data.text}</h1>;
    case "heading2":
      return <h2 className="mt-2 text-2xl font-semibold tracking-tight">{block.data.text}</h2>;
    case "heading3":
      return <h3 className="mt-2 text-xl font-semibold tracking-tight">{block.data.text}</h3>;
    case "paragraph":
      return (
        <p
          className={cn(
            "text-[15px] leading-7 text-ink-2",
            block.data.bold && "font-semibold",
            block.data.italic && "italic",
          )}
        >
          {block.data.text}
        </p>
      );
    case "bulletedList":
      return (
        <ul className="space-y-1.5">
          {block.data.items.filter(Boolean).map((item, index) => (
            <li key={index} className="flex items-start gap-2.5 text-[15px] leading-7 text-ink-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "numberedList":
      return (
        <ol className="space-y-1.5">
          {block.data.items.filter(Boolean).map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-[15px] leading-7 text-ink-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <figure className="border-l-2 border-accent pl-5">
          <blockquote className="text-[16px] italic leading-7 text-ink-2">
            “{block.data.text}”
          </blockquote>
          {block.data.attribution ? (
            <figcaption className="mt-2 text-sm text-ink-3">— {block.data.attribution}</figcaption>
          ) : null}
        </figure>
      );
    case "callout": {
      const style = CALLOUT_STYLES[block.data.tone] ?? CALLOUT_STYLES.info;
      const Icon = style.Icon;
      return (
        <div className={cn("flex gap-3 rounded-xl border p-4", style.wrapper)}>
          <Icon size={17} className={cn("mt-0.5 shrink-0", style.accent)} />
          <div>
            <p className="text-sm font-semibold text-ink">{block.data.title}</p>
            <p className="mt-1 text-sm leading-6 text-ink-2">{block.data.text}</p>
          </div>
        </div>
      );
    }
    case "divider":
      return <hr className="border-edge" />;
    case "code":
      return (
        <div className="space-y-2.5">
          <CodeView
            code={block.data.code}
            language={block.data.language}
            highlightLines={block.data.highlightLines}
          />
          {block.data.explanation ? (
            <p className="rounded-lg border border-line bg-panel-muted px-4 py-3 text-sm leading-6 text-ink-2">
              {block.data.explanation}
            </p>
          ) : null}
          {block.data.expectedOutput ? (
            <div className="rounded-lg border border-line bg-inset px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-4">
                Expected output
              </p>
              <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[13px] leading-6 text-ink-2">
                {block.data.expectedOutput}
              </pre>
            </div>
          ) : null}
        </div>
      );
    case "terminalOutput":
      return (
        <div className="overflow-hidden rounded-xl border border-line bg-[#0c0e13]">
          <div className="border-b border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6b7385]">
            {block.data.title}
          </div>
          <pre className="gc-scrollbar overflow-x-auto whitespace-pre-wrap px-4 py-3.5 font-mono text-[13px] leading-6 text-[#34c48f]">
            {block.data.output}
          </pre>
        </div>
      );
    case "fileStructure":
      return (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="border-b border-line bg-panel-muted px-4 py-2 text-[11px] font-semibold text-ink-2">
            {block.data.title}
          </div>
          <pre className="gc-scrollbar overflow-x-auto bg-inset px-4 py-3.5 font-mono text-[13px] leading-6 text-ink-2">
            {block.data.tree}
          </pre>
        </div>
      );
    case "exercise":
      return (
        <div className="rounded-xl border border-accent-border bg-accent-soft/40 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">Exercise</Badge>
            <Badge variant={DIFFICULTY_TONE[block.data.difficulty] ?? "neutral"}>
              {DIFFICULTY_LABEL[block.data.difficulty]}
            </Badge>
            <Badge variant="neutral">{block.data.language}</Badge>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink-2">
            {block.data.statement}
          </p>
          {block.data.starterCode ? (
            <div className="mt-3">
              <CodeView code={block.data.starterCode} language={block.data.language} />
            </div>
          ) : null}
          {block.data.examples.some((e) => e.input || e.output) ? (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Examples
              </p>
              {block.data.examples.map((example) => (
                <div key={example.id} className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-line bg-panel px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-4">
                      Input
                    </p>
                    <pre className="mt-0.5 whitespace-pre-wrap font-mono text-xs text-ink-2">
                      {example.input}
                    </pre>
                  </div>
                  <div className="rounded-lg border border-line bg-panel px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-4">
                      Output
                    </p>
                    <pre className="mt-0.5 whitespace-pre-wrap font-mono text-xs text-ink-2">
                      {example.output}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {block.data.hints.filter(Boolean).length > 0 ? <HintsList hints={block.data.hints} /> : null}
          {block.data.solutionExplanation ? (
            <details className="mt-3 rounded-lg border border-line bg-panel">
              <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-ink">
                Solution explanation
              </summary>
              <p className="border-t border-line px-4 py-3 text-sm leading-6 text-ink-2">
                {block.data.solutionExplanation}
              </p>
            </details>
          ) : null}
        </div>
      );
    case "image":
      return (
        <figure
          className={cn(
            "flex flex-col",
            block.data.alignment === "left" && "items-start",
            block.data.alignment === "center" && "items-center",
            block.data.alignment === "right" && "items-end",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.data.src ?? undefined}
            alt={block.data.alt}
            className={cn(
              "rounded-xl border border-line object-cover",
              block.data.width === "sm" && "w-[45%]",
              block.data.width === "md" && "w-[70%]",
              block.data.width === "lg" && "w-[92%]",
              block.data.width === "full" && "w-full",
              !block.data.src && "bg-panel-muted p-10 text-center text-sm text-ink-faint",
            )}
          />
          {block.data.caption ? (
            <figcaption className="mt-2 max-w-2xl text-center text-xs leading-5 text-ink-3">
              {block.data.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "diagram":
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.data.src ?? undefined}
            alt={block.data.alt || block.data.title}
            className="w-full rounded-xl border border-line"
          />
          {block.data.title ? (
            <figcaption className="mt-2 text-center text-xs text-ink-3">
              {block.data.title}
            </figcaption>
          ) : null}
        </figure>
      );
    case "visualExplanation":
      return (
        <div className="rounded-xl border border-line bg-panel p-5">
          {block.data.title ? (
            <h3 className="text-lg font-semibold tracking-tight">{block.data.title}</h3>
          ) : null}
          {block.data.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.data.src}
              alt={block.data.title}
              className="mt-3 w-full rounded-lg border border-line"
            />
          ) : null}
          {block.data.explanation ? (
            <p className="mt-3 text-[15px] leading-7 text-ink-2">{block.data.explanation}</p>
          ) : null}
          {block.data.annotations.filter((a) => a.label || a.note).length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {block.data.annotations
                .filter((a) => a.label || a.note)
                .map((annotation) => (
                  <li
                    key={annotation.id}
                    className="rounded-lg border border-line bg-panel-muted px-3 py-2.5"
                  >
                    <p className="text-xs font-semibold text-accent-ink">{annotation.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-ink-2">{annotation.note}</p>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      );
    case "stepByStep":
      return (
        <div className="rounded-xl border border-line p-5">
          {block.data.title ? (
            <h3 className="text-lg font-semibold tracking-tight">{block.data.title}</h3>
          ) : null}
          <ol className="mt-3 space-y-4">
            {block.data.steps.map((step, index) => (
              <li key={step.id} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-ink-2">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      );
    case "videoEmbed":
      return (
        <div>
          <div className="flex aspect-video items-center justify-center rounded-xl border border-line bg-ink/95">
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xl text-white">
                ▶
              </span>
              <p className="mt-3 text-sm font-medium text-white">
                {block.data.title || "Embedded video"}
              </p>
            </div>
          </div>
          {block.data.url ? (
            <a
              href={block.data.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block truncate text-xs text-accent-strong hover:underline"
            >
              {block.data.url}
            </a>
          ) : null}
        </div>
      );
    case "quiz":
      return <QuizView block={block} />;
    case "predictOutput":
      return (
        <div className="rounded-xl border border-line p-5">
          <Badge variant="accent">Predict the output</Badge>
          <div className="mt-3">
            <CodeView code={block.data.code} language={block.data.language} />
          </div>
          <details className="mt-3 rounded-lg border border-line bg-panel">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-ink">
              Reveal answer
            </summary>
            <div className="border-t border-line px-4 py-3">
              <p className="font-mono text-sm text-ink">{block.data.answer}</p>
              {block.data.explanation ? (
                <p className="mt-2 text-sm leading-6 text-ink-2">{block.data.explanation}</p>
              ) : null}
            </div>
          </details>
        </div>
      );
    case "fillBlanks":
      return (
        <div className="rounded-xl border border-line p-5">
          <Badge variant="accent">Fill in the blanks</Badge>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink-2">
            {block.data.text}
          </p>
          <details className="mt-3 rounded-lg border border-line bg-panel">
            <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-ink">
              Show answers
            </summary>
            <ul className="border-t border-line px-4 py-3 text-sm text-ink-2">
              {block.data.answers.filter(Boolean).map((answer, index) => (
                <li key={index} className="font-mono">
                  {answer}
                </li>
              ))}
            </ul>
          </details>
          {block.data.explanation ? (
            <p className="mt-2 text-sm leading-6 text-ink-3">{block.data.explanation}</p>
          ) : null}
        </div>
      );
    case "codingChallenge":
      return (
        <div className="rounded-xl border border-hard/30 bg-hard-soft/30 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="danger">Coding challenge</Badge>
            <Badge variant={DIFFICULTY_TONE[block.data.difficulty] ?? "neutral"}>
              {DIFFICULTY_LABEL[block.data.difficulty]}
            </Badge>
            <Badge variant="neutral">{block.data.language}</Badge>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink-2">
            {block.data.prompt}
          </p>
          {block.data.starterCode ? (
            <div className="mt-3">
              <CodeView code={block.data.starterCode} language={block.data.language} />
            </div>
          ) : null}
          {block.data.criteria.filter(Boolean).length > 0 ? (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                Grading criteria
              </p>
              <ul className="mt-1.5 space-y-1">
                {block.data.criteria.filter(Boolean).map((criterion, index) => (
                  <li key={index} className="text-sm text-ink-2">
                    • {criterion}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      );
    case "hint":
      return <HintsList hints={[block.data.text]} />;
    case "solutionExplanation":
      return (
        <div className="rounded-xl border border-easy/30 bg-easy-soft/40 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-easy">
            Solution
          </p>
          {block.data.code ? (
            <div className="mt-2.5">
              <CodeView code={block.data.code} language={block.data.language} />
            </div>
          ) : null}
          {block.data.explanation ? (
            <p className="mt-2.5 text-sm leading-6 text-ink-2">{block.data.explanation}</p>
          ) : null}
        </div>
      );
    default:
      return null;
  }
}

function HintsList({ hints }: { hints: string[] }) {
  const items = hints.filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {items.map((hint, index) => (
        <details key={index} className="rounded-lg border border-medium/30 bg-medium-soft/50">
          <summary className="cursor-pointer px-3.5 py-2 text-sm font-medium text-ink">
            Hint {index + 1}
          </summary>
          <p className="border-t border-medium/20 px-3.5 py-2.5 text-sm leading-6 text-ink-2">
            {hint}
          </p>
        </details>
      ))}
    </div>
  );
}

function QuizView({ block }: { block: Extract<Block, { type: "quiz" }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correct = block.data.correctChoiceId;

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <Badge variant="accent">Quiz</Badge>
      <p className="mt-3 text-[15px] font-medium leading-7 text-ink">{block.data.question}</p>
      <div className="mt-3 space-y-2">
        {block.data.choices
          .filter((choice) => choice.text.trim())
          .map((choice, index) => {
            const isCorrect = choice.id === correct;
            const isSelected = selected === choice.id;
            const state = revealed
              ? isCorrect
                ? "correct"
                : isSelected
                  ? "incorrect"
                  : "idle"
              : isSelected
                ? "selected"
                : "idle";
            return (
              <button
                key={choice.id}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(choice.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm transition",
                  state === "correct" && "border-easy bg-easy-soft text-easy",
                  state === "incorrect" && "border-hard bg-hard-soft text-hard",
                  state === "selected" && "border-accent bg-accent-soft text-accent-ink",
                  state === "idle" && "border-line text-ink-2 hover:border-edge-strong hover:bg-panel-muted",
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                  {String.fromCharCode(65 + index)}
                </span>
                {choice.text}
              </button>
            );
          })}
      </div>
      {!revealed ? (
        <button
          type="button"
          disabled={!selected}
          onClick={() => setRevealed(true)}
          className="focus-ring mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/90 disabled:pointer-events-none disabled:opacity-40"
        >
          Check answer
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <p
            className={cn(
              "text-sm font-medium",
              selected === correct ? "text-easy" : "text-hard",
            )}
          >
            {selected === correct
              ? "Correct!"
              : `Not quite — the correct answer is ${block.data.choices.findIndex((c) => c.id === correct) + 1 > 0 ? String.fromCharCode(65 + block.data.choices.findIndex((c) => c.id === correct)) : "?"}.`}
          </p>
          {block.data.explanation ? (
            <p className="rounded-lg border border-line bg-panel-muted px-3.5 py-2.5 text-sm leading-6 text-ink-2">
              {block.data.explanation}
            </p>
          ) : null}
        </div>
      )}
      {revealed && (
        <button
          type="button"
          onClick={() => {
            setRevealed(false);
            setSelected(null);
          }}
          className="focus-ring mt-2 text-xs font-medium text-ink-3 hover:text-ink"
        >
          Try again
        </button>
      )}
    </div>
  );
}
