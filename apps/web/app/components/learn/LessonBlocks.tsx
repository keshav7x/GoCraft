import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import type { LessonSection } from "../../lib/demo/types";
import { CodeBlock } from "../shared/CodeBlock";
import { cn } from "../../lib/utils";

const CALLOUT = {
  tip: {
    icon: Lightbulb,
    className: "border-accent-border bg-accent-soft text-accent-strong",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-medium/25 bg-medium-soft text-medium",
  },
  info: {
    icon: Info,
    className: "border-edge bg-panel-muted text-ink-muted",
  },
} as const;

export function LessonBlocks({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        if (section.callout) {
          const config = CALLOUT[section.callout.tone];
          const Icon = config.icon;
          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3.5",
                config.className,
              )}
            >
              <Icon size={15} className="mt-0.5 shrink-0" />
              <p className="text-[13px] leading-5">{section.callout.text}</p>
            </div>
          );
        }

        return (
          <div key={index}>
            {section.heading ? (
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                {section.heading}
              </h3>
            ) : null}
            {section.paragraphs && section.paragraphs.length > 0 ? (
              <div className={cn("space-y-3", section.heading && "mt-2.5")}>
                {section.paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[13.5px] leading-[1.75] text-ink-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {section.code ? (
              <div className={cn(section.heading || section.paragraphs ? "mt-4" : "")}>
                <CodeBlock
                  code={section.code.source}
                  filename={section.code.filename}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
