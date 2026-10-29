
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  GraduationCap,
  LockKeyhole,
  Rocket,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import { Reveal } from "./Reveal";

const stages = [
  {
    number: "01",
    title: "Learn the basics",
    subtitle: "Get comfortable with Go.",
    description:
      "Start with variables, types, conditions, loops, and functions. Learn one idea at a time, then use it immediately.",
    skills: ["Variables", "Types", "Loops", "Functions"],
    challenge: "Your first program",
    prompt: "Create a variable named age and assign it the value 19.",
    difficulty: "Just starting",
    xp: 50,
    icon: GraduationCap,
    code: `package main

import "fmt"

func main() {
    age := 19
    fmt.Println(age)
}`,
  },
  {
    number: "02",
    title: "Think in code",
    subtitle: "Turn ideas into solutions.",
    description:
      "Practice slices, maps, strings, and problem-solving. Break a problem down before reaching for the keyboard.",
    skills: ["Slices", "Maps", "Strings", "Algorithms"],
    challenge: "Find the maximum",
    prompt: "Write a function that returns the largest number in a slice.",
    difficulty: "Building confidence",
    xp: 100,
    icon: Braces,
    code: `func maximum(nums []int) int {
    largest := nums[0]

    for _, n := range nums {
        if n > largest {
            largest = n
        }
    }

    return largest
}`,
  },
  {
    number: "03",
    title: "Build for the web",
    subtitle: "Make programs useful.",
    description:
      "Learn how HTTP works, handle requests, return JSON, and build APIs that other applications can actually use.",
    skills: ["HTTP", "JSON", "Handlers", "Middleware"],
    challenge: "Build your first API",
    prompt: "Create an endpoint that responds with a JSON message.",
    difficulty: "Getting practical",
    xp: 150,
    icon: Server,
    code: `http.HandleFunc("/hello", func(
    w http.ResponseWriter,
    r *http.Request,
) {
    w.Header().Set(
        "Content-Type",
        "application/json",
    )

    fmt.Fprintln(w, \`{"message":"hello"}\`)
})`,
  },
  {
    number: "04",
    title: "Debug with confidence",
    subtitle: "Understand what went wrong.",
    description:
      "Read errors, write tests, and trace bugs to their source. Stop guessing and start building a repeatable debugging process.",
    skills: ["Errors", "Testing", "Logging", "Debugging"],
    challenge: "Fix the broken function",
    prompt: "Find why a function skips valid inputs and repair the bug.",
    difficulty: "Thinking deeper",
    xp: 180,
    icon: Wrench,
    code: `func countPositive(nums []int) int {
    count := 0

    for _, n := range nums {
        if n > 0 {
            count++
        }
    }

    return count
}`,
  },
  {
    number: "05",
    title: "Understand systems",
    subtitle: "Learn what happens under the hood.",
    description:
      "Explore goroutines, channels, cancellation, and worker pools. Learn to coordinate concurrent work without creating chaos.",
    skills: ["Goroutines", "Channels", "Context", "Concurrency"],
    challenge: "Build a worker pool",
    prompt: "Process several jobs concurrently and collect their results.",
    difficulty: "Advanced",
    xp: 250,
    icon: Terminal,
    code: `jobs := make(chan int, 5)
results := make(chan int, 5)

for i := 0; i < 3; i++ {
    go func() {
        for job := range jobs {
            results <- job * 2
        }
    }()
}`,
  },
  {
    number: "06",
    title: "Ship real projects",
    subtitle: "Put everything together.",
    description:
      "Go beyond isolated exercises. Make design decisions, handle failure, persist data, test your work, and ship something real.",
    skills: ["Architecture", "Databases", "Testing", "Deployment"],
    challenge: "Build a URL shortener",
    prompt: "Design a service that creates and resolves short URLs.",
    difficulty: "Project mode",
    xp: 400,
    icon: Rocket,
    code: `type URLStore interface {
    Save(
        ctx context.Context,
        code string,
        target string,
    ) error

    Find(
        ctx context.Context,
        code string,
    ) (string, error)
}`,
  },
];

