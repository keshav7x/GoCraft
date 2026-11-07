"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  Flame,
  GitBranch,
  LockKeyhole,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";

import { Reveal } from "./Reveal";

const skills = [
  { name: "Go fundamentals", completed: 8, total: 8 },
  { name: "Data structures", completed: 5, total: 12 },
  { name: "HTTP & APIs", completed: 2, total: 10 },
  { name: "Concurrency", completed: 0, total: 8 },
];

const achievements = [
  {
    name: "First commit",
    detail: "Complete your first challenge",
    unlocked: true,
  },
  {
    name: "Problem solver",
    detail: "Solve 10 challenges",
    unlocked: false,
  },
  {
    name: "Systems thinker",
    detail: "Complete your first concurrency challenge",
    unlocked: false,
  },
];

export function ProgressSection() {
  const [tab, setTab] = useState<"skills" | "achievements">("skills");
  const reduceMotion = useReducedMotion();

  return (
    <section id="progress" className="bg-canvas px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-24">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-ink-3">
                <GitBranch size={16} aria-hidden="true" />
                Your progress
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.1] tracking-[-0.055em] text-ink sm:text-5xl">
                See what you finished.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-ink-2">
                The overview lists every stage, how many challenges you have
                passed in each one, and what to open next.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex gap-4">
                  <Target
                    size={19}
                    className="mt-0.5 shrink-0 text-ink-3"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      Know what you&apos;ve learned
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink-2">
                      Every stage shows challenges passed and challenges
                      left.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Flame
                    size={19}
                    className="mt-0.5 shrink-0 text-ink-3"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      Build a consistent habit
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink-2">
                      Your streak shows how many days in a row you solved a
                      challenge.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Trophy
                    size={19}
                    className="mt-0.5 shrink-0 text-ink-3"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      Earn progress through practice
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink-2">
                      Achievements unlock when you pass challenges, like
                      your first ten.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="#preview"
                className="group mt-10 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink transition-colors duration-150 ease-smooth hover:text-accent-700"
              >
                Try a Go challenge
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-150 ease-out-fluid group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </a>
            </div>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-accent-contrast">
                      Go
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Learning overview
                      </p>
                      <p className="mt-0.5 text-xs text-ink-3">
                        Your path through Go
                      </p>
                    </div>
                  </div>

                  <Braces size={19} className="text-ink-4" aria-hidden="true" />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-ink-3">Topics</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                        4
                        <span className="text-lg font-normal text-ink-4">
                          {" "}
                          tracks
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-ink-3">Next up</p>
                      <p className="mt-2 text-lg font-semibold text-ink">
                        Data structures
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex gap-6 border-b border-line">
                    <button
                      type="button"
                      onClick={() => setTab("skills")}
                      aria-pressed={tab === "skills"}
                      className={`relative cursor-pointer pb-3 text-sm font-medium transition-colors duration-150 ease-smooth ${
                        tab === "skills"
                          ? "text-ink"
                          : "text-ink-3 hover:text-ink-2"
                      }`}
                    >
                      Topics
                      {tab === "skills" && (
                        <motion.span
                          layoutId="gocraft-progress-tab"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                          transition={{
                            duration: reduceMotion ? 0 : 0.2,
                            ease: [0.32, 0.72, 0, 1],
                          }}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab("achievements")}
                      aria-pressed={tab === "achievements"}
                      className={`relative cursor-pointer pb-3 text-sm font-medium transition-colors duration-150 ease-smooth ${
                        tab === "achievements"
                          ? "text-ink"
                          : "text-ink-3 hover:text-ink-2"
                      }`}
                    >
                      Achievements
                      {tab === "achievements" && (
                        <motion.span
                          layoutId="gocraft-progress-tab"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                          transition={{
                            duration: reduceMotion ? 0 : 0.2,
                            ease: [0.32, 0.72, 0, 1],
                          }}
                        />
                      )}
                    </button>
                  </div>

                  <motion.div
                    key={tab}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.15,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    {tab === "skills" ? (
                      <div className="divide-y divide-line">
                        {skills.map((skill, index) => {
                          const percentage =
                            (skill.completed / skill.total) * 100;

                          return (
                            <div key={skill.name} className="py-5">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex size-7 items-center justify-center rounded-md ${
                                      percentage === 100
                                        ? "bg-success-soft text-success"
                                        : "bg-surface-2 text-ink-3"
                                    }`}
                                  >
                                    {percentage === 100 ? (
                                      <Check size={15} aria-hidden="true" />
                                    ) : (
                                      <span className="text-xs">
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-sm font-medium text-ink-2">
                                    {skill.name}
                                  </span>
                                </div>

                                <span className="shrink-0 text-xs tabular-nums text-ink-3">
                                  {skill.completed}/{skill.total}
                                </span>
                              </div>

                              <div className="ml-10 mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
                                <motion.div
                                  className="h-full rounded-full bg-ink"
                                  initial={
                                    reduceMotion ? false : { width: 0 }
                                  }
                                  whileInView={{ width: `${percentage}%` }}
                                  viewport={{ once: true }}
                                  transition={{
                                    duration: reduceMotion ? 0 : 0.5,
                                    delay: reduceMotion ? 0 : index * 0.06,
                                    ease: [0.32, 0.72, 0, 1],
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="divide-y divide-line">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.name}
                            className="flex items-center gap-3 py-5"
                          >
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                achievement.unlocked
                                  ? "bg-success-soft text-success"
                                  : "bg-surface-2 text-ink-4"
                              }`}
                            >
                              {achievement.unlocked ? (
                                <Check size={17} aria-hidden="true" />
                              ) : (
                                <LockKeyhole size={16} aria-hidden="true" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-ink">
                                {achievement.name}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-ink-3">
                                {achievement.detail}
                              </p>
                            </div>

                            {achievement.unlocked && (
                              <span className="text-xs font-medium text-success">
                                Earned
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  <a
                    href="#learn"
                    className="mt-3 flex cursor-pointer items-center justify-between border-t border-line pt-5 text-sm font-medium text-ink-2 transition-colors duration-150 ease-smooth hover:text-ink"
                  >
                    Explore the learning path
                    <ChevronRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-ink-4">
                Illustrative interface. Progress values shown are examples,
                not live account data.
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
