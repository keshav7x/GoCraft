"use client";

import {
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FlaskConical,
  Play,
  Timer,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PROBLEMS, type Problem } from "../../../lib/demo-data";
import { useDemoStore } from "../../../lib/demo-store";
import { Badge, DifficultyBadge } from "../../ui/badge";
import { CodeBlock } from "../../ui/code-block";
import { Dialog } from "../../ui/dialog";

function starterCode(problem: Problem): string {
  return `package main

// ${problem.title}
// Difficulty: ${problem.difficulty} · Topic: ${problem.topic}
//
// TODO: implement the solution described below.
func solve(input string) string {
\t// your code here
\treturn ""
}`;
}

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  const solved = useDemoStore((state) => state.solvedProblemIds.has(problem.id) || problem.solved);
  const solveProblem = useDemoStore((state) => state.solveProblem);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const relatedLookup = useMemo(
    () => new Map(PROBLEMS.map((item) => [item.id, item])),
    [],
  );

  function demoSolve() {
    solveProblem(problem.id, problem.xp);
    setConfirmOpen(false);
    toast.success(`Demo submission accepted · +${problem.xp} XP`, {
      description: "Session-only demo result — no code was executed.",
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* Description column */}
      <div className="min-w-0 space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <Badge variant="outline">{problem.topic}</Badge>
            {problem.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            <span className="ml-auto text-[11.5px] tabular-nums text-slate-500">
              {problem.acceptance}% acceptance
            </span>
          </div>

          <p className="mt-4 text-[14.5px] leading-7 text-slate-600">{problem.description}</p>

          {problem.examples.map((example, index) => (
            <div key={index} className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Example {index + 1}
              </p>
              <div className="mt-2.5 space-y-2 font-mono text-[12.5px] leading-6">
                <p>
                  <span className="text-slate-400">Input: </span>
                  <span className="text-slate-800">{example.input}</span>
                </p>
                <p>
                  <span className="text-slate-400">Output: </span>
                  <span className="font-medium text-emerald-700">{example.output}</span>
                </p>
              </div>
              {example.explanation && (
                <p className="mt-2.5 text-[12.5px] leading-5 text-slate-500">
                  {example.explanation}
                </p>
              )}
            </div>
          ))}

          <div className="mt-6">
            <h2 className="text-[13px] font-semibold text-slate-900">Constraints</h2>
            <ul className="mt-2.5 space-y-2">
              {problem.constraints.map((constraint, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 font-mono text-[12.5px] leading-5 text-slate-600"
                >
                  <span className="text-slate-300">›</span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sandbox boundary */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <FlaskConical size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold tracking-tight text-slate-950">
                Workspace
              </h2>
            </div>
            <Badge variant="outline">Sandbox not connected</Badge>
          </div>

          <div className="p-5">
            <CodeBlock code={starterCode(problem)} filename="solution.go" />

            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] leading-5 text-slate-500">
                Run and submit require a code-execution sandbox. This build ships the
                interface only — no code leaves your browser, and no test results are
                fabricated.
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled
                  title="Requires sandbox integration"
                  className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-400 shadow-sm"
                >
                  <Play size={14} /> Run tests
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={solved}
                  className={
                    solved
                      ? "inline-flex h-9 cursor-default items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-[13px] font-medium text-emerald-700"
                      : "inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-slate-800 active:translate-y-px"
                  }
                >
                  {solved ? (
                    <>
                      <CheckCircle2 size={14} /> Solved (demo)
                    </>
                  ) : (
                    <>
                      <Trophy size={14} /> Mark solved · demo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Your status
            </span>
            {solved ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                <CheckCircle2 size={14} /> Solved
              </span>
            ) : problem.attemptStatus === "attempted" ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700">
                <Timer size={14} /> Attempted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-400">
                <CircleDashed size={14} /> Not started
              </span>
            )}
          </div>

          <dl className="mt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-slate-500">Reward</dt>
              <dd className="tabular-nums font-semibold text-accent-700">+{problem.xp} XP</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Difficulty</dt>
              <dd>
                <DifficultyBadge difficulty={problem.difficulty} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Topic</dt>
              <dd className="font-medium text-slate-700">{problem.topic}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Acceptance</dt>
              <dd className="tabular-nums font-medium text-slate-700">{problem.acceptance}%</dd>
            </div>
          </dl>
        </div>

        {/* Related */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Related problems
          </p>
          <ul className="mt-3 space-y-1">
            {problem.related.map((id) => {
              const related = relatedLookup.get(id);
              if (!related) return null;
              return (
                <li key={id}>
                  <Link
                    href={`/dashboard/problems/${id}`}
                    className="group flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-slate-800">
                        {related.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">{related.topic}</span>
                    </span>
                    <DifficultyBadge difficulty={related.difficulty} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/dashboard/problems"
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-900 hover:text-accent-700"
          >
            All problems <ExternalLink size={13} />
          </Link>
        </div>
      </aside>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Mark as solved?"
        description="This is a demo submission. It updates session state only — no code runs and nothing syncs to an account."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={demoSolve}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-[13px] font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <CheckCircle2 size={14} /> Confirm · +{problem.xp} XP
            </button>
          </>
        }
      >
        <div className="flex gap-3.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-accent-600 ring-1 ring-inset ring-slate-200">
            <Trophy size={16} />
          </span>
          <div>
            <p className="text-[13px] font-medium text-slate-900">{problem.title}</p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {problem.difficulty} · {problem.topic}
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
