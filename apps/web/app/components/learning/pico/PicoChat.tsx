"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, FlaskConical, X } from "lucide-react";
import type { PicoContext } from "@/app/lib/pico/context";
import { askPico } from "@/app/lib/pico/ask";
import type { PicoMessage } from "@/app/lib/pico/types";
import { cn } from "@/app/lib/utils";

const SUGGESTIONS = [
  "Explain this in simpler words",
  "Why does this matter?",
  "Give me a hint",
  "Quiz me",
] as const;

export function PicoAvatar({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="Pico"
      className={className}
    >
      <rect x="3" y="3" width="42" height="42" rx="13" fill="var(--c-accent)" />
      <circle cx="17.5" cy="21.5" r="3.4" fill="var(--c-accent-contrast)" />
      <circle cx="30.5" cy="21.5" r="3.4" fill="var(--c-accent-contrast)" />
      <circle cx="17.5" cy="22" r="1.5" fill="var(--c-accent)" />
      <circle cx="30.5" cy="22" r="1.5" fill="var(--c-accent)" />
      <ellipse cx="24" cy="31.4" rx="5" ry="3.4" fill="var(--c-accent-contrast)" opacity="0.92" />
      <circle cx="24" cy="30.1" r="1.2" fill="var(--c-accent)" />
      <rect x="21.6" y="33.4" width="2" height="2.6" rx="0.5" fill="var(--c-accent-contrast)" opacity="0.92" />
      <rect x="24.4" y="33.4" width="2" height="2.6" rx="0.5" fill="var(--c-accent-contrast)" opacity="0.92" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Pico is thinking">
      <span className="pico-dot h-1.5 w-1.5 rounded-full bg-ink-faint" />
      <span className="pico-dot h-1.5 w-1.5 rounded-full bg-ink-faint" />
      <span className="pico-dot h-1.5 w-1.5 rounded-full bg-ink-faint" />
    </span>
  );
}

/**
 * Pico — GoCraft's learning companion panel.
 *
 * The component never unmounts while the student stays on the lesson page
 * (the parent toggles it visually), so the conversation survives closing
 * and reopening the panel. Mount it with `key={lessonId}` to reset state
 * when the lesson changes.
 */
export function PicoChat({
  context,
  open,
  onClose,
  focusSignal,
}: {
  context: PicoContext;
  open: boolean;
  onClose: () => void;
  /** Increment to pull focus into the input (e.g. each time Pico opens). */
  focusSignal: number;
}) {
  const [messages, setMessages] = useState<PicoMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const nextId = () => `m-${++idRef.current}`;

  useEffect(() => {
    if (focusSignal > 0 && open) inputRef.current?.focus();
  }, [focusSignal, open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Escape closes; lock body scroll only on small screens where Pico is full-screen.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const prev = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (isMobile) document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  async function send(raw?: string) {
    const question = (raw ?? input).trim();
    if (!question || thinking) return;

    const userMsg: PicoMessage = { id: nextId(), role: "user", text: question };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setThinking(true);
    try {
      const reply = await askPico({ context, history, question });
      setMessages((m) => [...m, { id: nextId(), role: "pico", text: reply }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-surface lg:w-[360px] xl:w-[380px]">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <PicoAvatar size={36} className="shrink-0 rounded-xl" />
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold leading-5 tracking-tight text-ink">
            Pico
          </p>
          <p className="font-mono text-[9px] uppercase leading-4 tracking-[0.18em] text-ink-faint">
            Learning companion
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Pico"
          className="focus-ring ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink"
        >
          <X size={17} />
        </button>
      </div>

      {/* Context strip */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-line px-4 py-2">
        <span className="rounded border border-line bg-inset px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted">
          MOD {String(context.moduleNo).padStart(2, "0")}
        </span>
        <span className="max-w-[220px] truncate rounded border border-line bg-inset px-1.5 py-0.5 text-[10.5px] font-medium text-ink-muted">
          {context.lessonTitle}
        </span>
        {context.visuals.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded border border-accent-border bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-ink">
            <FlaskConical size={10} />
            {context.visuals.length} visual{context.visuals.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="gc-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {messages.length === 0 && !thinking ? (
          <div className="flex flex-col items-center pt-6 text-center">
            <PicoAvatar size={60} className="rounded-2xl" />
            <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
              Hi, I&apos;m Pico.
            </h3>
            <p className="mt-1.5 max-w-[30ch] text-[12.5px] leading-5 text-ink-muted">
              Ask me about <span className="font-medium text-ink-2">{context.lessonTitle}</span> —
              simpler explanations, hints, or a friendly challenge.
            </p>
            <div className="mt-5 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="focus-ring rounded-xl border border-line bg-inset px-3 py-2.5 text-left text-[11.5px] font-medium leading-4 text-ink-muted transition-colors hover:border-accent-border hover:bg-accent-soft hover:text-accent-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3 py-2 text-[12.5px] leading-5 text-accent-contrast">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2">
                  <PicoAvatar size={22} className="mt-0.5 shrink-0 rounded-md" />
                  <div className="max-w-[88%] whitespace-pre-line rounded-2xl rounded-tl-md border border-line bg-surface-2 px-3 py-2 text-[12.5px] leading-6 text-ink-2">
                    {m.text}
                  </div>
                </div>
              ),
            )}
            {thinking && (
              <div className="flex items-start gap-2">
                <PicoAvatar size={22} className="mt-0.5 shrink-0 rounded-md" />
                <div className="rounded-2xl rounded-tl-md border border-line bg-surface-2 px-3 py-2">
                  <ThinkingDots />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className={cn(
            "flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 transition-colors",
            "focus-within:border-accent-border focus-within:ring-2 focus-within:ring-accent/10",
          )}
        >
          <label htmlFor="pico-input" className="sr-only">
            Ask Pico about this lesson
          </label>
          <input
            id="pico-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Pico about this lesson…"
            autoComplete="off"
            spellCheck={false}
            disabled={thinking}
            className="h-full flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="Send to Pico"
            disabled={!input.trim() || thinking}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast transition-all hover:bg-accent-hover disabled:opacity-35"
          >
            <ArrowUp size={15} strokeWidth={2.4} />
          </button>
        </form>
        <p className="mt-1.5 text-center text-[9.5px] leading-4 text-ink-faint">
          Pico runs locally in this preview — an AI backend isn&apos;t connected yet.
        </p>
      </div>
    </div>
  );
}
