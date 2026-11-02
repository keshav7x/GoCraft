"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type AuthSuccessOverlayProps = {
  onDone: () => void;
  title?: string;
  subtitle?: string;
};

export function AuthSuccessOverlay({
  onDone,
  title = "You're in.",
  subtitle = "Welcome to GoCraft.",
}: AuthSuccessOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const holdMs = reduceMotion ? 900 : 1900;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="auth-success"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.25, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center px-6">
            <div className="relative">
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-full bg-emerald-400/25 blur-xl"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                transition={{
                  duration: reduceMotion ? 0.15 : 0.5,
                  delay: reduceMotion ? 0 : 0.15,
                  ease: "easeOut",
                }}
              />

              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 shadow-[0_0_0_10px_rgba(16,185,129,0.12),0_0_48px_rgba(16,185,129,0.35)]"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0, transition: { duration: 0.2 } }
                    : {
                        opacity: 0,
                        scale: 0.85,
                        transition: { duration: 0.3, ease: "easeOut" },
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 260, damping: 22, delay: 0.1 }
                }
              >
                <svg
                  viewBox="0 0 48 48"
                  className="h-11 w-11"
                  fill="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M13.5 25.5 L21 33 L34.5 16.5"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: reduceMotion ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.35,
                      delay: reduceMotion ? 0 : 0.5,
                      ease: "easeOut",
                    }}
                  />
                </svg>
              </motion.div>
            </div>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.3,
                delay: reduceMotion ? 0.1 : 0.75,
                ease: "easeOut",
              }}
            >
              <p className="text-xl font-semibold tracking-tight text-slate-900">
                {title}
              </p>
              <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
