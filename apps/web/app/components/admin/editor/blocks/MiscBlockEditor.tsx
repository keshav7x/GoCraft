"use client";

import type { BlockDataMap } from "@/app/lib/admin/types";
import { Field, LanguageSelect, MonoTextarea, PlainTextarea } from "../editor-shared";

export function TerminalOutputBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["terminalOutput"];
  onChange: (patch: Partial<BlockDataMap["terminalOutput"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Terminal title">
        <input
          value={data.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Terminal"
          className="focus-ring h-9 w-full rounded-lg border border-edge bg-panel px-3 text-sm text-ink transition hover:border-edge-strong focus:border-accent"
        />
      </Field>
      <Field label="Output">
        <MonoTextarea
          value={data.output}
          onChange={(output) => onChange({ output })}
          rows={5}
          placeholder="$ go run main.go"
        />
      </Field>
    </div>
  );
}

export function FileStructureBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["fileStructure"];
  onChange: (patch: Partial<BlockDataMap["fileStructure"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Title">
        <input
          value={data.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Project layout"
          className="focus-ring h-9 w-full rounded-lg border border-edge bg-panel px-3 text-sm text-ink transition hover:border-edge-strong focus:border-accent"
        />
      </Field>
      <Field label="File tree" hint="One file or folder per line.">
        <MonoTextarea
          value={data.tree}
          onChange={(tree) => onChange({ tree })}
          rows={6}
          placeholder={"cmd/\n  main.go\ninternal/\n  server.go\ngo.mod"}
        />
      </Field>
    </div>
  );
}

export function HintBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["hint"];
  onChange: (patch: Partial<BlockDataMap["hint"]>) => void;
}) {
  return (
    <Field label="Hint text" hint="Learners can reveal this when stuck.">
      <PlainTextarea
        value={data.text}
        onChange={(text) => onChange({ text })}
        rows={2}
        placeholder="A nudge in the right direction…"
      />
    </Field>
  );
}

export function SolutionExplanationBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["solutionExplanation"];
  onChange: (patch: Partial<BlockDataMap["solutionExplanation"]>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="w-40">
        <Field label="Language">
          <LanguageSelect value={data.language} onChange={(language) => onChange({ language })} />
        </Field>
      </div>
      <Field label="Solution code">
        <MonoTextarea
          value={data.code}
          onChange={(code) => onChange({ code })}
          rows={6}
          placeholder="// reference solution"
        />
      </Field>
      <Field label="Explanation">
        <PlainTextarea
          value={data.explanation}
          onChange={(explanation) => onChange({ explanation })}
          rows={3}
          placeholder="Walk through the solution step by step."
        />
      </Field>
    </div>
  );
}
