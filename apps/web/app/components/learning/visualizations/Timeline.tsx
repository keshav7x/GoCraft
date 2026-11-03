"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type TimelineEvent = {
  year?: string;
  when?: string;
  title?: string;
  description?: string;
};

/**
 * Vertical timeline: year marker, event title, and description per entry.
 * Accepts `year` or `when` as the marker label.
 */
export function TimelineViz({
  title = "Timeline",
  description,
  takeaway,
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const events = useMemo<TimelineEvent[]>(() => {
    const raw = config?.events;
    return Array.isArray(raw)
      ? (raw as TimelineEvent[]).filter(
          (e) => e && (typeof e.title === "string" || typeof e.year === "string" || typeof e.when === "string"),
        )
      : [];
  }, [config?.events]);

  if (events.length === 0) {
    return (
      <VizEmpty message="No timeline events configured. Pass events: [{ year, title, description }]." />
    );
  }

  return (
    <VizShell
      title={title}
      description={description ?? "Follow the sequence of events in order."}
      takeaway={takeaway}
    >
      <ol className="relative space-y-5 px-2 py-1">
        {/* Vertical rail behind the markers */}
        <span
          className="absolute left-[52px] top-2 h-[calc(100%-24px)] w-px bg-edge"
          aria-hidden
        />
        {events.map((event, i) => {
          const marker = event.year ?? event.when ?? "";
          return (
            <li key={i} className="relative flex items-start gap-4">
              {marker ? (
                <span className="z-10 mt-0.5 min-w-[64px] rounded-md border border-accent-border bg-accent-soft px-1.5 py-1 text-center text-[11px] font-semibold text-accent-ink tabular-nums">
                  {marker}
                </span>
              ) : (
                <span className="z-10 mt-2 h-3 w-3 shrink-0 rounded-full border border-accent bg-accent-soft" />
              )}
              <div className="relative min-w-0 pl-2">
                {marker && (
                  <span
                    className="absolute -left-[9px] top-2.5 h-3 w-3 rounded-full border border-accent bg-accent-soft"
                    aria-hidden
                  />
                )}
                {event.title && (
                  <div className="text-[13.5px] font-medium leading-5 text-ink">
                    {event.title}
                  </div>
                )}
                {event.description && (
                  <div className="mt-0.5 text-[12.5px] leading-5 text-ink-muted">
                    {event.description}
                  </div>
                )}
                {!event.title && !event.description && marker && (
                  <div className="text-[13px] leading-5 text-ink-muted">{marker}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </VizShell>
  );
}
