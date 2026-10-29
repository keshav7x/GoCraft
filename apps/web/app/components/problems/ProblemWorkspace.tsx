"use client";

import {
  CheckCircle2,
  Play,
  RotateCcw,
  Terminal,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { highlightGo } from "../../lib/go-highlight";
import type { Problem } from "../../lib/demo/types";
import { useDemoStore } from "../../lib/progress-store";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const EDITOR_TABS = ["main.go", "main_test.go"] as const;
type EditorTab = (typeof EDITOR_TABS)[number];

const LINE_H = 22;
const PAD_TOP = 8;

const PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};
const CLOSER_TO_OPENER: Record<string, string> = {
  ")": "(",
  "]": "[",
  "}": "{",
  '"': '"',
  "'": "'",
  "`": "`",
};

const DEFAULT_TEST_CODE = `package solution

import "testing"

func TestExample(t *testing.T) {
	// Cases derived from the problem examples.
	// The sandbox that runs these tests is not connected yet.
}`;

type LogTone = "cmd" | "info" | "warn" | "ok";
type LogLine = { id: number; text: string; tone: LogTone };

const LOG_TONES: Record<LogTone, string> = {
  cmd: "text-ink",
  info: "text-ink-muted",
  warn: "text-blue-600",
  ok: "text-blue-700 font-medium",
};

