
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
    <section id="progress" className="bg-white px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-24">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <GitBranch size={16} />
                Your progress
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.1] tracking-[-0.055em] text-slate-950 sm:text-5xl">
                The work adds up.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-slate-600">
                Learning to code isn't about finishing a playlist. It's about
                solving problems, understanding why your code works, and
                gradually taking on harder engineering challenges.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex gap-4">
                  <Target
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Know what you've learned
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      See which topics you've completed and what still needs
                      practice.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Flame
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Build a consistent habit
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      Keep your practice visible without turning learning into
                      a competition against a timer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Trophy
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Earn progress through practice
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      Unlock milestones by solving challenges and developing
                      real skills.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="#preview"
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition-colors hover:text-blue-700"
              >
                Try a Go challenge
                <ArrowRight size={16} />
              </a>
            </div>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-slate-950 font-mono text-xs font-bold text-white">
                      Go
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Learning overview
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Your path through Go
                      </p>
                    </div>
                  </div>

                  <Braces size={19} className="text-slate-400" />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Topics</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        4
                        <span className="text-lg font-normal text-slate-400">
                          {" "}stages
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Next up</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        Data structures
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex gap-6 border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTab("skills")}
                      aria-pressed={tab === "skills"}
                      className={`relative pb-3 text-sm font-medium ${
                        tab === "skills"
                          ? "text-slate-950"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Learning path
                      {tab === "skills" && (
                        <motion.span
                          layoutId="gocraft-progress-tab"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-950"
                          transition={{
                            duration: reduceMotion ? 0 : 0.2,
                          }}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab("achievements")}
                      aria-pressed={tab === "achievements"}
                      className={`relative pb-3 text-sm font-medium ${
                        tab === "achievements"
                          ? "text-slate-950"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Achievements
                      {tab === "achievements" && (
                        <motion.span
                          layoutId="gocraft-progress-tab"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-950"
                          transition={{
                            duration: reduceMotion ? 0 : 0.2,
                          }}
                        />
                      )}
                    </button>
                  </div>

                  <motion.div
                    key={tab}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {tab === "skills" ? (
                      <div className="divide-y divide-slate-100">
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
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {percentage === 100 ? (
                                      <Check size={15} />
                                    ) : (
                                      <span className="text-xs">
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-sm font-medium text-slate-800">
                                    {skill.name}
                                  </span>
                                </div>

                                <span className="shrink-0 text-xs tabular-nums text-slate-500">
                                  {skill.completed}/{skill.total}
                                </span>
                              </div>

                              <div className="ml-10 mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                                <motion.div
                                  className="h-full rounded-full bg-slate-900"
                                  initial={
                                    reduceMotion ? false : { width: 0 }
                                  }
                                  whileInView={{ width: `${percentage}%` }}
                                  viewport={{ once: true }}
                                  transition={{
                                    duration: reduceMotion ? 0 : 0.5,
                                    delay: reduceMotion ? 0 : index * 0.06,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.name}
                            className="flex items-center gap-3 py-5"
                          >
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                achievement.unlocked
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {achievement.unlocked ? (
                                <Check size={17} />
                              ) : (
                                <LockKeyhole size={16} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                {achievement.name}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {achievement.detail}
                              </p>
                            </div>

                            {achievement.unlocked && (
                              <span className="text-xs font-medium text-emerald-700">
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
                    className="mt-3 flex items-center justify-between border-t border-slate-200 pt-5 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950"
                  >
                    Explore the learning path
                    <ChevronRight size={16} />
                  </a>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
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
