"use client";

import type { LessonBlockPayload } from "api/schemas";
import { VisualizationRenderer } from "./VisualizationRenderer";
import { TimelineViz } from "./Timeline";
import { FlowchartViz } from "./NodeGraph";

/**
 * Single entry point for rendering visualization-capable block payloads.
 * Shared by the inline lesson renderer and the Visual Lab so both stay
 * byte-for-byte identical in behavior.
 */
export function VisualizationBlock({ block }: { block: LessonBlockPayload }) {
  switch (block.type) {
    case "visualization":
      return (
        <VisualizationRenderer
          visualizationType={block.content.visualizationType}
          title={block.content.title}
          description={block.content.description}
          config={block.content.config}
          takeaway={block.content.takeaway}
        />
      );
    case "timeline":
      return (
        <TimelineViz
          title={block.content.title ?? "Timeline"}
          description={block.content.description}
          config={{ events: block.content.events }}
        />
      );
    case "flowchart":
      return (
        <FlowchartViz
          title={block.content.title}
          description={block.content.description}
          takeaway={block.content.takeaway}
          config={{ nodes: block.content.nodes, edges: block.content.edges }}
        />
      );
    default:
      return null;
  }
}
