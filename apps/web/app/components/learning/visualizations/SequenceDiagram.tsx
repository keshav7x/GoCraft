"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type Speaker = string | { id: string; label?: string };

type Message = {
  from: string;
  to: string;
  label?: string;
  note?: string;
  dashed?: boolean;
};

/**
 * UML-style sequence diagram: participants as columns with lifelines,
 * messages as ordered rows with arrows. Authoring shape:
 * { participants: ["a", {id,label}], messages: [{from,to,label,dashed}] }
 */
export function SequenceDiagramViz({
  title = "Sequence diagram",
  description,
  takeaway,
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const speakers = useMemo<string[]>(() => {
    const raw = config?.participants;
    if (!Array.isArray(raw)) return [];
    return (raw as Speaker[])
      .map((s) => (typeof s === "string" ? s : (s?.label ?? s?.id ?? "")))
      .filter(Boolean);
  }, [config?.participants]);

  const byId = useMemo(() => {
    const raw = config?.participants;
    return new Map<string, string>(
      Array.isArray(raw)
        ? (raw as Speaker[])
            .map((s, i) => {
              if (typeof s === "string") return [s, s] as const;
              return [String(s?.id ?? i), String(s?.label ?? s?.id ?? "")] as const;
            })
            .filter(([id, label]) => id && label)
        : [],
    );
  }, [config?.participants]);

  const messages = useMemo<Message[]>(() => {
    const raw = config?.messages;
    return Array.isArray(raw)
      ? (raw as Message[]).filter((m) => m && m.from && m.to)
      : [];
  }, [config?.messages]);

  if (speakers.length === 0 || messages.length === 0) {
    return (
      <VizEmpty message="No sequence configured. Pass participants: [...] and messages: [{ from, to, label }]." />
    );
  }

  const xOf = (id: string): number | null => {
    const idx = byId.get(id);
    const i = idx ? speakers.indexOf(idx) : -1;
    if (i < 0) return null;
    return ((i + 0.5) / speakers.length) * 100;
  };

  const rowH = 64;
  const arrow = (a: number, b: number) => (b > a ? "→" : "←");

  return (
    <VizShell title={title} description={description} takeaway={takeaway}>
      <div className="overflow-x-auto">
        <div
          className="relative min-w-[520px]"
          style={{ height: `${64 + messages.length * rowH + 16}px` }}
        >
          {speakers.map((spk, i) => {
            const x = ((i + 0.5) / speakers.length) * 100;
            return (
              <div key={`${spk}-${i}`}>
                <div
                  className="absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-edge bg-surface px-3 py-1.5 text-center shadow-card"
                  style={{ left: `${x}%` }}
                >
                  <span className="text-[12px] font-semibold text-ink">{spk}</span>
                </div>
                <div
                  className="absolute bottom-0 top-10 w-px border-l border-dashed border-edge"
                  style={{ left: `${x}%` }}
                  aria-hidden
                />
              </div>
            );
          })}

          {messages.map((m, i) => {
            const x1 = xOf(m.from);
            const x2 = xOf(m.to);
            if (x1 === null || x2 === null) return null;
            const y = 64 + i * rowH + 28;
            return (
              <div key={`m-${i}`}>
                <div
                  className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded border border-edge bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-2"
                  style={{ left: `${(x1 + x2) / 2}%`, top: `${y - 20}px` }}
                >
                  {m.label ?? `${arrow(x1, x2)} message ${i + 1}`}
                </div>
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <line
                    x1={x1}
                    y1={(y / (64 + messages.length * rowH + 16)) * 100}
                    x2={x2}
                    y2={(y / (64 + messages.length * rowH + 16)) * 100}
                    stroke="currentColor"
                    strokeWidth="0.3"
                    strokeDasharray={m.dashed ? "2 2" : undefined}
                    className="text-accent"
                  />
                </svg>
                {m.note && (
                  <div
                    className="absolute -translate-x-1/2 text-[10.5px] leading-4 text-ink-muted"
                    style={{ left: `${(x1 + x2) / 2}%`, top: `${y + 6}px` }}
                  >
                    {m.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </VizShell>
  );
}
