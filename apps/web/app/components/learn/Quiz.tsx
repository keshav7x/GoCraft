"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "../../lib/demo/types";
import { useDemoStore } from "../../lib/progress-store";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

type QuizProps = {
  questions: QuizQuestion[];
  lessonKey: string;
};

export function Quiz({ questions, lessonKey }: QuizProps) {
  const markAnswered = useDemoStore((s) => s.markQuizAnswered);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (questions.length === 0) return null;

  return (
    <section aria-label="Checkpoint quiz" className="space-y-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-ink">
          Checkpoint
        </h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Quick questions to lock in the ideas. Answers stay in this browser.
        </p>
      </div>

      {questions.map((question, questionIndex) => {
        const selected = answers[question.id];
        const answered = selected !== undefined;
        const correct = answered && selected === question.correctChoiceId;

        return (
          <div
            key={question.id}
            className="rounded-xl border border-edge bg-panel p-4 sm:p-5"
          >
            <p className="text-[13.5px] font-medium leading-6 text-ink">
              <span className="mr-2 text-ink-faint">
                {questionIndex + 1}.
              </span>
              {question.prompt}
            </p>

            <div className="mt-3.5 space-y-2" role="group" aria-label={question.prompt}>
              {question.choices.map((choice, optionIndex) => {
                const isSelected = selected === choice.id;
                const isCorrect = choice.id === question.correctChoiceId;
                const showState = answered;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={answered}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [question.id]: choice.id }));
                      markAnswered(`${lessonKey}/${question.id}`);
                    }}
                    className={cn(
                      "focus-ring flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13px] leading-5 transition-colors",
                      !showState &&
                        "border-edge text-ink-muted hover:border-edge-strong hover:bg-panel-muted/60",
                      showState && isCorrect &&
                        "border-easy/40 bg-easy-soft text-easy",
                      showState && isSelected && !isCorrect &&
                        "border-hard/40 bg-hard-soft text-hard",
                      showState && !isSelected && !isCorrect &&
                        "border-edge text-ink-faint",
                    )}
                  >
                    <span className="mt-0.5 w-4 shrink-0 font-mono text-[11px] uppercase">
                      {String.fromCharCode(97 + optionIndex)}
                    </span>
                    <span className="flex-1">{choice.label}</span>
                    {showState && isCorrect ? (
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    ) : null}
                    {showState && isSelected && !isCorrect ? (
                      <XCircle size={15} className="mt-0.5 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {answered ? (
              <div
                className={cn(
                  "mt-3 rounded-lg border px-3.5 py-2.5 text-[12.5px] leading-5",
                  correct
                    ? "border-easy/25 bg-easy-soft text-easy"
                    : "border-edge bg-panel-muted text-ink-muted",
                )}
                role="status"
              >
                <span className="font-semibold">
                  {correct ? "Correct. " : "Not quite. "}
                </span>
                {question.explanation}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAnswers({})}
          disabled={Object.keys(answers).length === 0}
        >
          Reset checkpoint
        </Button>
      </div>
    </section>
  );
}
