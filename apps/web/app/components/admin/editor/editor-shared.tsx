"use client";

import type { ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input, Label, Select, Textarea } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function MonoTextarea({
  value,
  onChange,
  placeholder,
  rows = 6,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      className={cn(
        "focus-ring w-full resize-y rounded-lg border border-edge bg-[#0c0e13] px-3.5 py-2.5 font-mono text-[12.5px] leading-6 text-[#e6edf3] placeholder:text-[#6b7385] transition hover:border-edge-strong focus:border-accent",
        className,
      )}
    />
  );
}

export function PlainTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <Textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn("min-h-[72px]", className)}
    />
  );
}

export function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel = "Add item",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder={placeholder ?? `Item ${index + 1}`}
            value={item}
            onChange={(event) =>
              onChange(items.map((existing, i) => (i === index ? event.target.value : existing)))
            }
          />
          <button
            type="button"
            aria-label={`Remove item ${index + 1}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="focus-ring shrink-0 rounded-lg border border-edge p-2 text-ink-3 transition hover:border-hard/40 hover:bg-hard-soft hover:text-hard"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus size={13} />
        {addLabel}
      </Button>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label?: string;
}) {
  return (
    <div>
      {label ? <Label className="mb-1.5 block">{label}</Label> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "focus-ring rounded-lg border px-3 py-1.5 text-[12px] font-medium transition",
              value === option.value
                ? "border-accent bg-accent-soft text-accent-ink"
                : "border-edge text-ink-3 hover:border-edge-strong hover:bg-panel-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Language">
      {[
        "go",
        "python",
        "javascript",
        "typescript",
        "java",
        "c",
        "cpp",
        "rust",
        "bash",
        "json",
        "yaml",
        "plaintext",
      ].map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </Select>
  );
}
