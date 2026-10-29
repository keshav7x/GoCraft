"use client";

import { CheckCircle2, Play, RotateCcw, Terminal, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Problem } from "../../lib/demo/types";
import { useDemoStore } from "../../lib/progress-store";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const EDITOR_TABS = ["main.go", "main_test.go"] as const;

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  const solved = useDemoStore((s) => s.completedProblemIds.includes(problem.id));
  const solveProblem = useDemoStore((s) => s.solveProblem);

  const [tab, setTab] = useState<(typeof EDITOR_TABS)[number]>("main.go");
  const [code, setCode] = useState(problem.starterCode);
  const [testCode] = useState(
    `package solution

import "testing"

func TestExample(t *testing.T) {
\t// Cases derived from the problem examples.
\t// The sandbox that runs these tests is not connected yet.
}`,
  );

  const lineCount = code.split("\n").length;

  function handleRun() {
    toast("Sandbox not connected", {
      description:
        "Running tests requires a Go execution sandbox. This interface is ready for one — nothing was executed.",
    });
  }

  function handleSubmit() {
    toast("Submission not sent", {
      description:
        "There is no backend judge in this demo. Marking a problem solved is stored locally below.",
    });
  }

  function handleMarkSolved() {
    if (solved) {
      toast("Already marked solved", {
        description: "This was recorded in your local demo progress.",
      });
      return;
    }
    solveProblem(problem.id, problem.xp);
    toast("Marked as solved", {
      description: `+${problem.xp} XP added to local demo progress. No backend was involved.`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {EDITOR_TABS.map((editorTab) => (
            <button
              key={editorTab}
              type="button"
              onClick={() => setTab(editorTab)}
              className={cn(
                "focus-ring rounded-md px-2.5 py-1.5 font-mono text-[12px] transition-colors",
                tab === editorTab
                  ? "bg-panel-muted text-ink"
                  : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {editorTab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setCode(problem.starterCode)}
            aria-label="Reset editor"
          >
            <RotateCcw size={13} />
            Reset
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={handleRun}>
            <Play size={13} />
            Run tests
          </Button>
          <Button type="button" size="sm" variant="primary" onClick={handleSubmit}>
            <Upload size={13} />
            Submit
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-edge bg-[#0c0e12]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-[11px] text-slate-400">{tab}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Go · {lineCount} lines
          </span>
        </div>

        <div className="flex">
          <div
            aria-hidden
            className="select-none border-r border-white/10 px-3 py-3 text-right font-mono text-[12.5px] leading-[1.7] text-slate-600"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={tab === "main.go" ? code : testCode}
            onChange={(e) => {
              if (tab === "main.go") setCode(e.target.value);
            }}
            readOnly={tab !== "main.go"}
            spellCheck={false}
            aria-label="Code editor"
            className="scrollbar-subtle min-h-[280px] w-full resize-y bg-transparent px-4 py-3 font-mono text-[12.5px] leading-[1.7] text-slate-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5">
          <Terminal size={13} className="text-slate-500" />
          <p className="font-mono text-[11px] leading-4 text-slate-500">
            Execution boundary: wire `Run tests` to a sandboxed Go runner
            (e.g. containerized `go test`) — nothing runs in the browser.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-edge bg-panel px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12.5px] leading-5 text-ink-muted">
          {solved ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-easy">
              <CheckCircle2 size={14} />
              Marked solved in local demo progress.
            </span>
          ) : (
            "Finished on paper or in your editor? Mark it solved to track demo progress."
          )}
        </p>
        <Button
          type="button"
          variant={solved ? "secondary" : "accent"}
          size="sm"
          onClick={handleMarkSolved}
          disabled={solved}
        >
          {solved ? "Solved" : `Mark solved · +${problem.xp} XP`}
        </Button>
      </div>
    </div>
  );
}
