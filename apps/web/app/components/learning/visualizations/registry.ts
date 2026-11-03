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
import { ConceptMapViz } from "./ConceptMap";
import { TimelineViz } from "./Timeline";
import { ComparisonViz } from "./Comparison";
import {
  NodeGraphViz,
  FlowchartViz,
  StateMachineViz,
} from "./NodeGraph";
import { SequenceDiagramViz } from "./SequenceDiagram";
import { DataStructureViz, MemoryDiagramViz } from "./DataStructure";
import { ConcurrencyDiagramViz } from "./ConcurrencyDiagram";

export type VisualizationComponent = ComponentType<{
  title?: string;
  description?: string;
  takeaway?: string;
  config?: Record<string, unknown>;
}>;

/**
 * Registry: lessons reference visualizations by `visualizationType`.
 * Dash names are the original GoCraft set kept for existing content;
 * underscore names follow the expanded content grammar.
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
  "concept-map": ConceptMapViz,
  "timeline": TimelineViz,
  "comparison": ComparisonViz,
  "concept_map": ConceptMapViz,
  "architecture": NodeGraphViz,
  "flowchart": FlowchartViz,
  "sequence_diagram": SequenceDiagramViz,
  "memory_diagram": MemoryDiagramViz,
  "execution_trace": ExecutionFlowViz,
  "concurrency_diagram": ConcurrencyDiagramViz,
  "data_structure": DataStructureViz,
  "state_machine": StateMachineViz,
  "interactive_flow": ExecutionFlowViz,
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
  { value: "concept-map", label: "Concept map" },
  { value: "timeline", label: "Timeline" },
  { value: "comparison", label: "Comparison" },
  { value: "concept_map", label: "Concept map (node grammar)" },
  { value: "architecture", label: "Architecture" },
  { value: "flowchart", label: "Flowchart" },
  { value: "sequence_diagram", label: "Sequence diagram" },
  { value: "memory_diagram", label: "Memory diagram" },
  { value: "execution_trace", label: "Execution trace" },
  { value: "concurrency_diagram", label: "Concurrency diagram" },
  { value: "data_structure", label: "Data structure" },
  { value: "state_machine", label: "State machine" },
  { value: "interactive_flow", label: "Interactive flow" },
];
