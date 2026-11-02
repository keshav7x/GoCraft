"use client";

import { getVisualization } from "./registry";
import { VizEmpty } from "./viz-shared";

/**
 * Renders a visualization block by type. Unknown types fail gracefully.
 */
export function VisualizationRenderer({
  visualizationType,
  title,
  description,
  config,
  takeaway,
}: {
  visualizationType: string;
  title?: string;
  description?: string;
  config?: Record<string, unknown>;
  takeaway?: string;
}) {
  const Component = getVisualization(visualizationType);

  if (!Component) {
    return (
      <VizEmpty
        message={`Unknown visualization "${visualizationType}" — it may belong to a newer version of GoCraft.`}
      />
    );
  }

  return (
    <Component
      title={title}
      description={description}
      config={config}
      takeaway={takeaway}
    />
  );
}