export function ProblemWorkspace({ problem }: { problem: Problem }) {
  const solved = useDemoStore((s) => s.completedProblemIds.includes(problem.id));
  const solveProblem = useDemoStore((s) => s.solveProblem);

  const [tab, setTab] = useState<EditorTab>("main.go");
  const [code, setCode] = useState(problem.starterCode);
  const [testCode, setTestCode] = useState(DEFAULT_TEST_CODE);
  const [caseInputs, setCaseInputs] = useState(() =>
    problem.testCases.map((tc) => tc.input),
  );
  const [caretLine, setCaretLine] = useState(0);
  const [bottomTab, setBottomTab] = useState<"testcase" | "console">("testcase");
  const [logs, setLogs] = useState<LogLine[]>([]);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterInnerRef = useRef<HTMLDivElement>(null);
  const preInnerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  const activeValue = tab === "main.go" ? code : testCode;
  const setActiveValue = (value: string) =>
    tab === "main.go" ? setCode(value) : setTestCode(value);

  const lineCount = activeValue.split("\n").length;
  const tokens = useMemo(
    () => highlightGo(activeValue.endsWith("\n") ? `${activeValue} ` : activeValue),
    [activeValue],
  );

  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, bottomTab]);

  function syncScroll() {
    const ta = taRef.current;
    if (!ta) return;
    const x = ta.scrollLeft;
    const y = ta.scrollTop;
    if (gutterInnerRef.current) {
      gutterInnerRef.current.style.transform = `translateY(${-y}px)`;
    }
    if (preInnerRef.current) {
      preInnerRef.current.style.transform = `translate(${-x}px, ${-y}px)`;
    }
    if (barRef.current) {
      barRef.current.style.transform = `translateY(${-y}px)`;
    }
  }

  function updateCaretLine() {
    const ta = taRef.current;
    if (!ta) return;
    const before = ta.value.slice(0, ta.selectionStart);
    setCaretLine(before.split("\n").length - 1);
  }

  function applyEdit(value: string, caret: number, caretEnd?: number) {
    setActiveValue(value);
    requestAnimationFrame(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.selectionStart = caret;
      ta.selectionEnd = caretEnd ?? caret;
      const line = ta.value.slice(0, caret).split("\n").length - 1;
      setCaretLine(line);
      syncScroll();
    });
  }

  function pushLog(text: string, tone: LogTone) {
    logIdRef.current += 1;
    setLogs((prev) => [...prev, { id: logIdRef.current, text, tone }]);
  }

  function handleRun() {
    setBottomTab("console");
    pushLog("$ go test -count=1 -run TestExample .", "cmd");
    for (let i = 0; i < problem.testCases.length; i += 1) {
      const tc = problem.testCases[i];
      pushLog(
        `  case "${tc.name}": ${tc.input}  →  expected ${tc.expected}`,
        "info",
      );
    }
    pushLog(
      "Sandbox not connected — a server-side `go test` runner is required. Nothing was executed.",
      "warn",
    );
    toast("Sandbox not connected", {
      description:
        "Running tests requires a Go execution sandbox. This interface is ready for one — nothing was executed.",
    });
  }

  function handleSubmit() {
    setBottomTab("console");
    pushLog("$ POST /api/v1/submissions  (language=go)", "cmd");
    pushLog(
      "No judge backend in this demo — the submission was not sent anywhere.",
      "warn",
    );
    toast("Submission not sent", {
      description:
        "There is no backend judge in this demo. Marking a problem solved is stored locally below.",
    });
  }

  function handleReset() {
    setCode(problem.starterCode);
    setTestCode(DEFAULT_TEST_CODE);
    setCaretLine(0);
    toast("Editor reset", {
      description: "Restored the starter code for both files.",
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

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ta = e.currentTarget;
    const value = activeValue;
    const s = ta.selectionStart;
    const selEnd = ta.selectionEnd;

    // Run: Ctrl/Cmd + Enter · Submit: Ctrl/Cmd + S
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Tab / Shift+Tab
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", Math.max(0, s - 1)) + 1;
        const line = value.slice(lineStart);
        let remove = 0;
        if (line.startsWith("\t")) remove = 1;
        else if (line.startsWith("    ")) remove = 4;
        if (remove > 0) {
          applyEdit(
            value.slice(0, lineStart) + value.slice(lineStart + remove),
            Math.max(lineStart, s - remove),
            Math.max(lineStart, selEnd - remove),
          );
        }
      } else {
        applyEdit(value.slice(0, s) + "\t" + value.slice(selEnd), s + 1);
      }
      return;
    }

    // Enter with auto-indent
    if (e.key === "Enter") {
      e.preventDefault();
      const before = value.slice(0, s);
      const lineStart = before.lastIndexOf("\n") + 1;
      const indent = /^[ \t]*/.exec(before.slice(lineStart))?.[0] ?? "";
      const prev = before.slice(-1);
      const after = value.slice(s);

      if (prev === "{" && after.startsWith("}")) {
        applyEdit(
          `${before}\n${indent}\t\n${indent}${after}`,
          s + 1 + indent.length + 1,
        );
      } else {
        const extra = prev === "{" || prev === "(" || prev === "[" ? "\t" : "";
        applyEdit(
          `${before}\n${indent}${extra}${after}`,
          s + 1 + indent.length + extra.length,
        );
      }
      return;
    }

    // Skip over an existing closing character (must run before auto-close for quotes)
    if (
      e.key in CLOSER_TO_OPENER &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      s === selEnd &&
      value[s] === e.key
    ) {
      e.preventDefault();
      applyEdit(value, s + 1);
      return;
    }

    // Auto-close pairs (wrap selection when something is selected)
    if (e.key in PAIRS && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const close = PAIRS[e.key];
      if (s === selEnd) {
        applyEdit(value.slice(0, s) + e.key + close + value.slice(s), s + 1);
      } else {
        const selected = value.slice(s, selEnd);
        applyEdit(
          value.slice(0, s) + e.key + selected + close + value.slice(selEnd),
          s + 1,
          s + 1 + selected.length,
        );
      }
      return;
    }

    // Backspace deletes a whole empty pair
    if (e.key === "Backspace" && s === selEnd && s > 0) {
      const prev = value[s - 1];
      const next = value[s];
      if (prev in PAIRS && PAIRS[prev] === next) {
        e.preventDefault();
        applyEdit(value.slice(0, s - 1) + value.slice(s + 1), s - 1);
      }
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden p-2 sm:p-3">
      {/* File tabs + actions */}
      <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-edge bg-panel px-2 py-1">
        <div className="flex min-w-0 items-center overflow-x-auto">
          {EDITOR_TABS.map((editorTab) => (
            <button
              key={editorTab}
              type="button"
              onClick={() => setTab(editorTab)}
              className={cn(
                "relative shrink-0 rounded-md px-3 py-2 font-mono text-[12px] transition-colors",
                tab === editorTab
                  ? "text-blue-600"
                  : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {editorTab}
              {tab === editorTab ? (
                <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-blue-600" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-7 gap-1.5 px-2 text-[12px] text-ink-muted hover:bg-panel-muted hover:text-ink"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRun}
            className="h-7 gap-1.5 border border-blue-200 bg-blue-50 px-3 text-[12px] font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100"
          >
            <Play size={12} />
            Run
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            className="h-7 gap-1.5 border border-transparent bg-blue-600 px-3.5 text-[12px] font-semibold text-white hover:bg-blue-700"
          >
            <Upload size={12} />
            Submit
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-edge bg-panel md:min-h-0">
        {/* Active-line highlight */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            ref={barRef}
            className="absolute left-0 w-full bg-blue-50"
            style={{ top: PAD_TOP + caretLine * LINE_H, height: LINE_H }}
          />
        </div>

        {/* Syntax highlight layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            ref={preInnerRef}
            className="absolute left-0 top-0 whitespace-pre pb-2 pl-12 pr-4 pt-2 font-mono text-[12.5px] leading-[22px] text-ink"
            style={{ tabSize: 4 }}
          >
            {tokens.map((token, i) => (
              <span key={i} className={token.cls}>
                {token.text}
              </span>
            ))}
          </div>
        </div>

        {/* Line-number gutter */}
        <div
          className="absolute left-0 top-0 z-10 h-full w-11 select-none overflow-hidden border-r border-edge bg-panel-muted"
          aria-hidden
        >
          <div ref={gutterInnerRef} className="pt-2 will-change-transform">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "pr-2.5 text-right font-mono text-[12.5px] tabular-nums",
                  i === caretLine ? "text-blue-600" : "text-ink-faint",
                )}
                style={{ height: LINE_H, lineHeight: `${LINE_H}px` }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <textarea
          ref={taRef}
          value={activeValue}
          onChange={(e) => {
            setActiveValue(e.target.value);
            updateCaretLine();
          }}
          onKeyDown={onKeyDown}
          onScroll={syncScroll}
          onSelect={updateCaretLine}
          onKeyUp={updateCaretLine}
          onClick={updateCaretLine}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`Code editor, ${tab}`}
          className="absolute inset-0 z-[1] resize-none overflow-auto bg-transparent p-2 pl-12 font-mono text-[12.5px] leading-[22px] text-transparent caret-blue-600 outline-none selection:bg-blue-100"
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Testcase / Console panel */}
      <div className="flex h-[170px] shrink-0 flex-col overflow-hidden rounded-xl border border-edge bg-panel">
        <div className="flex shrink-0 items-center justify-between border-b border-edge px-2">
          <div className="flex items-center">
            {(["testcase", "console"] as const).map((panelTab) => (
              <button
                key={panelTab}
                type="button"
                onClick={() => setBottomTab(panelTab)}
                className={cn(
                  "relative rounded-md px-3 py-2 text-[12px] font-medium transition-colors",
                  bottomTab === panelTab
                    ? "text-ink"
                    : "text-ink-faint hover:text-ink-muted",
                )}
              >
                {panelTab === "testcase" ? "Testcase" : "Console"}
                {bottomTab === panelTab ? (
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-blue-600" />
                ) : null}
              </button>
            ))}
          </div>
          {bottomTab === "console" && logs.length > 0 ? (
            <button
              type="button"
              onClick={() => setLogs([])}
              className="mr-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-ink-faint transition-colors hover:bg-panel-muted hover:text-ink"
            >
              <X size={11} />
              Clear
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {bottomTab === "testcase" ? (
            <div className="space-y-2.5 px-3 py-2.5">
              {problem.testCases.length === 0 ? (
                <p className="font-mono text-[12px] text-ink-faint">
                  No test cases for this problem.
                </p>
              ) : (
                problem.testCases.map((tc, i) => (
                  <div key={tc.name}>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                      <span className="font-mono text-[11.5px] text-ink-muted">
                        Case {i + 1} · {tc.name}
                      </span>
                      <span className="font-mono text-[11.5px] text-ink-faint">
                        expected:{" "}
                        <span className="text-blue-600">{tc.expected}</span>
                      </span>
                    </div>
                    <input
                      value={caseInputs[i] ?? ""}
                      onChange={(e) => {
                        const next = [...caseInputs];
                        next[i] = e.target.value;
                        setCaseInputs(next);
                      }}
                      aria-label={`Test case ${i + 1} input`}
                      className="mt-1 w-full rounded-lg border border-edge bg-panel-muted px-2.5 py-1.5 font-mono text-[12px] text-ink outline-none transition-colors focus:border-blue-400 focus:bg-panel"
                    />
                  </div>
                ))
              )}
            </div>
          ) : (
            <div
              ref={consoleRef}
              className="scrollbar-subtle h-full overflow-x-hidden px-3 py-2.5 font-mono text-[12px] leading-5"
            >
              {logs.length === 0 ? (
                <p className="text-ink-faint">
                  Console is empty — press Run or Ctrl/Cmd + Enter.
                </p>
              ) : (
                logs.map((log) => (
                  <p
                    key={log.id}
                    className={cn("break-words", LOG_TONES[log.tone])}
                  >
                    {log.text}
                  </p>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mark solved footer */}
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-edge bg-panel px-3 py-2.5">
        <p className="min-w-0 truncate text-[12px] text-ink-muted">
          {solved ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-blue-600">
              <CheckCircle2 size={13} />
              Marked solved in local demo progress.
            </span>
          ) : (
            "Finished in your editor? Mark it solved to track demo progress."
          )}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={handleMarkSolved}
          disabled={solved}
          className={cn(
            "h-7 shrink-0 gap-1.5 px-3 text-[12px] font-semibold",
            solved
              ? "border border-edge bg-panel-muted text-ink-muted"
              : "border border-transparent bg-blue-600 text-white hover:bg-blue-700",
          )}
        >
          {solved ? "Solved" : `Mark solved · +${problem.xp} XP`}
        </Button>
      </div>

      {/* Status line */}
      <div className="flex shrink-0 items-center gap-2 px-1">
        <Terminal size={11} className="shrink-0 text-ink-faint" />
        <p className="truncate font-mono text-[10.5px] text-ink-faint">
          Go · {lineCount} lines · execution boundary: wire Run to a sandboxed
          `go test` — nothing runs in the browser.
        </p>
      </div>
    </div>
  );
}
