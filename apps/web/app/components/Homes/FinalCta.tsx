"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="bg-surface px-5 py-20 text-ink sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal y={20}>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-7 shadow-card sm:p-12 lg:p-20">
            <div className="relative z-10 max-w-3xl">
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-ink-3">
                The first challenge
              </p>

              <h2
                id="cta-title"
                className="text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
              >
                Start with lesson one.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-ink-2 sm:text-lg sm:leading-8">
                Lesson one asks you to create a variable named age. The
                checks run in your browser, so there is nothing to install.
              </p>

              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <motion.a
                  href="#preview"
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-contrast transition-colors duration-150 ease-smooth hover:bg-accent-hover"
                >
                  Start lesson one
                  <ArrowRight size={16} aria-hidden="true" />
                </motion.a>

                <a
                  href="#learn"
                  className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-2 transition-colors duration-150 ease-smooth hover:text-ink"
                >
                  Explore the path
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-150 ease-out-fluid group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </a>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-5 text-xs text-ink-3 sm:mt-24"
            >
              <span>Checks run in your browser.</span>
              <span className="text-right">
                XP and leaderboards shown here are demo data.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