export function LearningPath() {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const reduceMotion = useReducedMotion();

  const stage = stages[active];
  if (!stage) return null;
  const Icon = stage.icon;

  function selectStage(index: number) {
    setActive(index);
    setVisited((previous) =>
      previous.includes(index) ? previous : [...previous, index],
    );
  }

  function move(direction: number) {
    const next = Math.max(0, Math.min(stages.length - 1, active + direction));
    selectStage(next);
  }

  return (
    <section
      id="learn"
      className="overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-700">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50">
                  <Code2 size={15} />
                </span>
                Your path to becoming a developer
              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                Don't just learn Go.
                <span className="block text-slate-400">
                  Get good at building.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Learn something. Put it to work. See what you can build.
                Every step takes you from understanding code to engineering
                real systems.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 font-mono text-sm font-bold text-blue-700">
                Go
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Go learning path
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  6 stages · Learn by doing
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-14 grid overflow-hidden rounded-3xl border border-slate-200 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Learning journey */}
            <aside className="border-b border-slate-200 bg-slate-50/70 p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  The journey
                </p>
                <span className="text-xs tabular-nums text-slate-500">
                  {String(active + 1).padStart(2, "0")} / 06
                </span>
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-blue-600"
                  animate={{ width: `${((active + 1) / stages.length) * 100}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                />
              </div>

              <div className="relative mt-7 space-y-2">
                <div className="absolute bottom-6 left-[17px] top-6 w-px bg-slate-200" />

                {stages.map((item, index) => {
                  const ItemIcon = item.icon;
                  const selected = active === index;
                  const explored = visited.includes(index);

                  return (
                    <button
                      key={item.number}
                      type="button"
                      onClick={() => selectStage(index)}
                      aria-current={selected ? "step" : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                        selected
                          ? "bg-white shadow-sm ring-1 ring-slate-200"
                          : "hover:bg-white/80"
                      }`}
                    >
                      <span
                        className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : explored
                              ? "border-blue-100 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {explored && index !== active ? (
                          <Check size={16} />
                        ) : (
                          <ItemIcon size={16} />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[11px] ${
                            selected ? "text-blue-700" : "text-slate-400"
                          }`}
                        >
                          STAGE {item.number}
                        </span>
                        <span
                          className={`mt-0.5 block text-sm font-medium ${
                            selected ? "text-slate-950" : "text-slate-600"
                          }`}
                        >
                          {item.title}
                        </span>
                      </span>

                      {selected && (
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-blue-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-xs leading-5 text-slate-500">
                No need to rush. Move forward when you're ready.
              </p>
            </aside>

            {/* Active lesson */}
            <div className="min-w-0 p-5 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stage.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Stage {stage.number}
                    </span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {stage.difficulty}
                    </span>
                  </div>

                  <div className="mt-7 flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                      <Icon size={23} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        {stage.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                    {stage.description}
                  </p>

                  <div className="mt-7">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Along the way
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stage.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Challenge preview */}
                  <div className="mt-9 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-slate-500" />
                        <span className="text-sm font-medium text-slate-800">
                          Your next challenge
                        </span>
                      </div>
                      <span className="text-xs font-medium text-blue-700">
                        +{stage.xp} XP
                      </span>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h4 className="text-base font-semibold text-slate-950 sm:text-lg">
                        {stage.challenge}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {stage.prompt}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-400">
                          Learn · Write · Test · Improve
                        </p>
                        <a
                          href="#preview"
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Try a challenge
                          <ArrowUpRight size={15} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => move(-1)}
                      disabled={active === 0}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <span className="text-xs tabular-nums text-slate-400">
                      {active + 1} of {stages.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => move(1)}
                      disabled={active === stages.length - 1}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Next stage
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-slate-950 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <Rocket size={21} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  The goal isn't to finish a course.
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  It's to become the developer who can figure things out,
                  solve problems, and build things that work.
                </p>
              </div>
            </div>

            <a
              href="#preview"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Start learning
              <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
