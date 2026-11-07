"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Circle,
  Code2,
  Lightbulb,
  Play,
  RotateCcw,
  Terminal,
  Trophy,
  Zap,
} from "lucide-react";

import { Reveal } from "./Reveal";

type Tab = "lesson" | "challenge";
type CheckStatus = "idle" | "passed" | "failed";

const LESSON_CODE = `package main

import "fmt"

func main() {
    name := "Go"
    age := 10

    fmt.Println(name)
    fmt.Println(age)
}`;

const STARTER_CODE = `package main

import "fmt"

func main() {
    name := "Go"

    // TODO: Create a variable named age
    // TODO: Give age the integer value 10

    fmt.Println(name)
    fmt.Println(age)
}`;

const INITIAL_HINTS = [
  "Variables let you store values under a name.",
  "Inside main(), declare a variable using the := operator.",
  "Try writing: age := 10",
];

const LESSONS = [
  { title: "Variables & types", xp: 20 },
  { title: "Strings & numbers", xp: 25 },
  { title: "Conditions", xp: 30 },
];

function hasAgeDeclaration(code: string) {
  return /^\s*age\s*:=\s*10\s*$/m.test(code);
}

function hasPrintStatements(code: string) {
  return (
    /fmt\.Println\s*\(\s*name\s*\)/.test(code) &&
    /fmt\.Println\s*\(\s*age\s*\)/.test(code)
  );
}

