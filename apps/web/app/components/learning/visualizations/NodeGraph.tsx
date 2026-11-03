"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type FlowNode = {
  id: string;
  label: string;
  description?: string;
  layer?: number;
  shape?: string; // box | decision | start | end
};

type FlowEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

type Position = { node: FlowNode; x: number; y: number };

const SHAPE_STYLE: Record<string, string> = {
  box: "border-edge bg-surface",
  decision: "border-warning/40 bg-warning-soft",
  start: "border-accent-border bg-accent-soft",
  end: "border-success/40 bg-success-soft",
};

const SHAPE_MARK: Record<string, string> = {
  decision: "◆",
  start: "▶",
  end: "■",
};

/**
 * Generic layered node graph: nodes grouped by `layer` (default 0),
 * laid out in horizontal rows, edges as lines with optional labels.
 * Dashed edges signal conditional/optional paths. Titles:
 *   - flowchart    → node pipeline with decision branches
 *   - architecture → system structure overview
 *   - state_machine    node states + transitions
 *   - memory_diagram   memory regions + pointer notes
 * Authoring shape: { nodes: [{id,label,description?,layer?,shape?}],
 *                    edges: [{from,to,label?,dashed?}] }
 */
function NodeGraphVizBase({
  defaultTitle,
  title,
  description,
  takeaway,
  config,
}: {
  defaultTitle: string;
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const nodes = useMemo<FlowNode[]>(() => {
    const raw = config?.nodes;
    return Array.isArray(raw)
      ? (raw as FlowNode[]).filter(
          (n) => n && typeof n.id === "string" && typeof n.label === "string",
        )
      : [];
  }, [config?.nodes]);

  const edges = useMemo<FlowEdge[]>(() => {
    const raw = config?.edges;
    return Array.isArray(raw) ? (raw as FlowEdge[]).filter((e) => e?.from && e?.to) : [];
  }, [config?.edges]);

  const byId = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  const positions = useMemo<Position[]>(() => {
    // Group nodes into layers (rows), preserving authoring order within a row.
    const layers = new Map<number, FlowNode[]>();
    let maxLayer = -1;
    for (const node of nodes) {
      const layer = Math.max(0, node.layer ?? 0);
      maxLayer = Math.max(maxLayer, layer);
      const arr = layers.get(layer) ?? [];
      arr.push(node);
      layers.set(layer, arr);
    }
    if (maxLayer < 0) return [];
    const out: Position[] = [];
    for (let r = 0; r <= maxLayer; r += 1) {
      const row = layers.get(r) ?? [];
      row.forEach((node, i) => {
        const x = ((i + 0.5) / Math.max(row.length, 1)) * 100;
        const y = ((r + 0.5) / (maxLayer + 1)) * 100;
        out.push({ node, x, y });
      });
    }
    return out;
  }, [nodes]);

  if (positions.length === 0) {
    return (
      <VizEmpty message="No graph nodes configured. Pass nodes: [{ id, label }] and optionally edges: [{ from, to }]." />
    );
  }

  const posById = new Map(positions.map((p) => [p.node.id, p]));
  const rows = Math.max(...nodes.map((n) => Math.max(0, n.layer ?? 0))) + 1;

  return (
    <VizShell title={title ?? defaultTitle} description={description} takeaway={takeaway}>
      <div
        className="relative w-full overflow-x-auto overflow-y-hidden bg-inset"
        style={{ height: `${Math.max(rows * 130, 240)}px` }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {edges.map((e, i) => {
            const a = posById.get(e.from);
            const b = posById.get(e.to);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="currentColor"
                strokeWidth="0.35"
                strokeDasharray={e.dashed ? "2 2" : undefined}
                className="text-ink-faint"
              />
            );
          })}
        </svg>

        {positions.map(({ node, x, y }) => {
          const shape = node.shape ?? "box";
          return (
            <div
              key={node.id}
              className={`absolute min-w-[120px] max-w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 text-center shadow-card ${SHAPE_STYLE[shape] ?? SHAPE_STYLE.box}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {SHAPE_MARK[shape] && (
                <span className="mr-1 text-[11px] text-ink-faint" aria-hidden>
                  {SHAPE_MARK[shape]}
                </span>
              )}
              <span className="text-[12.5px] font-medium leading-4 text-ink">
                {node.label}
              </span>
              {node.description && (
                <div className="mt-0.5 text-[11px] leading-4 text-ink-muted">
                  {node.description}
                </div>
              )}
            </div>
          );
        })}

        {edges.map((e, i) => {
          const a = posById.get(e.from);
          const b = posById.get(e.to);
          if (!a || !b || !e.label) return null;
          return (
            <span
              key={`lab-${i}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-edge bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted tabular-nums"
              style={{
                left: `${(a.x + b.x) / 2}%`,
                top: `${(a.y + b.y) / 2}%`,
              }}
            >
              {e.label}
            </span>
          );
        })}
      </div>
    </VizShell>
  );
}

export function NodeGraphViz(props: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  return <NodeGraphVizBase defaultTitle="Structure overview" {...props} />;
}

export function FlowchartViz(props: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  return <NodeGraphVizBase defaultTitle="Flowchart" {...props} />;
}

export function StateMachineViz(props: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  return <NodeGraphVizBase defaultTitle="State machine" {...props} />;
}
