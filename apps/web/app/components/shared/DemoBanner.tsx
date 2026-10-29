import { Info } from "lucide-react";

/**
 * Honest banner shown on screens that rely on sample data.
 * Keeps demo state visually separated from real account data.
 */
export function DemoBanner({ note }: { note?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-edge bg-panel-muted px-3.5 py-2.5 text-xs leading-5 text-ink-muted">
      <Info size={14} className="mt-0.5 shrink-0 text-ink-faint" />
      <p>
        <span className="font-medium text-ink">Demo data.</span>{" "}
        {note ??
          "Profiles, XP, and progress on this screen are samples stored locally in your browser. No backend is connected."}
      </p>
    </div>
  );
}
