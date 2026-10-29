"use client";

import { ArrowRight, Clock, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ARTICLE_CATEGORIES,
  type Article,
  type ArticleCategory,
} from "../../../lib/rabbit-hole/articles";
import { cn } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { EmptyState } from "../../ui/empty-state";
import { SearchInput } from "../../ui/input";

type FilterValue = ArticleCategory | "All";

const FILTERS: FilterValue[] = ["All", ...ARTICLE_CATEGORIES];

function matchesQuery(article: Article, query: string) {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    article.title.toLowerCase().includes(needle) ||
    article.description.toLowerCase().includes(needle) ||
    article.category.toLowerCase().includes(needle)
  );
}

function ArticleRow({ article }: { article: Article }) {
  return (
    <li>
      <Link
        href={`/dashboard/rabbit-hole/${article.slug}`}
        className="gc-focus-ring group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-panel-muted/60"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14.5px] font-medium text-ink group-hover:text-accent-ink">
              {article.title}
            </h3>
            <Badge variant="neutral">{article.category}</Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-ink-muted">
            {article.description}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-faint">
            <Clock size={12} />
            {article.readingMinutes} min read
          </p>
        </div>
        <ArrowRight
          size={15}
          className="mt-1 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent-ink"
        />
      </Link>
    </li>
  );
}

type RabbitHoleExplorerProps = {
  articles: Article[];
  featured: Article | null;
};

export function RabbitHoleExplorer({
  articles,
  featured,
}: RabbitHoleExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterValue>("All");

  const trimmedQuery = query.trim();
  const hasActiveFilter = trimmedQuery !== "" || category !== "All";

  const filtered = useMemo(
    () =>
      articles.filter(
        (article) =>
          (category === "All" || article.category === category) &&
          matchesQuery(article, trimmedQuery),
      ),
    [articles, category, trimmedQuery],
  );

  const results = hasActiveFilter
    ? filtered
    : filtered.filter((article) => article.slug !== featured?.slug);

  function clearFilters() {
    setQuery("");
    setCategory("All");
  }

  return (
    <div className="space-y-6">
      {/* Search + category filters */}
      <div className="space-y-3">
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search articles…"
          aria-label="Search articles"
        />

        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((filter) => {
            const active = category === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(filter)}
                className={cn(
                  "gc-focus-ring rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-edge bg-panel text-ink-muted hover:border-edge-strong hover:text-ink",
                )}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="text-[12.5px] text-ink-faint">
          {hasActiveFilter
            ? `${filtered.length} ${filtered.length === 1 ? "article" : "articles"} found`
            : `${articles.length} articles`}
        </p>
      </div>

      {/* Featured (hidden while searching or filtering) */}
      {!hasActiveFilter && featured ? (
        <section aria-label="Featured article" className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-ink">
            Featured
          </p>
          <Link
            href={`/dashboard/rabbit-hole/${featured.slug}`}
            className="gc-focus-ring group block rounded-xl border border-edge bg-panel p-5 transition-colors hover:border-accent/40 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{featured.category}</Badge>
              <span className="flex items-center gap-1.5 text-[12px] text-ink-faint">
                <Clock size={12} />
                {featured.readingMinutes} min read
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink group-hover:text-accent-ink">
              {featured.title}
            </h2>
            <p className="mt-1.5 max-w-3xl text-[13.5px] leading-6 text-ink-muted">
              {featured.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-strong">
              Read article
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </section>
      ) : null}

      {/* Results */}
      {results.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-edge bg-panel">
          <ul className="divide-y divide-edge">
            {results.map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No articles found"
          description={
            hasActiveFilter
              ? "Nothing matches your search and filters yet. Try a broader term, or clear the filters to see everything."
              : "No articles have been published yet."
          }
          action={
            hasActiveFilter ? (
              <Button type="button" size="sm" variant="secondary" onClick={clearFilters}>
                Clear search and filters
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
