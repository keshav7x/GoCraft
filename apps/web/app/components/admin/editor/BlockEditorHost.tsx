"use client";

import { BLOCK_CATEGORIES, BLOCK_META, type Block, type BlockCategory, type BlockType } from "@/app/lib/admin/types";
import {
  BulletedListEditor,
  CalloutBlockEditor,
  DividerBlockEditor,
  HeadingBlockEditor,
  NumberedListEditor,
  ParagraphBlockEditor,
  QuoteBlockEditor,
} from "./blocks/TextBlockEditor";
import { CodeBlockEditor } from "./blocks/CodeBlockEditor";
import { ImageBlockEditor } from "./blocks/ImageBlockEditor";
import {
  DiagramBlockEditor,
  StepByStepBlockEditor,
  VideoEmbedBlockEditor,
  VisualExplanationBlockEditor,
} from "./blocks/VisualBlockEditor";
import {
  CodingChallengeBlockEditor,
  ExerciseBlockEditor,
  FillBlanksBlockEditor,
  PredictOutputBlockEditor,
} from "./blocks/ExerciseBlockEditor";
import { QuizBlockEditor } from "./blocks/QuizBlockEditor";
import {
  FileStructureBlockEditor,
  HintBlockEditor,
  SolutionExplanationBlockEditor,
  TerminalOutputBlockEditor,
} from "./blocks/MiscBlockEditor";

type BlockEditorHostProps = {
  block: Block;
  update: (patch: Record<string, unknown>) => void;
  onTypeChange: (type: BlockType) => void;
};

export function BlockEditorHost({ block, update, onTypeChange }: BlockEditorHostProps) {
  const meta = BLOCK_META[block.type];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4">
          <span aria-hidden="true">{meta.icon}</span>
          {meta.label}
        </span>
        <select
          aria-label="Change block type"
          value={block.type}
          onChange={(event) => onTypeChange(event.target.value as BlockType)}
          className="focus-ring h-7 cursor-pointer rounded-lg border border-line bg-panel px-2 text-[11px] font-medium text-ink-2 transition hover:border-edge-strong"
        >
          {(Object.keys(BLOCK_CATEGORIES) as BlockCategory[]).map((category) => (
            <optgroup key={category} label={category}>
              {BLOCK_CATEGORIES[category].map((type) => (
                <option key={type} value={type}>
                  {BLOCK_META[type].label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <BlockTypeEditor block={block} update={update} />
    </div>
  );
}

function BlockTypeEditor({
  block,
  update,
}: {
  block: Block;
  update: (patch: Record<string, unknown>) => void;
}) {
  switch (block.type) {
    case "heading1":
      return (
        <HeadingBlockEditor level={1} data={block.data} onChange={(p) => update(p)} />
      );
    case "heading2":
      return (
        <HeadingBlockEditor level={2} data={block.data} onChange={(p) => update(p)} />
      );
    case "heading3":
      return (
        <HeadingBlockEditor level={3} data={block.data} onChange={(p) => update(p)} />
      );
    case "paragraph":
      return <ParagraphBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "bulletedList":
      return <BulletedListEditor data={block.data} onChange={(p) => update(p)} />;
    case "numberedList":
      return <NumberedListEditor data={block.data} onChange={(p) => update(p)} />;
    case "quote":
      return <QuoteBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "callout":
      return <CalloutBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "divider":
      return <DividerBlockEditor />;
    case "code":
      return <CodeBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "terminalOutput":
      return <TerminalOutputBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "fileStructure":
      return <FileStructureBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "exercise":
      return <ExerciseBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "image":
      return <ImageBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "diagram":
      return <DiagramBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "visualExplanation":
      return <VisualExplanationBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "stepByStep":
      return <StepByStepBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "videoEmbed":
      return <VideoEmbedBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "quiz":
      return <QuizBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "predictOutput":
      return <PredictOutputBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "fillBlanks":
      return <FillBlanksBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "codingChallenge":
      return <CodingChallengeBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "hint":
      return <HintBlockEditor data={block.data} onChange={(p) => update(p)} />;
    case "solutionExplanation":
      return <SolutionExplanationBlockEditor data={block.data} onChange={(p) => update(p)} />;
    default:
      return null;
  }
}
