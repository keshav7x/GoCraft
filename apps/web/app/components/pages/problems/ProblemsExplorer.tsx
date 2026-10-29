"use client";

import {
  CheckCircle2,
  CircleDashed,
  Code2,
  RotateCcw,
  SearchX,
  Shuffle,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  PROBLEM_TAGS,
  PROBLEM_TOPICS,
  PROBLEMS,
  TOPIC_PATHS,
  type Difficulty,
} from "../../../lib/demo-data";
import { useDemoStore } from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Badge, DifficultyBadge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { EmptyState } from "../../ui/empty-state";
import { SearchInput, Select } from "../../ui/input";

type StatusFilter = "all" | "solved" | "attempted" | "todo";
type SortKey = "default" | "title" | "difficulty" | "acceptance";

const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

export function ProblemsExplorer() {
  const router = useRouter();
  const solvedProblemIds = useDemoStore((state) => state.solvedProblemIds);

  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<SortKey>("default");

  const statusOf = (id: string, seeded: boolean): StatusFilter =>
    solvedProblemIds.has(id) || seeded ? "solved" : PROBLEMS.find((p) => p.id === id)?.attemptStatus ?? "todo";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = PROBLEMS.filter((problem) => {
      if (q && !problem.title.toLowerCase().includes(q)) return false;
      if (topic !== "all" && problem.topic !== topic) return false;
      if (difficulty !== "all" && problem.difficulty !== difficulty) return false;
      if (tag !== "all" && !problem.tags.includes(tag)) return false;
      if (status !== "all" && statusOf(problem.id, problem.solved) !== status) return false;
      return true;
    });

    const sorted = [...result];
    if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "difficulty")
      sorted.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
    if (sort === "acceptance") sorted.sort((a, b) => b.acceptance - a.acceptance);
    return sorted;
  }, [query, topic, difficulty, status, tag, sort, solvedProblemIds]);

  const activeFilters =
    (query ? 1 : 0) +
    (topic !== "all" ? 1 : 0) +
    (difficulty !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (tag !== "all" ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setTopic("all");
    setDifficulty("all");
    setStatus("all");
    setTag("all");
    setSort("default");
  }

  function shuffleChallenge() {
    const pool = PROBLEMS.filter((p) => statusOf(p.id, p.solved) !== "solved");
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? PROBLEMS[0];
    if (pick) router.push(`/dashboard/problems/${pick.id}`);
  }

  return (
    <div className="space-y-5">
      {/* Topic paths */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TOPIC_PATHS.map((path) => (
          <button
            key={path.topic}
            type="button"
            onClick={() => setTopic((current) => (current === path.topic ? "all" : path.topic))}
            aria-pressed={topic === path.topic}
            className={cn(
              "rounded-xl border bg-white p-4 text-left shadow-sm transition",
              topic === path.topic
                ? "border-accent-400 ring-1 ring-accent-400"
                : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-900">{path.topic}</span>
              <span className="tabular-nums text-[11px] text-slate-400">
                {path.problems} problems
              </span>
            </div>
            <p className="mt-1 text-[11.5px] leading-4 text-slate-500">{path.blurb}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            placeholder="Search problems by title…"
            aria-label="Search problems"
            className="lg:w-72"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              aria-label="Filter by topic"
            >
              <option value="all">All topics</option>
              {PROBLEM_TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as "all" | Difficulty)}
              aria-label="Filter by difficulty"
            >
              <option value="all">Any difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>

            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              aria-label="Filter by status"
            >
              <option value="all">Any status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="todo">Unattempted</option>
            </Select>

            <Select value={tag} onChange={(event) => setTag(event.target.value)} aria-label="Filter by tag">
              <option value="all">All tags</option>
              {PROBLEM_TAGS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label="Sort problems"
            >
              <option value="default">Sort: Recommended</option>
              <option value="title">Sort: Title</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="acceptance">Sort: Acceptance</option>
            </Select>

            {activeFilters > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <RotateCcw size={13} /> Reset
                <span className="tabular-nums rounded-md bg-slate-100 px-1.5 text-[10px]">
                  {activeFilters}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={shuffleChallenge}
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-slate-900 bg-white px-3.5 text-[13px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-950 hover:text-white active:translate-y-px"
            >
              <Shuffle size={14} />
              Shuffle challenge
            </button>
          </div>
        </div>

        <p className="mt-3 text-[11.5px] text-slate-400">
          <span className="tabular-nums font-medium text-slate-600">{filtered.length}</span> of{" "}
          <span className="tabular-nums">{PROBLEMS.length}</span> problems
          {activeFilters > 0 && " match your filters"} · sample dataset
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No problems match"
          description="Try a different search term, or clear your filters to see the full set of practice problems."
          action={
            <Button size="sm" variant="secondary" onClick={resetFilters}>
              <RotateCcw size={13} />
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Header row (desktop) */}
          <div className="hidden grid-cols-[1fr_120px_110px_90px_80px] items-center gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400 md:grid">
            <span>Problem</span>
            <span>Topic</span>
            <span>Difficulty</span>
            <span>Acceptance</span>
            <span className="text-right">Status</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {filtered.map((problem) => {
              const solved = solvedProblemIds.has(problem.id) || problem.solved;
              const attempted = !solved && problem.attemptStatus === "attempted";

              return (
                <li key={problem.id}>
                  <Link
                    href={`/dashboard/problems/${problem.id}`}
                    className="grid grid-cols-1 gap-2 px-5 py-3.5 transition hover:bg-slate-50 md:grid-cols-[1fr_120px_110px_90px_80px] md:items-center md:gap-4"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          solved
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white text-slate-400",
                        )}
                      >
                        {solved ? <CheckCircle2 size={15} /> : <Code2 size={15} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium text-slate-900">
                          {problem.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500 md:hidden">
                          {problem.topic} · {problem.difficulty}
                        </span>
                      </span>
                    </span>

                    <span className="hidden md:block">
                      <Badge variant="outline">{problem.topic}</Badge>
                    </span>

                    <span className="hidden md:block">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </span>

                    <span className="hidden tabular-nums text-[12.5px] text-slate-500 md:block">
                      {problem.acceptance}%
                    </span>

                    <span className="flex items-center justify-start gap-1.5 md:justify-end">
                      {solved ? (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-700">
                          <CheckCircle2 size={13} /> Solved
                        </span>
                      ) : attempted ? (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-amber-700">
                          <Timer size={13} /> Attempted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-400">
                          <CircleDashed size={13} /> Todo
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
