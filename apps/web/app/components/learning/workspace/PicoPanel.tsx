"use client";

import { ArrowUp, Sparkles, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PicoContext } from "@/app/lib/pico/context";
import type { PicoMessage } from "@/app/lib/pico/types";
import { askPico } from "@/app/lib/pico/respond";
import { cn } from "@/app/lib/utils";

const MAX_HISTORY = 40;
const SUGGESTIONS = [
  "Explain it simply",
  "Give me a hint",
  "Quiz me",
  "Why does this matter?",
];

function PicoAvatar({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Pico"
      className="shrink-0"
    >
      <rect x="1" y="1" width="30" height="30" rx="9" className="fill-[#0d84b6]" />
      <circle cx="11.5" cy="14" r="2.1" className="fill-white" />
      <circle cx="20.5" cy="14" r="2.1" className="fill-white" />
      <circle cx="12.2" cy="14.6" r="1.05" className="fill-[#0d84b6]" />
      <circle cx="21.2" cy="14.6" r="1.05" className="fill-[#0d84b6]" />
      <path
        d="M11 20.5c1.4 1.5 3.2 2.2 5 2.2s3.6-.7 5-2.2"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function greetingText(ctx: PicoContext): string {
  return `Hey, I'm Pico! I've read over «${ctx.lessonTitle}» with you in mind. Ask me anything about it — or pick something below.`;
}

/** Tiny renderer: paragraphs + `inline code` backticks only. */
function MessageText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-wrap text-[13px] leading-5">
          {para.split(/(`[^`]+`)/g).map((part, j) =>
            part.startsWith("`") && part.endsWith("`") ? (
              <code
                key={j}
                className="rounded bg-black/10 px-1 py-0.5 font-mono text-[11.5px]"
              >
                {part.slice(1, -1)}
              </code>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

export type PicoPanelProps = {
  open: boolean;
  onClose: () => void;
  context: PicoContext;
};

/**
 * Pico — the lesson-aware learning companion.
 *
 * Availability: independent of the Visual Lab. Works on every lesson,
 * visualization or not.
 *
 * Conversation preservation: the panel stays mounted while toggled
 * closed (hidden via CSS, not unmounted), so the thread survives
 * open/close cycles for the whole session on this lesson. Mount it
 * with `key={lessonId}` to reset the thread when the lesson changes.
 */
export function PicoPanel({ open, onClose, context }: PicoPanelProps) {
  const baseId = useId();
  const idRef = useRef(0);
  const nextId = useCallback(() => `${baseId}-${++idRef.current}`, [baseId]);
  const [messages, setMessages] = useState<PicoMessage[]>(() => [
    { id: `${baseId}-greeting`, role: "pico", text: greetingText(context) },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userHasAsked = useMemo(
    () => messages.some((m) => m.role === "user"),
    [messages],
  );

  /* Autoscroll on new messages. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  /* Focus the composer when the panel opens. */
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => textareaRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  /* Escape closes; lock body scroll on small screens (full-screen sheet). */
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
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

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || busy) return;
      setDraft("");
      const userMessage: PicoMessage = {
        id: nextId(),
        role: "user",
        text: question,
      };
      const history = [...messages, userMessage].slice(-MAX_HISTORY);
      setMessages(history);
      setBusy(true);
      const started = Date.now();
      try {
        const answer = await askPico({
          question,
          history: history.map((m) => ({ role: m.role, text: m.text })),
          context,
        });
        /* Small floor delay so the thinking state is perceptible. */
        const elapsed = Date.now() - started;
        if (elapsed < 450) {
          await new Promise((r) => setTimeout(r, 450 - elapsed));
        }
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "pico",
            text: answer,
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, context, messages, nextId],
  );

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300 ease-out",
        "lg:static lg:inset-auto lg:z-auto lg:h-full",
        "lg:w-[380px] lg:shrink-0 lg:overflow-hidden lg:border-l lg:border-line lg:transition-[width,opacity]",
        open
          ? "visible translate-y-0 opacity-100 lg:w-[380px] lg:opacity-100"
          : "pointer-events-none invisible translate-y-3 opacity-0 lg:w-0 lg:translate-y-0 lg:border-transparent lg:opacity-0",
      )}
    >
      {/* Inner fixed-width column so the width transition reveals it cleanly. */}
      <div className="flex h-full w-full flex-col bg-surface lg:w-[380px] 2xl:w-[420px]">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <PicoAvatar size={30} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13.5px] font-semibold leading-4 tracking-tight text-ink">
                Pico
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-ink">
                  <Sparkles size={8} />
                  Beta
                </span>
              </p>
              <p className="mt-0.5 truncate text-[10.5px] leading-3 text-ink-faint">
                Learning companion · knows this lesson
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Pico"
            title="Close Pico (keeps your chat)"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation with Pico"
          className="gc-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4"
        >
          {messages.map((message) => {
            const mine = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  mine && "flex-row-reverse",
                )}
              >
                {!mine && <PicoAvatar size={22} />}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2.5",
                    mine
                      ? "rounded-br-md bg-accent-soft text-accent-ink"
                      : "rounded-bl-md border border-line bg-surface-2 text-ink-2",
                  )}
                >
                  <MessageText text={message.text} />
                </div>
              </div>
            );
          })}

          {busy && (
            <div className="flex items-end gap-2" aria-label="Pico is thinking">
              <PicoAvatar size={22} />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suggestion chips — only until the student asks something. */}
          {!userHasAsked && !busy && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:border-accent-border hover:text-accent-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-line bg-surface p-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
            className="flex items-end gap-2 rounded-xl border border-line bg-inset p-1.5 transition-colors focus-within:border-accent-border"
          >
            <label htmlFor="pico-input" className="sr-only">
              Ask Pico a question about this lesson
            </label>
            <textarea
              id="pico-input"
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              rows={1}
              maxLength={600}
              placeholder="Ask about this lesson…"
              className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] leading-5 text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast transition-all hover:bg-accent-hover disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
          </form>
          <p className="mt-1.5 px-1 text-[9.5px] leading-3 text-ink-faint">
            Pico preview — answers are assembled from this lesson&apos;s content.
            Swap <code>askPico</code> in <code>app/lib/pico/respond.ts</code> for a
            real model when one is connected.
          </p>
        </div>
      </div>
    </div>
  );
}
