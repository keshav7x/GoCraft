"use client";

import {
  CheckCircle2,
  Circle,
  Code2,
  Filter,
  SearchX,
  Shuffle,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, DifficultyBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { PageHeader } from "../../components/ui/page-header";
import { SearchInput, Select } from "../../components/ui/input";
import { DIFFICULTY_ORDER, PROBLEMS, TOPICS } from "../../lib/demo/problems";
import { useDemoStore } from "../../lib/progress-store";
import { cn } from "../../lib/utils";

type StatusFilter = "all" | "solved" | "unsolved";
type SortKey = "default" | "acceptance" | "xp" | "title";

function useProblemFilters() {
  const searchParams = useSearchParams();
  const completed = useDemoStore((s) => s.completedProblemIds);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>(
    searchParams.get("topic") ?? "all",
  );
  const [difficulty, setDifficulty] = useState<string>(
    searchParams.get("difficulty") ?? "all",
  );
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("default");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PROBLEMS.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.tags.some((t) => t.includes(q)))
        return false;
      if (topic !== "all" && p.topic !== topic) return false;
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (status === "solved" && !completed.includes(p.id)) return false;
      if (status === "unsolved" && completed.includes(p.id)) return false;
      return true;
    });

    if (sort === "acceptance") list = [...list].sort((a, b) => b.acceptance - a.acceptance);
    if (sort === "xp") list = [...list].sort((a, b) => b.xp - a.xp);
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "default")
      list = [...list].sort(
        (a, b) =>
          DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
          a.title.localeCompare(b.title),
      );

    return list;
  }, [query, topic, difficulty, status, sort, completed]);

  const activeFilterCount =
    (topic !== "all" ? 1 : 0) +
    (difficulty !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setTopic("all");
    setDifficulty("all");
    setStatus("all");
    setSort("default");
  }

  function shuffle() {
    const pool = filtered.length > 0 ? filtered : PROBLEMS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      toast(`Shuffled to: ${pick.title}`, {
        description: `${pick.difficulty} · ${pick.topic}`,
      });
      router.push(`/dashboard/problems/${pick.id}`);
    }
  }

  return {
    query,
    setQuery,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    status,
    setStatus,
    sort,
    setSort,
    filtered,
    activeFilterCount,
    resetFilters,
    shuffle,
    solvedCount: completed.filter((id) => PROBLEMS.some((p) => p.id === id)).length,
  };
}

const TOPIC_COUNTS = TOPICS.map((topic) => ({
  topic,
  count: PROBLEMS.filter((p) => p.topic === topic).length,
}));

export function ProblemsClient() {
  const filters = useProblemFilters();
  const completed = useDemoStore((s) => s.completedProblemIds);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problems"
        description="Topic-based practice with progressive difficulty. Every problem routes to a real detail page with examples, constraints, and an editor scaffold."
        actions={
          <Button type="button" variant="accent" onClick={filters.shuffle}>
            <Shuffle size={15} />
            Shuffle a challenge
          </Button>
        }
      />

      {/* Topic paths */}
      <Card>
        <CardHeader className="border-b-0 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-accent" />
            <CardTitle>Practice paths</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-5 pb-4">
          {TOPIC_COUNTS.map(({ topic, count }) => (
            <button
              key={topic}
              type="button"
              onClick={() =>
                filters.setTopic(filters.topic === topic ? "all" : topic)
              }
              className={cn(
                "focus-ring inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                filters.topic === topic
                  ? "border-accent-border bg-accent-soft text-accent-strong"
                  : "border-edge bg-panel text-ink-muted hover:border-edge-strong hover:text-ink",
              )}
            >
              {topic}
              <span className="text-[11px] tabular-nums opacity-70">{count}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          placeholder="Search by title or tag…"
          value={filters.query}
          onChange={(e) => filters.setQuery(e.target.value)}
          aria-label="Search problems"
          className="lg:w-72"
        />

        <div className="scrollbar-subtle flex flex-1 flex-wrap items-center gap-2">
          <Select
            value={filters.topic}
            onChange={(e) => filters.setTopic(e.target.value)}
            aria-label="Filter by topic"
          >
            <option value="all">All topics</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>

          <Select
            value={filters.difficulty}
            onChange={(e) => filters.setDifficulty(e.target.value)}
            aria-label="Filter by difficulty"
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>

          <Select
            value={filters.status}
            onChange={(e) => filters.setStatus(e.target.value as StatusFilter)}
            aria-label="Filter by status"
          >
            <option value="all">Any status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </Select>

          <Select
            value={filters.sort}
            onChange={(e) => filters.setSort(e.target.value as SortKey)}
            aria-label="Sort problems"
          >
            <option value="default">Sort: Difficulty</option>
            <option value="acceptance">Sort: Acceptance</option>
            <option value="xp">Sort: XP</option>
            <option value="title">Sort: Title</option>
          </Select>

          {filters.activeFilterCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={filters.resetFilters}
            >
              <X size={13} />
              Reset ({filters.activeFilterCount})
            </Button>
          ) : null}
        </div>

        <p className="shrink-0 text-[12.5px] tabular-nums text-ink-muted">
          {filters.filtered.length} of {PROBLEMS.length} problems ·{" "}
          {filters.solvedCount} solved
        </p>
      </div>

      {/* List */}
      {filters.filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No problems match"
          description="Try clearing filters or searching for a different term. Your solved history is kept either way."
          action={
            <Button type="button" onClick={filters.resetFilters}>
              <Filter size={14} />
              Clear all filters
            </Button>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-edge">
            {filters.filtered.map((problem) => {
              const solved = completed.includes(problem.id);
              return (
                <li key={problem.id}>
                  <Link
                    href={`/dashboard/problems/${problem.id}`}
                    className="focus-ring group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-panel-muted/60 sm:px-5"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        solved
                          ? "border-easy/30 bg-easy-soft text-easy"
                          : "border-edge bg-panel text-ink-faint",
                      )}
                      title={solved ? "Solved" : "Not solved"}
                    >
                      {solved ? <CheckCircle2 size={15} /> : <Circle size={13} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13.5px] font-medium text-ink group-hover:text-accent-strong">
                          {problem.title}
                        </p>
                        {solved ? (
                          <Badge tone="success" className="hidden sm:inline-flex">
                            Solved
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                        {problem.topic}
                        {problem.tags.length > 0
                          ? ` · ${problem.tags.slice(0, 3).join(", ")}`
                          : ""}
                      </p>
                    </div>

                    <span className="hidden shrink-0 text-[12px] tabular-nums text-ink-faint sm:inline">
                      {problem.acceptance}% acceptance
                    </span>
                    <span className="hidden shrink-0 text-[12px] font-medium tabular-nums text-accent-strong md:inline">
                      +{problem.xp} XP
                    </span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <p className="text-center text-[11px] text-ink-faint">
        <Code2 size={11} className="mr-1 inline align-[-2px]" />
        Submission history is stored in this browser — no judge is connected.
      </p>
    </div>
  );
}
