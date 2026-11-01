"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/input";
import type { AdminDifficulty, BlockDataMap } from "@/app/lib/admin/types";
import { uid } from "@/app/lib/admin/types";
import { Field, LanguageSelect, MonoTextarea, PlainTextarea, SegmentedControl, StringListEditor } from "../editor-shared";

export function ExerciseBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["exercise"];
  onChange: (patch: Partial<BlockDataMap["exercise"]>) => void;
}) {
  function updateExample(id: string, patch: { input?: string; output?: string }) {
    onChange({
      examples: data.examples.map((example) =>
        example.id === id ? { ...example, ...patch } : example,
      ),
    });
  }

  return (
    <div className="space-y-3">
      <Field label="Problem statement">
        <PlainTextarea
          value={data.statement}
          onChange={(statement) => onChange({ statement })}
          placeholder="Describe exactly what the learner should build."
          rows={3}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <SegmentedControl
          label="Difficulty"
          value={data.difficulty}
          onChange={(difficulty: AdminDifficulty) => onChange({ difficulty })}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
        <Field label="Language">
          <LanguageSelect value={data.language} onChange={(language) => onChange({ language })} />
        </Field>
      </div>

      <Field label="Starter code">
        <MonoTextarea
          value={data.starterCode}
          onChange={(starterCode) => onChange({ starterCode })}
          placeholder="// code the learner starts with"
          rows={5}
        />
      </Field>

      <Field label="Input / output examples">
        <div className="space-y-2">
          {data.examples.map((example) => (
            <div key={example.id} className="rounded-lg border border-edge bg-panel-muted/50 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                  Example
                </span>
                <button
                  type="button"
                  aria-label="Remove example"
                  onClick={() =>
                    onChange({ examples: data.examples.filter((e) => e.id !== example.id) })
                  }
                  className="focus-ring rounded-md p-1 text-ink-3 transition hover:bg-hard-soft hover:text-hard"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={example.input}
                  onChange={(event) => updateExample(example.id, { input: event.target.value })}
                  placeholder="Input"
                />
                <Input
                  value={example.output}
                  onChange={(event) => updateExample(example.id, { output: event.target.value })}
                  placeholder="Expected output"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange({ examples: [...data.examples, { id: uid("ex"), input: "", output: "" }] })
            }
          >
            <Plus size={13} />
            Add example
          </Button>
        </div>
      </Field>

      <Field label="Hints">
        <div className="space-y-2">
          {data.hints.map((hint, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={hint}
                onChange={(event) =>
                  onChange({ hints: data.hints.map((h, i) => (i === index ? event.target.value : h)) })
                }
                placeholder={`Hint ${index + 1}`}
              />
              <button
                type="button"
                aria-label={`Remove hint ${index + 1}`}
                onClick={() => onChange({ hints: data.hints.filter((_, i) => i !== index) })}
                className="focus-ring shrink-0 rounded-lg border border-edge p-2 text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange({ hints: [...data.hints, ""] })}
          >
            <Plus size={13} />
            Add hint
          </Button>
        </div>
      </Field>

      <Field label="Solution explanation" hint="Code execution is not simulated — this is shown as reference material.">
        <PlainTextarea
          value={data.solutionExplanation}
          onChange={(solutionExplanation) => onChange({ solutionExplanation })}
          placeholder="Explain the intended solution."
          rows={3}
        />
      </Field>
    </div>
  );
}

export function CodingChallengeBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["codingChallenge"];
  onChange: (patch: Partial<BlockDataMap["codingChallenge"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Prompt">
        <PlainTextarea
          value={data.prompt}
          onChange={(prompt) => onChange({ prompt })}
          placeholder="What should the learner solve?"
          rows={3}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <SegmentedControl
          label="Difficulty"
          value={data.difficulty}
          onChange={(difficulty: AdminDifficulty) => onChange({ difficulty })}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
        <Field label="Language">
          <LanguageSelect value={data.language} onChange={(language) => onChange({ language })} />
        </Field>
      </div>

      <Field label="Starter code">
        <MonoTextarea
          value={data.starterCode}
          onChange={(starterCode) => onChange({ starterCode })}
          rows={5}
        />
      </Field>

      <Field label="Grading criteria">
        <div className="space-y-2">
          {data.criteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={criterion}
                onChange={(event) =>
                  onChange({
                    criteria: data.criteria.map((c, i) => (i === index ? event.target.value : c)),
                  })
                }
                placeholder={`Criterion ${index + 1}`}
              />
              <button
                type="button"
                aria-label={`Remove criterion ${index + 1}`}
                onClick={() => onChange({ criteria: data.criteria.filter((_, i) => i !== index) })}
                className="focus-ring shrink-0 rounded-lg border border-edge p-2 text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange({ criteria: [...data.criteria, ""] })}
          >
            <Plus size={13} />
            Add criterion
          </Button>
        </div>
      </Field>
    </div>
  );
}

export function PredictOutputBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["predictOutput"];
  onChange: (patch: Partial<BlockDataMap["predictOutput"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="w-40">
        <Field label="Language">
          <LanguageSelect value={data.language} onChange={(language) => onChange({ language })} />
        </Field>
      </div>
      <Field label="Code to reason about">
        <MonoTextarea
          value={data.code}
          onChange={(code) => onChange({ code })}
          rows={6}
          placeholder="What will this print?"
        />
      </Field>
      <Field label="Correct answer">
        <MonoTextarea
          value={data.answer}
          onChange={(answer) => onChange({ answer })}
          rows={2}
          placeholder="The exact expected output"
        />
      </Field>
      <Field label="Explanation">
        <PlainTextarea
          value={data.explanation}
          onChange={(explanation) => onChange({ explanation })}
          placeholder="Why that is the output."
          rows={3}
        />
      </Field>
    </div>
  );
}

export function FillBlanksBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["fillBlanks"];
  onChange: (patch: Partial<BlockDataMap["fillBlanks"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field
        label="Text with blanks"
        hint="Use ___ to mark each blank in the text."
      >
        <PlainTextarea
          value={data.text}
          onChange={(text) => onChange({ text })}
          rows={3}
          placeholder="A goroutine is scheduled by the ___."
        />
      </Field>
      <Field label="Answers" hint="One accepted answer per blank, in order.">
        <div className="space-y-2">
          {data.answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-center text-xs font-semibold tabular-nums text-ink-4">
                #{index + 1}
              </span>
              <Input
                value={answer}
                onChange={(event) =>
                  onChange({
                    answers: data.answers.map((a, i) => (i === index ? event.target.value : a)),
                  })
                }
                placeholder={`Answer for blank ${index + 1}`}
              />
              <button
                type="button"
                aria-label={`Remove answer ${index + 1}`}
                onClick={() => onChange({ answers: data.answers.filter((_, i) => i !== index) })}
                className="focus-ring shrink-0 rounded-lg border border-edge p-2 text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange({ answers: [...data.answers, ""] })}
          >
            <Plus size={13} />
            Add answer
          </Button>
        </div>
      </Field>
      <Field label="Explanation">
        <PlainTextarea
          value={data.explanation}
          onChange={(explanation) => onChange({ explanation })}
          rows={2}
          placeholder="Explain the completed sentence."
        />
      </Field>
    </div>
  );
}