export function ChallengePreview() {
  const [tab, setTab] = useState<Tab>("lesson");
  const [code, setCode] = useState(STARTER_CODE);
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [hintIndex, setHintIndex] = useState(-1);
  const [showOutput, setShowOutput] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xp, setXp] = useState(0);

  const isCorrect =
    hasAgeDeclaration(code) && hasPrintStatements(code);

  function openChallenge() {
    setTab("challenge");
    setStatus("idle");
    setShowOutput(false);
  }

  function runChecks() {
    setShowOutput(true);

    if (isCorrect) {
      setStatus("passed");

      if (!completed) {
        setCompleted(true);
        setXp((current) => current + 20);
      }
    } else {
      setStatus("failed");
    }
  }

  function resetChallenge() {
    setCode(STARTER_CODE);
    setStatus("idle");
    setHintIndex(-1);
    setShowOutput(false);
  }

  function revealHint() {
    setHintIndex((current) =>
      Math.min(current + 1, INITIAL_HINTS.length - 1)
    );
  }

  function nextLesson() {
    setCode(STARTER_CODE);
    setStatus("idle");
    setHintIndex(-1);
    setShowOutput(false);
    setCompleted(false);
    setXp(0);
    setTab("lesson");
  }

  return (
    <section
      id="preview"
      className="bg-canvas px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                The first lesson
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
                Read the concept.
                <br />
                Write the code.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-ink-2 sm:text-lg sm:leading-8">
                The first lesson explains variables, then asks you to write
                one. Hints are there if you get stuck.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-surface-2">
                <Trophy size={17} className="text-ink-2" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xs text-ink-3">XP earned</p>
                <p className="text-lg font-semibold tabular-nums text-ink">
                  {xp}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-surface-2">
                  <Code2 size={19} className="text-ink-2" aria-hidden="true" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink">
                    Your first Go lesson
                  </p>
                  <p className="mt-1 text-xs text-ink-3">
                    Variables and data types
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-2">
                  Beginner
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink-2">
                  <Zap size={13} aria-hidden="true" />
                  20 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-line px-4 sm:px-6">
              <div className="flex gap-6">
                {(
                  [
                    { id: "lesson", label: "01 Learn" },
                    { id: "challenge", label: "02 Challenge" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    aria-pressed={tab === item.id}
                    className={`relative cursor-pointer py-4 text-sm transition-colors duration-150 ease-smooth ${
                      tab === item.id
                        ? "font-semibold text-ink"
                        : "text-ink-3 hover:text-ink-2"
                    }`}
                  >
                    {item.label}

                    {item.id === "challenge" && completed && (
                      <Check
                        size={13}
                        className="ml-1.5 inline text-success"
                        aria-hidden="true"
                      />
                    )}

                    {tab === item.id && (
                      <motion.span
                        layoutId="gocraft-preview-tab"
                        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ink"
                        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <span className="hidden text-xs text-ink-4 sm:block">
                Lesson 1 of 12
              </span>
            </div>

            <div className="grid min-w-0 lg:grid-cols-2">
              <div className="min-w-0 border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r">
                {tab === "lesson" ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-4">
                      The concept
                    </p>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      Meet variables.
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-ink-2">
                      A variable stores a value under a name. Instead of
                      repeating a value everywhere, you can give it a name
                      and use it whenever you need it.
                    </p>

                    <div className="mt-6 rounded-xl border border-line p-4">
                      <p className="text-xs font-semibold text-ink-2">
                        Two things to notice
                      </p>

                      <div className="mt-4 space-y-4">
                        <div className="flex gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-xs text-ink-2">
                            1
                          </span>

                          <div>
                            <p className="text-sm font-medium text-ink">
                              The variable name
                            </p>
                            <p className="mt-1 text-sm leading-5 text-ink-2">
                              <code className="font-mono text-xs">age</code>{" "}
                              is the name we use to refer to the value.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-xs text-ink-2">
                            2
                          </span>

                          <div>
                            <p className="text-sm font-medium text-ink">
                              The value
                            </p>
                            <p className="mt-1 text-sm leading-5 text-ink-2">
                              <code className="font-mono text-xs">10</code>{" "}
                              is an integer. Go infers the type when you
                              use{" "}
                              <code className="font-mono text-xs">:=</code>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3 rounded-xl bg-surface-2 p-4">
                      <Lightbulb
                        size={17}
                        className="mt-0.5 shrink-0 text-ink-3"
                        aria-hidden="true"
                      />
                      <p className="text-sm leading-6 text-ink-2">
                        Inside a function,{" "}
                        <code className="font-mono text-xs text-ink">
                          age := 10
                        </code>{" "}
                        creates a new variable named age.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openChallenge}
                      className="mt-6 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-contrast transition-[background-color,transform] duration-150 ease-smooth hover:bg-accent-hover motion-safe:active:scale-[0.97] motion-reduce:transition-none sm:w-auto"
                    >
                      Start challenge
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-4">
                      Your challenge
                    </p>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                      Create your first variable.
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-ink-2">
                      Complete the program by creating a variable named{" "}
                      <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs">
                        age
                      </code>{" "}
                      and assigning it the integer{" "}
                      <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs">
                        10
                      </code>
                      .
                    </p>

                    <div className="mt-6">
                      <p className="text-sm font-semibold text-ink">
                        Expected output
                      </p>

                      <pre className="mt-3 rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink-2">
                        {`Go
10`}
                      </pre>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink">Hints</p>

                        <span className="text-xs text-ink-4">
                          {Math.max(hintIndex + 1, 0)} /{" "}
                          {INITIAL_HINTS.length}
                        </span>
                      </div>

                      {hintIndex >= 0 && (
                        <div className="mt-3 rounded-xl border border-line p-4">
                          <p className="text-sm leading-6 text-ink-2">
                            {INITIAL_HINTS[hintIndex]}
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={revealHint}
                        disabled={hintIndex === INITIAL_HINTS.length - 1}
                        className="mt-3 cursor-pointer text-sm font-medium text-ink-2 underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-smooth hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {hintIndex === -1
                          ? "Reveal a hint"
                          : hintIndex === INITIAL_HINTS.length - 1
                            ? "All hints revealed"
                            : "Show next hint"}
                      </button>
                    </div>

                    {status === "passed" && (
                      <div className="mt-6 rounded-xl border border-success/30 bg-success-soft p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-success">
                          <Check size={16} aria-hidden="true" />
                          Challenge completed!
                        </div>

                        <p className="mt-2 text-sm leading-6 text-success">
                          You created your first variable. That&apos;s one
                          concept down!
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-success">
                          <Zap size={13} aria-hidden="true" />
                          +20 XP earned
                        </div>

                        <button
                          type="button"
                          onClick={nextLesson}
                          className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-success hover:underline motion-safe:active:scale-[0.97]"
                        >
                          Practise again
                          <ChevronRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="min-w-0 p-5 sm:p-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {tab === "lesson" ? "Example code" : "Your code"}
                    </p>

                    <p className="mt-1 text-xs text-ink-3">
                      {tab === "lesson"
                        ? "A complete Go program"
                        : "Edit the starter code"}
                    </p>
                  </div>

                  <span className="rounded-md border border-line px-2 py-1 text-[11px] text-ink-3">
                    main.go
                  </span>
                </div>

                {tab === "lesson" ? (
                  <>
                    <div className="overflow-hidden rounded-xl border border-line">
                      <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-ink-2">
                        <code>{LESSON_CODE}</code>
                      </pre>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-line">
                      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                        <Terminal size={14} className="text-ink-3" aria-hidden="true" />
                        <span className="text-xs font-medium text-ink-2">
                          Output
                        </span>
                      </div>

                      <pre className="p-4 font-mono text-sm leading-6 text-ink-2">
                        {`Go
10`}
                      </pre>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-ink-4">
                      <Check size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <p>
                        Read the example, then try writing the missing
                        line yourself.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-xl border border-line">
                      <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Terminal size={14} className="text-ink-3" aria-hidden="true" />
                          <span className="text-xs font-medium text-ink-2">
                            main.go
                          </span>
                        </div>

                        <span className="text-[11px] text-ink-4">
                          Editable
                        </span>
                      </div>

                      <textarea
                        value={code}
                        onChange={(event) => {
                          setCode(event.target.value);
                          setStatus("idle");
                          setShowOutput(false);
                        }}
                        spellCheck={false}
                        aria-label="Your Go solution"
                        className="min-h-[310px] w-full resize-y bg-surface p-4 font-mono text-xs leading-6 text-ink-2 outline-none focus:ring-2 focus:ring-inset focus:ring-accent-border"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={runChecks}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-[background-color,transform] duration-150 ease-smooth hover:bg-accent-hover motion-safe:active:scale-[0.97] motion-reduce:transition-none"
                      >
                        <Play size={14} aria-hidden="true" />
                        Run checks
                      </button>

                      <button
                        type="button"
                        onClick={resetChallenge}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-2 transition-[background-color,border-color,transform] duration-150 ease-smooth hover:bg-surface-2 hover:border-line-strong motion-safe:active:scale-[0.97] motion-reduce:transition-none"
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        Reset
                      </button>
                    </div>

                    {showOutput && (
                      <div
                        aria-live="polite"
                        className={`mt-4 rounded-xl border p-4 ${
                          status === "passed"
                            ? "border-success/30 bg-success-soft"
                            : "border-danger/30 bg-danger-soft"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            status === "passed" ? "text-success" : "text-danger"
                          }`}
                        >
                          {status === "passed" ? (
                            <Check size={16} aria-hidden="true" />
                          ) : (
                            <Circle size={15} aria-hidden="true" />
                          )}

                          {status === "passed"
                            ? "All checks passed"
                            : "Not quite yet"}
                        </div>

                        <p
                          className={`mt-2 text-sm leading-6 ${
                            status === "passed" ? "text-success" : "text-danger"
                          }`}
                        >
                          {status === "passed"
                            ? "Your solution contains the required variable and print statements."
                            : "Check your variable declaration and make sure both values are printed. Use a hint if you get stuck."}
                        </p>
                      </div>
                    )}

                    <p className="mt-3 text-[11px] leading-5 text-ink-4">
                      Prototype mode: checks run in your browser and
                      do not compile or execute Go code.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-line bg-canvas p-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Your learning path
                  </p>

                  <p className="mt-1 text-xs text-ink-3">
                    Pass a challenge to unlock the next lesson.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {LESSONS.map((lesson, index) => {
                    const active = index === 0;
                    const unlocked = index === 1 && completed;

                    return (
                      <div
                        key={lesson.title}
                        title={lesson.title}
                        className={`flex size-9 items-center justify-center rounded-lg border text-xs font-semibold ${
                          completed && index === 0
                            ? "border-success/30 bg-success-soft text-success"
                            : active || unlocked
                              ? "border-line-strong bg-surface text-ink"
                              : "border-line bg-surface text-ink-4"
                        }`}
                      >
                        {completed && index === 0 ? (
                          <Check size={15} aria-hidden="true" />
                        ) : (
                          index + 1
                        )}
                      </div>
                    );
                  })}

                  <span className="ml-1 text-xs text-ink-3">
                    {completed ? "1 completed" : "0 completed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
