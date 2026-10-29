import { ArrowLeft, ChevronRight, Clock, Tag, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "../../../components/problems/ProblemWorkspace";
import { Badge, DifficultyBadge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { CodeBlock } from "../../../components/shared/CodeBlock";
import { findProblem, relatedProblems } from "../../../lib/demo/problems";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  const problem = findProblem(problemId);
  if (!problem) notFound();

  const related = relatedProblems(problem);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/problems"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} />
          All problems
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                {problem.title}
              </h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              {problem.summary}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-ink-muted">
              <Badge>
                <Clock size={11} />
                {problem.minutes} min
              </Badge>
              <Badge tone="accent">
                <Zap size={11} />+{problem.xp} XP
              </Badge>
              <Badge>
                <Tag size={11} />
                {problem.topic}
              </Badge>
              <span className="tabular-nums">{problem.acceptance}% acceptance</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 py-5">
              {problem.description.map((paragraph, i) => (
                <p key={i} className="text-[13.5px] leading-[1.75] text-ink-muted">
                  {paragraph}
                </p>
              ))}

              <div>
                <h3 className="text-[13px] font-semibold text-ink">Examples</h3>
                <div className="mt-2.5 space-y-3">
                  {problem.examples.map((example, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg border border-edge"
                    >
                      <p className="border-b border-edge bg-panel-muted px-3.5 py-2 font-mono text-[11.5px] text-ink-muted">
                        Example {i + 1}
                      </p>
                      <div className="space-y-2 px-3.5 py-3 font-mono text-[12px]">
                        <p>
                          <span className="text-ink-faint">Input: </span>
                          <span className="text-ink">{example.input}</span>
                        </p>
                        <p>
                          <span className="text-ink-faint">Output: </span>
                          <span className="text-ink">{example.output}</span>
                        </p>
                        {example.explanation ? (
                          <p className="font-sans text-[12.5px] leading-5 text-ink-muted">
                            {example.explanation}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-ink">Constraints</h3>
                <ul className="mt-2.5 space-y-1.5">
                  {problem.constraints.map((constraint, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-mono text-[12px] leading-5 text-ink-muted"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  Function signature
                </h3>
                <CodeBlock code={problem.functionSignature} className="mt-2.5" />
              </div>
            </CardContent>
          </Card>

          <ProblemWorkspace problem={problem} />
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Related problems</CardTitle>
            </CardHeader>
            {related.length === 0 ? (
              <CardContent className="px-5 py-6 text-[12.5px] text-ink-muted">
                No related problems yet.
              </CardContent>
            ) : (
              <ul className="divide-y divide-edge">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/problems/${item.id}`}
                      className="focus-ring group flex items-center gap-2 px-5 py-3 transition-colors hover:bg-panel-muted/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-ink-muted">
                          {item.topic} · +{item.xp} XP
                        </p>
                      </div>
                      <DifficultyBadge difficulty={item.difficulty} />
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration boundary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-5 py-4 text-[12.5px] leading-5 text-ink-muted">
              <p>
                The editor is a scaffold: run and submit actions surface honest
                notices instead of fabricating results.
              </p>
              <p>
                To go live, connect a sandboxed <code className="font-mono text-[11.5px]">go test</code>{" "}
                runner and a submissions API, then swap the handlers in{" "}
                <code className="font-mono text-[11.5px]">
                  ProblemWorkspace
                </code>
                .
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
