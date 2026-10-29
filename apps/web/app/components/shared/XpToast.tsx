"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";
import { useDemoStore } from "../../lib/progress-store";

export function XpToast() {
  const event = useDemoStore((s) => s.lastXpEvent);
  const clear = useDemoStore((s) => s.clearLastXpEvent);

  useEffect(() => {
    if (!event) return;
    const timer = setTimeout(clear, 1800);
    return () => clearTimeout(timer);
  }, [event, clear]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[90] -translate-x-1/2"
    >
      <AnimatePresence>
        {event ? (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 rounded-full border border-edge bg-panel px-4 py-2.5 shadow-lg shadow-ink/10"
          >
            <span
              className={
                event.amount >= 0
                  ? "flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
                  : "flex h-6 w-6 items-center justify-center rounded-full bg-panel-muted text-ink-muted"
              }
            >
              <Zap size={13} />
            </span>
            <span className="text-sm font-semibold text-ink">
              {event.amount >= 0 ? "+" : ""}
              {event.amount} XP
            </span>
            <span className="text-xs text-ink-muted">{event.label}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
