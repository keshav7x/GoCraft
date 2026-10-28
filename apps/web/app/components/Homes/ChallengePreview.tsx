"use client";

import { useState } from "react";
import {
  BookOpen,
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

  function openLesson() {
    setTab("lesson");
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
      className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Learn by doing
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                Learn it.
                <br />
                Try it yourself.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Start with the basics, solve small challenges, and
                build confidence one concept at a time.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                <Trophy size={17} className="text-slate-700" />
              </div>

              <div>
                <p className="text-xs text-slate-500">XP earned</p>
                <p className="text-lg font-semibold tabular-nums text-slate-950">
                  {xp}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Challenge header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
                  <Code2 size={19} className="text-slate-700" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Your first Go lesson
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Variables and data types
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600">
                  Beginner
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                  <Zap size={13} />
                  20 XP
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6">
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
                    className={`relative py-4 text-sm transition-colors ${
                      tab === item.id
                        ? "font-semibold text-slate-950"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item.label}

                    {item.id === "challenge" && completed && (
                      <Check
                        size={13}
                        className="ml-1.5 inline text-emerald-600"
                      />
                    )}

                    {tab === item.id && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-950" />
                    )}
                  </button>
                ))}
              </div>

              <span className="hidden text-xs text-slate-400 sm:block">
                Lesson 1 of 12
              </span>
            </div>

            <div className="grid min-w-0 lg:grid-cols-2">
              {/* Learning panel */}
              <div className="min-w-0 border-b border-slate-200 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                {tab === "lesson" ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      The concept
                    </p>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      Meet variables.
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      A variable stores a value under a name. Instead of
                      repeating a value everywhere, you can give it a name
                      and use it whenever you need it.
                    </p>

                    <div className="mt-6 rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold text-slate-800">
                        Two things to notice
                      </p>

                      <div className="mt-4 space-y-4">
                        <div className="flex gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-xs text-slate-700">
                            1
                          </span>

                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              The variable name
                            </p>
                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              <code className="font-mono text-xs">
                                age
                              </code>{" "}
                              is the name we use to refer to the value.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-xs text-slate-700">
                            2
                          </span>

                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              The value
                            </p>
                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              <code className="font-mono text-xs">10</code>{" "}
                              is an integer. Go infers the type when you
                              use{" "}
                              <code className="font-mono text-xs">:=</code>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4">
                      <Lightbulb
                        size={17}
                        className="mt-0.5 shrink-0 text-slate-600"
                      />
                      <p className="text-sm leading-6 text-slate-600">
                        Inside a function,{" "}
                        <code className="font-mono text-xs text-slate-900">
                          age := 10
                        </code>{" "}
                        creates a new variable named age.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openChallenge}
                      className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
                    >
                      Start challenge
                      <ChevronRight size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Your challenge
                    </p>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      Create your first variable.
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Complete the program by creating a variable named{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
                        age
                      </code>{" "}
                      and assigning it the integer{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
                        10
                      </code>
                      .
                    </p>

                    <div className="mt-6">
                      <p className="text-sm font-semibold text-slate-900">
                        Expected output
                      </p>

                      <pre className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700">
                        {`Go
10`}
                      </pre>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          Hints
                        </p>

                        <span className="text-xs text-slate-400">
                          {Math.max(hintIndex + 1, 0)} /{" "}
                          {INITIAL_HINTS.length}
                        </span>
                      </div>

                      {hintIndex >= 0 && (
                        <div className="mt-3 rounded-xl border border-slate-200 p-4">
                          <p className="text-sm leading-6 text-slate-600">
                            {INITIAL_HINTS[hintIndex]}
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={revealHint}
                        disabled={hintIndex === INITIAL_HINTS.length - 1}
                        className="mt-3 text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {hintIndex === -1
                          ? "Reveal a hint"
                          : hintIndex === INITIAL_HINTS.length - 1
                            ? "All hints revealed"
                            : "Show next hint"}
                      </button>
                    </div>

                    {status === "passed" && (
                      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          <Check size={16} />
                          Challenge completed!
                        </div>

                        <p className="mt-2 text-sm leading-6 text-emerald-800">
                          You created your first variable. That's one
                          concept down!
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                          <Zap size={13} />
                          +20 XP earned
                        </div>

                        <button
                          type="button"
                          onClick={nextLesson}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:underline"
                        >
                          Practise again
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Code editor */}
              <div className="min-w-0 p-5 sm:p-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {tab === "lesson" ? "Example code" : "Your code"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {tab === "lesson"
                        ? "A complete Go program"
                        : "Edit the starter code"}
                    </p>
                  </div>

                  <span className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-500">
                    main.go
                  </span>
                </div>

                {tab === "lesson" ? (
                  <>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-slate-700">
                        <code>{LESSON_CODE}</code>
                      </pre>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                        <Terminal size={14} className="text-slate-500" />
                        <span className="text-xs font-medium text-slate-700">
                          Output
                        </span>
                      </div>

                      <pre className="p-4 font-mono text-sm leading-6 text-slate-700">
                        {`Go
10`}
                      </pre>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
                      <Check size={14} className="mt-0.5 shrink-0" />
                      <p>
                        Read the example, then try writing the missing
                        line yourself.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Terminal size={14} className="text-slate-500" />
                          <span className="text-xs font-medium text-slate-700">
                            main.go
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
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
                        className="min-h-[310px] w-full resize-y bg-white p-4 font-mono text-xs leading-6 text-slate-800 outline-none focus:ring-2 focus:ring-inset focus:ring-slate-300"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={runChecks}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        <Play size={14} />
                        Run checks
                      </button>

                      <button
                        type="button"
                        onClick={resetChallenge}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <RotateCcw size={14} />
                        Reset
                      </button>
                    </div>

                    {showOutput && (
                      <div
                        aria-live="polite"
                        className={`mt-4 rounded-xl border p-4 ${
                          status === "passed"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            status === "passed"
                              ? "text-emerald-800"
                              : "text-rose-800"
                          }`}
                        >
                          {status === "passed" ? (
                            <Check size={16} />
                          ) : (
                            <Circle size={15} />
                          )}

                          {status === "passed"
                            ? "All checks passed"
                            : "Not quite yet"}
                        </div>

                        <p
                          className={`mt-2 text-sm leading-6 ${
                            status === "passed"
                              ? "text-emerald-800"
                              : "text-rose-800"
                          }`}
                        >
                          {status === "passed"
                            ? "Your solution contains the required variable and print statements."
                            : "Check your variable declaration and make sure both values are printed. Use a hint if you get stuck."}
                        </p>
                      </div>
                    )}

                    <p className="mt-3 text-[11px] leading-5 text-slate-400">
                      Prototype mode: checks run in your browser and
                      do not compile or execute Go code.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Lesson progression */}
            <div className="border-t border-slate-200 bg-slate-50/60 p-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Your learning path
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Complete a challenge to build your progress.
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
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : active || unlocked
                              ? "border-slate-300 bg-white text-slate-900"
                              : "border-slate-200 bg-white text-slate-300"
                        }`}
                      >
                        {completed && index === 0 ? (
                          <Check size={15} />
                        ) : (
                          index + 1
                        )}
                      </div>
                    );
                  })}

                  <span className="ml-1 text-xs text-slate-500">
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
