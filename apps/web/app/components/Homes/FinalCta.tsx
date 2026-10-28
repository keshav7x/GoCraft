
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
      className="bg-white px-5 py-20 text-neutral-950 sm:px-8 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal y={20}>
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 sm:p-12 lg:p-20">
            <div className="relative z-10 max-w-3xl">
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                The next step
              </p>

              <h2
                id="cta-title"
                className="text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
              >
                Your next level
                <br />
                starts here.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-neutral-500 sm:text-lg sm:leading-8">
                Write code. Solve challenges. Earn XP.
                <br className="hidden sm:block" />
                Build your craft, one rep at a time.
              </p>

              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
                <motion.a
                  href="#preview"
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
                >
                  Start with Go
                  <ArrowRight size={16} aria-hidden="true" />
                </motion.a>

                <a
                  href="#learn"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
                >
                  Explore the path
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="mt-16 flex items-center justify-between gap-4 border-t border-neutral-200 pt-5 text-xs text-neutral-500 sm:mt-24"
            >
              <span>Built for people who love to build.</span>
              <span className="text-right">Go is just the beginning.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
