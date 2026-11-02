"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import type { BlockDataMap } from "@/app/lib/admin/types";
import { Field, LanguageSelect, MonoTextarea, PlainTextarea } from "../editor-shared";

function parseHighlightLines(raw: string): Set<number> {
  const lines = new Set<number>();
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const range = trimmed.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      for (let i = start; i <= end; i += 1) lines.add(i);
    } else if (/^\d+$/.test(trimmed)) {
      lines.add(Number(trimmed));
    }
  }
  return lines;
}

export function CodeBlockEditor({
  data,
  onChange,
}: {
  data: BlockDataMap["code"];
  onChange: (patch: Partial<BlockDataMap["code"]>) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(true);
  const highlighted = parseHighlightLines(data.highlightLines);
  const lines = data.code.split("\n");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Field label="Language">
            <LanguageSelect value={data.language} onChange={(language) => onChange({ language })} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Highlight lines" hint="e.g. 3 or 2-5, 8">
            <Input
              value={data.highlightLines}
              onChange={(event) => onChange({ highlightLines: event.target.value })}
              placeholder="e.g. 2-4"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={() => setPreviewOpen((open) => !open)}
          className="focus-ring mb-0.5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-edge px-3 text-[12px] font-medium text-ink-2 transition hover:bg-panel-muted"
        >
          {previewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
          {previewOpen ? "Hide preview" : "Preview"}
        </button>
      </div>

      <Field label="Code">
        <MonoTextarea
          value={data.code}
          onChange={(code) => onChange({ code })}
          placeholder={'package main\n\nfunc main() {}'}
          rows={8}
        />
      </Field>

      {previewOpen ? (
        <div className="overflow-hidden rounded-lg border border-edge">
          <div className="flex items-center justify-between border-b border-edge bg-panel-muted px-3 py-1.5">
            <Badge variant="neutral">{data.language}</Badge>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-4">
              Rendered preview
            </span>
          </div>
          <pre className="gc-scrollbar overflow-x-auto bg-[#0c0e13] py-3 font-mono text-[12.5px] leading-6">
            {lines.map((line, index) => (
              <div
                key={index}
                className={
                  highlighted.has(index + 1)
                    ? "bg-[#1f6feb]/20 px-3.5 text-[#e6edf3]"
                    : "px-3.5 text-[#c9d1d9]"
                }
              >
                <span className="mr-4 inline-block w-6 select-none text-right text-[#6b7385]">
                  {index + 1}
                </span>
                {line || " "}
              </div>
            ))}
          </pre>
        </div>
      ) : null}

      <Field label="Explanation" hint="Shown to learners below the code.">
        <PlainTextarea
          value={data.explanation}
          onChange={(explanation) => onChange({ explanation })}
          placeholder="Explain what this code does and why."
          rows={3}
        />
      </Field>

      <Field label="Expected output">
        <MonoTextarea
          value={data.expectedOutput}
          onChange={(expectedOutput) => onChange({ expectedOutput })}
          placeholder="What the learner should see when running this."
          rows={3}
        />
      </Field>
    </div>
  );
}
