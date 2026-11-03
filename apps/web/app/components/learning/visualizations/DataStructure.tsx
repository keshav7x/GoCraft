"use client";

import { useMemo } from "react";
import { VizShell, VizEmpty } from "./viz-shared";

type Cell = {
  value?: string;
  label?: string; // shown above the cell (index / address)
  description?: string;
  highlight?: boolean;
};

type Pointer = {
  name: string;
  at?: string; // cell label it points to (index or address)
};

type CellRowProps = {
  cells: Array<Cell & { display: string }>;
};

function MemoryCells({ cells }: CellRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`min-w-[76px] rounded-lg border text-center shadow-card ${
            cell.highlight
              ? "border-accent-border bg-accent-soft"
              : "border-edge bg-surface"
          }`}
        >
          {cell.label && (
            <div className="border-b border-edge bg-inset px-2 py-1 text-[10px] font-mono text-ink-faint">
              {cell.label}
            </div>
          )}
          <div className="px-2 py-2 font-mono text-[13px] leading-4 text-ink tabular-nums">
            {cell.display}
          </div>
          {cell.description && (
            <div className="border-t border-edge px-2 py-1 text-[10.5px] leading-3.5 text-ink-muted">
              {cell.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Data structure snapshot: array/cells visualization with named pointers
 * and optional structure note. Authoring shape:
 * { kind?: "array"|"list"|"map"|"stack"|"queue",
 *   cells: [{value,label?,description?,highlight?}],
 *   pointers: [{name,at}], notes?: string }
 */
export function DataStructureViz({
  title = "Data structure",
  description,
  takeaway,
  config,
}: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const raw = config?.cells;
  const cells = useMemo<Array<Cell & { display: string }>>(() => {
    if (!Array.isArray(raw)) return [];
    return (raw as Cell[]).map((c, i) => ({
      ...c,
      display: c?.value !== undefined ? String(c.value) : "",
      label: c?.label ?? (String(config?.kind) === "array" ? String(i) : undefined),
    }));
  }, [raw, config?.kind]);

  const pointers = useMemo<Pointer[]>(
    () => (Array.isArray(config?.pointers) ? (config!.pointers as Pointer[]) : []),
    [config?.pointers],
  );

  const kind =
    typeof config?.kind === "string" && config.kind.trim()
      ? config.kind.trim()
      : null;

  if (cells.length === 0) {
    return (
      <VizEmpty message="No cells configured. Pass cells: [{ value, label?, highlight? }] and optionally pointers." />
    );
  }

  return (
    <VizShell
      title={title}
      description={description ?? (kind ? `Structure: ${kind}.` : undefined)}
      takeaway={takeaway}
    >
      <div className="space-y-4">
        <MemoryCells cells={cells} />

        {pointers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pointers.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md border border-accent-border bg-accent-soft px-2.5 py-1 font-mono text-[11.5px] font-medium text-accent-ink"
              >
                {p.name} ➜ {p.at ?? "?"}
              </span>
            ))}
          </div>
        )}
      </div>
    </VizShell>
  );
}

/**
 * Memory diagram: same visual language, framed as memory addresses.
 * Authoring shape:
 * { cells: [{address?, value, highlight?}], pointers: [{name, address|at}] }
 */
export function MemoryDiagramViz(props: {
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}) {
  const cfg = props.config ?? {};
  const cells = useMemo(
    () =>
      Array.isArray(cfg.cells)
        ? (cfg.cells as Array<{
            address?: string;
            value?: string;
            highlight?: boolean;
            description?: string;
          }>).map((c) => ({
            value: c.value,
            label: c.address,
            description: c.description,
            highlight: c.highlight,
          }))
        : [],
    [cfg],
  );
  const pointers = useMemo(
    () =>
      Array.isArray(cfg.pointers)
        ? (cfg.pointers as Array<{ name?: string; address?: string; at?: string }>).map(
            (p) => ({ name: p.name ?? "ptr", at: p.at ?? p.address }),
          )
        : [],
    [cfg],
  );

  return <DataStructureViz {...props} config={{ kind: "memory", cells, pointers }} />;
}
