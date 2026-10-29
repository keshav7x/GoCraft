import { ArrowLeft, ChevronRight, Clock, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "../../../components/shared/CodeBlock";
import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/ui/page-header";
import { getRabbitHoleAccess } from "../../../lib/premium-access";
import {
  findArticle,
  listArticles,
  type ArticleBlock,
} from "../../../lib/rabbit-hole/articles";
import { cn } from "../../../lib/utils";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.description };
}

const CALLOUT_TONES: Record<"info" | "tip" | "warning", string> = {
  info: "border-accent bg-accent-soft text-accent-ink",
  tip: "border-easy/20 bg-easy-soft text-easy",
  warning: "border-medium/25 bg-medium-soft text-medium",
};

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-8 text-[15px] font-semibold tracking-tight text-ink first:mt-0">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="text-[14.5px] leading-7 text-ink-muted">{block.text}</p>
      );
    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[14px] leading-6 text-ink-muted"
            >
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return <CodeBlock code={block.code} filename={block.filename} />;
    case "callout":
      return (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-[13.5px] leading-6",
            CALLOUT_TONES[block.tone],
          )}
        >
          {block.text}
        </div>
      );
  }
}

export default async function RabbitHoleArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const article = findArticle(slug);

  // Same server-side premium gate as the list route (integration point:
  // app/lib/premium-access.ts — no entitlement system exists yet).
  const access = await getRabbitHoleAccess();

  if (!access.granted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rabbit Hole" description="One interesting idea leads to another." />
        <EmptyState
          icon={Lock}
          title="Premium feature"
          description="Rabbit Hole is part of GoCraft Premium. Premium verification is not implemented in this build yet, so access can't be confirmed from this device."
        />
      </div>
    );
  }

  if (!article) notFound();

  const continueReading = listArticles()
    .filter((other) => other.slug !== article.slug)
    .sort(
      (a, b) =>
        Number(b.category === article.category) -
        Number(a.category === article.category),
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/rabbit-hole"
        className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        All articles
      </Link>

      <article className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="accent">{article.category}</Badge>
          <span className="flex items-center gap-1.5 text-[12.5px] text-ink-faint">
            <Clock size={13} />
            {article.readingMinutes} min read
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
          {article.title}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-muted">
          {article.description}
        </p>

        <hr className="my-7 border-edge" />

        <div>
          {article.blocks.map((block, i) => (
            <ArticleBlockView key={i} block={block} />
          ))}
        </div>
      </article>

      {continueReading.length > 0 ? (
        <section aria-label="Continue exploring" className="max-w-3xl">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ink-faint">
            Continue exploring
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-edge bg-panel">
            <ul className="divide-y divide-edge">
              {continueReading.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/dashboard/rabbit-hole/${other.slug}`}
                    className="gc-focus-ring group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-panel-muted/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                        {other.title}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">
                        {other.category} · {other.readingMinutes} min read
                      </p>
                    </div>
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
