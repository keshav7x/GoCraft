"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type ConceptNode = { id: string; label: string; description?: string };
type ConceptEdge = { from: string; to: string };

type Positioned = { node: ConceptNode; x: number; y: number };

/**
 * Concept map: a central hub connected to satellite ideas, with optional
 * explicit edges. Layout: hub in the middle, satellites evenly spaced on
 * an ellipse. Connections come from `edges` when provided, otherwise
 * every satellite connects to the hub.
 */
export function ConceptMapViz({
  title = "Concept map",
  description,
  takeaway,
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const nodes = useMemo<ConceptNode[]>(() => {
    const raw = config?.nodes;
    return Array.isArray(raw)
      ? (raw as ConceptNode[]).filter(
          (n) => n && typeof n.id === "string" && typeof n.label === "string",
        )
      : [];
  }, [config?.nodes]);

  const centerLabel =
    typeof config?.center === "string" && config.center.trim()
      ? config.center.trim()
      : null;

  const positions = useMemo<Positioned[]>(() => {
    const count = nodes.length;
    return nodes.map((node, i) => {
      if (count === 1) {
        return { node, x: 50, y: 20 };
      }
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + 38 * Math.cos(angle);
      const y = 50 + 35 * Math.sin(angle);
      return { node, x, y };
    });
  }, [nodes]);

  const edges = useMemo<
    { x1: number; y1: number; x2: number; y2: number }[]
  >(() => {
    const explicit = Array.isArray(config?.edges)
      ? (config!.edges as ConceptEdge[])
      : [];
    if (explicit.length > 0) {
      const byId = new Map(positions.map((p) => [p.node.id, p]));
      return explicit.flatMap((e) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        return a && b ? [{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }] : [];
      });
    }
    // Star topology: every satellite ties back to the hub.
    return positions.map((p) => ({ x1: 50, y1: 50, x2: p.x, y2: p.y }));
  }, [config?.edges, positions]);

  if (positions.length === 0) {
    return (
      <VizEmpty message="No concept nodes configured for this visualization. Pass nodes: [{ id, label }]." />
    );
  }

  return (
    <VizShell
      title={title}
      description={description ?? "Hover an idea to see how it relates."}
      takeaway={takeaway}
    >
      <div className="relative h-[360px] w-full overflow-hidden bg-inset">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="currentColor"
              strokeWidth="0.4"
              className="text-edge"
            />
          ))}
        </svg>

        {centerLabel && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-accent-border bg-accent-soft px-5 py-3 text-center shadow-card"
          >
            <div className="text-[14px] font-semibold text-accent-ink">
              {centerLabel}
            </div>
          </div>
        )}

        {positions.map(({ node, x, y }) => (
          <div
            key={node.id}
            className="group absolute max-w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-edge bg-surface px-3 py-2 text-center shadow-card transition-colors hover:border-accent-border"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="text-[12.5px] font-medium leading-4 text-ink">
              {node.label}
            </div>
            {node.description && (
              <div className="mt-0.5 text-[11px] leading-4 text-ink-muted">
                {node.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </VizShell>
  );
}
