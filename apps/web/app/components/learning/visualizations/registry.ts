"use client";

import type { ComponentType } from "react";
import type { VisualizationType } from "api/schemas";
import { PointerMemoryViz } from "./PointerMemory";
import { SliceMemoryViz } from "./SliceMemory";
import { ArrayMemoryViz } from "./ArrayMemory";
import { GoroutineFlowViz } from "./GoroutineFlow";
import { ChannelFlowViz } from "./ChannelFlow";
import { MutexLockViz } from "./MutexLock";
import { ExecutionFlowViz } from "./ExecutionFlow";

export type VisualizationComponent = ComponentType<{
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}>;

/**
 * Registry: lessons reference visualizations by `visualizationType`.
 * Unknown types render a graceful fallback — never crash the renderer.
 */
export const visualizationRegistry: Record<
  VisualizationType,
  VisualizationComponent
> = {
  "pointer-memory": PointerMemoryViz,
  "slice-memory": SliceMemoryViz,
  "array-memory": ArrayMemoryViz,
  "goroutine-flow": GoroutineFlowViz,
  "channel-flow": ChannelFlowViz,
  "mutex-lock": MutexLockViz,
  "execution-flow": ExecutionFlowViz,
};

export function getVisualization(
  type: string
): VisualizationComponent | null {
  return (
    (visualizationRegistry as Record<string, VisualizationComponent>)[type] ??
    null
  );
}

export const VISUALIZATION_TYPE_OPTIONS: {
  value: VisualizationType;
  label: string;
}[] = [
  { value: "pointer-memory", label: "Pointer & memory" },
  { value: "slice-memory", label: "Slice memory" },
  { value: "array-memory", label: "Array memory" },
  { value: "goroutine-flow", label: "Goroutine flow" },
  { value: "channel-flow", label: "Channel flow" },
  { value: "mutex-lock", label: "Mutex lock" },
  { value: "execution-flow", label: "Execution flow" },
];
