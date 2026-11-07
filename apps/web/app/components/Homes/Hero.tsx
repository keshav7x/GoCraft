"use client";

import { ArrowRight, Braces, Check, Code2, Terminal, Users } from "lucide-react";
import { Reveal } from "./Reveal";

const benefits = [
  "No setup required",
  "Runs in the browser",
  "Build a real project",
];

const features = [
  {
    icon: Braces,
    title: "Learn",
    description: "One concept at a time, with concise explanations and practical Go examples.",
  },
  {
    icon: Code2,
    title: "Practice",
    description: "Write Go directly in the browser and run the checks on your solution.",
  },
  {
    icon: Terminal,
    title: "Build",
    description: "Apply what you learn by building a working URL shortener from scratch.",
  },
  {
    icon: Users,
    title: "Compete",
    description: "Earn XP, maintain a streak, and climb the weekly leaderboard with friends.",
  },
];

export function Hero() {
  return (
    <section
      id="top"
      className="bg-surface px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent text-white">
                <Braces size={12} strokeWidth={2} aria-hidden="true" />
              </span>
              Learn Go by writing real code
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-balance text-[clamp(3.25rem,7.2vw,6.5rem)] font-semibold leading-[0.99] tracking-[-0.075em] text-ink">
              Learn Go by building
              <br />
              <span className="text-ink-3">things that run.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-ink-2 sm:mt-8 sm:text-lg sm:leading-8">
              A focused path from your first variable to a complete URL
              shortener. Every lesson ends with a challenge you solve in the
              browser.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href="#preview"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover motion-safe:active:scale-[0.97] motion-reduce:transition-none"
              >
                Start lesson one
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>

              <a
                href="#learn"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink-2 transition-colors duration-150 hover:border-line-strong hover:bg-canvas motion-safe:active:scale-[0.97] motion-reduce:transition-none"
              >
                See the path
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-3 sm:text-sm"
                >
                  <Check
                    size={14}
                    strokeWidth={1.8}
                    className="text-success"
                    aria-hidden="true"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="mt-20 overflow-hidden rounded-2xl border border-line bg-surface sm:mt-24 lg:mt-28">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className={`group px-5 py-6 transition-colors duration-150 hover:bg-canvas sm:px-6 sm:py-7 lg:px-7 ${
                      index !== 0 ? "border-t border-line sm:border-t-0" : ""
                    } ${
                      index === 1 ? "sm:border-l sm:border-line" : ""
                    } ${
                      index === 2
                        ? "sm:border-t sm:border-line lg:border-t-0 lg:border-l"
                        : ""
                    } ${
                      index === 3
                        ? "sm:border-l sm:border-t sm:border-line lg:border-t-0"
                        : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-canvas text-ink-2 transition-colors duration-150 group-hover:border-line-strong group-hover:bg-surface">
                      <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-ink">
                      {feature.title}
                    </p>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-ink-3">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-ink-3">
              No account needed to try the first lesson.
            </p>

            <a
              href="#learn"
              className="group inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
            >
              See how it works
              <ArrowRight
                size={13}
                aria-hidden="true"
                className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
