import type { ParsedBlock } from "./types";

/**
 * Block types whose payloads render through the visualization system.
 * The Visual Lab panel keys everything off this check so the lesson,
 * the lab, and Pico's context all stay in sync.
 */
export type VisualBlockType = "visualization" | "timeline" | "flowchart";

const VISUAL_BLOCK_TYPES = new Set<VisualBlockType>([
  "visualization",
  "timeline",
  "flowchart",
]);

export function isVisualBlockType(type: string): type is VisualBlockType {
  return (VISUAL_BLOCK_TYPES as Set<string>).has(type);
}

export function isVisualBlock(block: ParsedBlock): boolean {
  return block.payload !== null && isVisualBlockType(block.payload.type);
}

/** Visualization-capable blocks in author order. */
export function visualBlocks(blocks: ParsedBlock[]): ParsedBlock[] {
  return blocks.filter(isVisualBlock);
}

/** Short human label for a visual block (tab captions, chips). */
export function visualBlockLabel(block: ParsedBlock): string {
  const p = block.payload;
  if (!p) return "Visualization";
  if (p.type === "visualization") {
    return p.content.title ?? humanize(p.content.visualizationType);
  }
  if (p.type === "timeline") return p.content.title ?? "Timeline";
  if (p.type === "flowchart") return p.content.title ?? "Flowchart";
  return "Visualization";
}

/** Stable visualization kind for captions/chips. */
export function visualBlockKind(block: ParsedBlock): string {
  const p = block.payload;
  if (!p) return "visual";
  if (p.type === "visualization") return humanize(p.content.visualizationType);
  return p.type === "timeline" ? "Timeline" : "Flowchart";
}

function humanize(type: string): string {
  return type
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
