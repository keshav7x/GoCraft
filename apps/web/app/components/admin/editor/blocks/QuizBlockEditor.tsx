"use client";

import { Check, Plus, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";
import type { BlockDataMap } from "@/app/lib/admin/types";
import { uid } from "@/app/lib/admin/types";
import { Field, PlainTextarea } from "../editor-shared";

export function QuizBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["quiz"];
  onChange: (patch: Partial<BlockDataMap["quiz"]>) => void;
}) {
  function updateChoice(id: string, text: string) {
    onChange({ choices: data.choices.map((choice) => (choice.id === id ? { ...choice, text } : choice)) });
  }

  return (
    <div className="space-y-3">
      <Field label="Question">
        <PlainTextarea
          value={data.question}
          onChange={(question) => onChange({ question })}
          rows={2}
          placeholder="Ask a single, focused question."
        />
      </Field>

      <Field label="Answer choices" hint="Select the radio next to the correct answer.">
        <div className="space-y-2">
          {data.choices.map((choice, index) => {
            const isCorrect = data.correctChoiceId === choice.id;
            return (
              <div key={choice.id} className="flex items-center gap-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isCorrect}
                  aria-label={`Mark choice ${index + 1} correct`}
                  onClick={() => onChange({ correctChoiceId: choice.id })}
                  className={cn(
                    "focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition",
                    isCorrect
                      ? "border-easy bg-easy-soft text-easy"
                      : "border-line text-transparent hover:border-edge-strong hover:text-ink-faint",
                  )}
                >
                  <Check size={14} />
                </button>
                <Input
                  value={choice.text}
                  onChange={(event) => updateChoice(choice.id, event.target.value)}
                  placeholder={`Choice ${index + 1}`}
                />
                <button
                  type="button"
                  aria-label={`Remove choice ${index + 1}`}
                  disabled={data.choices.length <= 2}
                  onClick={() => {
                    const choices = data.choices.filter((c) => c.id !== choice.id);
                    onChange({
                      choices,
                      correctChoiceId:
                        data.correctChoiceId === choice.id ? null : data.correctChoiceId,
                    });
                  }}
                  className="focus-ring shrink-0 rounded-lg border border-edge p-2 text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard disabled:pointer-events-none disabled:opacity-30"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange({ choices: [...data.choices, { id: uid("ch"), text: "" }] })}
          >
            <Plus size={13} />
            Add choice
          </Button>
        </div>
      </Field>

      <Field label="Explanation" hint="Shown after the learner answers.">
        <PlainTextarea
          value={data.explanation}
          onChange={(explanation) => onChange({ explanation })}
          rows={2}
          placeholder="Why the correct answer is correct."
        />
      </Field>
    </div>
  );
}
