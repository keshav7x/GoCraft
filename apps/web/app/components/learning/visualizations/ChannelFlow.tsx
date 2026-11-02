"use client";

import { useState } from "react";
import { VizShell } from "./viz-shared";

type Msg = { id: number; text: string };

/**
 * Message-flow visualization for buffered and unbuffered channels.
 * Shows send/receive and blocking behavior.
 */
export function ChannelFlowViz({
  title = "Channels: send, receive & blocking",
  description,
  takeaway = "Unbuffered channels block the sender until a receiver is ready. Buffered channels block only when the buffer is full.",
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const capacity = typeof config?.capacity === "number" ? Math.min(config.capacity, 6) : 0;
  const [buffer, setBuffer] = useState<Msg[]>([]);
  const [log, setLog] = useState<string[]>([
    capacity === 0
      ? "ch := make(chan string)  // unbuffered"
      : `ch := make(chan string, ${capacity})  // buffered, cap=${capacity}`,
  ]);
  const [blocked, setBlocked] = useState(false);
  const [nextId, setNextId] = useState(1);

  const pushLog = (line: string) =>
    setLog((prev) => [line, ...prev].slice(0, 6));

  const send = () => {
    const text = `msg-${nextId}`;
    if (capacity === 0 || buffer.length >= capacity) {
      // Unbuffered (or full buffer): sender blocks until someone receives.
      setBlocked(true);
      pushLog(
        `send("${text}") → BLOCKED: ${
          capacity === 0
            ? "unbuffered channel waits for a receiver"
            : `buffer full (${buffer.length}/${capacity})`
        }`
      );
      return;
    }
    setBuffer((prev) => [...prev, { id: nextId, text }]);
    setNextId((n) => n + 1);
    pushLog(`send("${text}") → queued in buffer (${buffer.length + 1}/${capacity})`);
  };

  const receive = () => {
    if (buffer.length === 0) {
      setBlocked(true);
      pushLog("recv() → BLOCKED: no message available");
      return;
    }
    const [first, ...rest] = buffer;
    setBuffer(rest);
    setBlocked(false);
    pushLog(`recv() → got "${first!.text}" (${rest.length}/${capacity} left)`);
  };

  const reset = () => {
    setBuffer([]);
    setBlocked(false);
    setNextId(1);
    setLog([
      capacity === 0
        ? "ch := make(chan string)  // unbuffered"
        : `ch := make(chan string, ${capacity})  // buffered, cap=${capacity}`,
    ]);
  };

  const slots = capacity === 0 ? 1 : capacity;

  return (
    <VizShell
      title={title}
      description={description ?? "Send and receive messages; watch when the sender blocks."}
      takeaway={takeaway}
      status={log[0]}
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            onClick={send}
            className="rounded-md border border-accent-border bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent-ink transition-colors hover:bg-accent/10"
          >
            ch &lt;- send
          </button>
          <button
            type="button"
            onClick={receive}
            className="rounded-md border border-edge bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:bg-panel-muted"
          >
            &lt;- ch receive
          </button>
          <span className="ml-1 font-mono text-[11.5px] text-ink-faint">
            cap={capacity} · len={buffer.length}
          </span>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {/* Producer */}
        <div className="rounded-lg border border-edge bg-inset px-3 py-3 text-center">
          <div className="font-mono text-[12.5px] font-medium text-ink-2">
            go producer()
          </div>
          <div className="mt-1 text-[11.5px] text-ink-faint">sender goroutine</div>
        </div>

        {/* Channel */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`flex gap-1.5 rounded-lg border px-3 py-2.5 ${
              blocked
                ? "border-warning/50 bg-warning-soft"
                : "border-accent-border bg-accent-soft"
            }`}
            role="list"
            aria-label="channel buffer"
          >
            {Array.from({ length: slots }, (_, i) => {
              const msg = buffer[i];
              return (
                <div
                  key={i}
                  role="listitem"
                  className={`flex h-9 w-16 items-center justify-center rounded-md border font-mono text-[11.5px] ${
                    msg
                      ? "border-accent-border bg-surface text-ink"
                      : "border-dashed border-line-strong bg-transparent text-ink-faint"
                  }`}
                >
                  {msg ? msg.text : capacity === 0 ? "—" : "empty"}
                </div>
              );
            })}
          </div>
          <div className="font-mono text-[11px] text-ink-faint">
            chan {capacity > 0 ? `[]string (${capacity})` : "string"}
          </div>
          {blocked && (
            <div
              role="status"
              className="rounded-md bg-warning-soft px-2 py-1 text-[11.5px] font-medium text-warning"
            >
              goroutine blocked
            </div>
          )}
        </div>

        {/* Consumer */}
        <div className="rounded-lg border border-edge bg-inset px-3 py-3 text-center">
          <div className="font-mono text-[12.5px] font-medium text-ink-2">
            go consumer()
          </div>
          <div className="mt-1 text-[11.5px] text-ink-faint">receiver goroutine</div>
        </div>
      </div>

      <div className="mt-4 space-y-1" aria-label="event log">
        {log.map((line, i) => (
          <div
            key={`${line}-${i}`}
            className={`font-mono text-[11.5px] leading-5 ${
              i === 0 ? "text-ink-2" : "text-ink-faint"
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </VizShell>
  );
}
