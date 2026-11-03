"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type Worker = { id?: string; name?: string; description?: string };
type Channel = { id?: string; name?: string; capacity?: number; description?: string };
type Flow = {
  worker?: string;
  goroutine?: string;
  channel?: string;
  direction?: "send" | "recv";
  note?: string;
};

/**
 * Goroutines + channels at a glance: left column workers, middle channels,
 * and an annotated operation list (send ➜ / recv ◀). Authoring shape:
 * { goroutines: [{name,description?}], channels: [{name,capacity?}],
 *   flows: [{goroutine, channel, direction:"send"|"recv", note?}] }
 */
export function ConcurrencyDiagramViz({
  title = "Concurrency diagram",
  description,
  takeaway,
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const workers = useMemo<Worker[]>(
    () => (Array.isArray(config?.goroutines) ? (config!.goroutines as Worker[]) : []),
    [config],
  );

  const channels = useMemo<Channel[]>(
    () => (Array.isArray(config?.channels) ? (config!.channels as Channel[]) : []),
    [config],
  );

  const flows = useMemo<Flow[]>(
    () => {
      const raw = config?.flows ?? config?.operations;
      return Array.isArray(raw) ? (raw as Flow[]) : [];
    },
    [config],
  );

  const nameOf = (item: Worker, i: number) => item.name ?? item.id ?? `goroutine ${i + 1}`;
  const nameOfChannel = (item: Channel, i: number) => item.name ?? item.id ?? `channel ${i + 1}`;

  if (workers.length === 0 && channels.length === 0 && flows.length === 0) {
    return (
      <VizEmpty message="Nothing to diagram. Pass goroutines: [...], channels: [...], and flows: [{ goroutine, channel, direction }]." />
    );
  }

  return (
    <VizShell title={title} description={description} takeaway={takeaway}>
      <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-edge bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Goroutines
          </div>
          <div className="mt-2 space-y-1.5">
            {workers.map((w, i) => (
              <div key={i} className="rounded-md border border-accent-border bg-accent-soft px-2.5 py-1.5">
                <div className="text-[12.5px] font-medium text-accent-ink">
                  {nameOf(w, i)}
                </div>
                {w.description && (
                  <div className="text-[11px] leading-4 text-ink-muted">
                    {w.description}
                  </div>
                )}
              </div>
            ))}
            {workers.length === 0 && (
              <div className="text-[12px] text-ink-faint">None configured</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Channels
          </div>
          <div className="mt-2 space-y-1.5">
            {channels.map((c, i) => (
              <div key={i} className="rounded-md border border-success/30 bg-success-soft px-2.5 py-1.5">
                <div className="text-[12.5px] font-medium text-success">
                  {nameOfChannel(c, i)}
                  {typeof c.capacity === "number" && c.capacity > 0 && (
                    <span className="ml-1 font-mono text-[10.5px] text-ink-muted">
                      (buffer {c.capacity})
                    </span>
                  )}
                </div>
                {c.description && (
                  <div className="text-[11px] leading-4 text-ink-muted">
                    {c.description}
                  </div>
                )}
              </div>
            ))}
            {channels.length === 0 && (
              <div className="text-[12px] text-ink-faint">None configured</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-edge bg-surface p-3 sm:col-span-2 lg:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Operations
          </div>
          <ol className="mt-2 space-y-1.5">
            {flows.map((f, i) => {
              const g = f.goroutine ?? f.worker ?? "";
              return (
                <li key={i} className="flex items-start gap-2 text-[12.5px] leading-5 text-ink-2">
                  <span
                    className={`mt-0.5 font-mono text-[11px] font-semibold ${
                      f.direction === "recv" ? "text-warning" : "text-accent"
                    }`}
                  >
                    {f.direction === "recv" ? "◀" : "➜"}
                  </span>
                  <span>
                    <span className="font-mono text-[12px] text-ink">{g}</span>{" "}
                    {f.direction === "recv" ? "receives from" : "sends to"}{" "}
                    <span className="font-mono text-[12px] text-ink">{f.channel}</span>
                    {f.note && (
                      <div className="text-[11px] leading-4 text-ink-muted">{f.note}</div>
                    )}
                  </span>
                </li>
              );
            })}
            {flows.length === 0 && (
              <div className="text-[12px] text-ink-faint">None configured</div>
            )}
          </ol>
        </div>
      </div>
    </VizShell>
  );
}
