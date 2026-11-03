import { z } from "zod";


export const VISUALIZATION_TYPES = [
  "pointer-memory",
  "slice-memory",
  "array-memory",
  "goroutine-flow",
  "channel-flow",
  "mutex-lock",
  "execution-flow",
  "concept-map",
  "timeline",
  "comparison",
  "concept_map",
  "architecture",
  "flowchart",
  "sequence_diagram",
  "memory_diagram",
  "execution_trace",
  "concurrency_diagram",
  "data_structure",
  "state_machine",
  "interactive_flow",
] as const;

export const visualizationTypeEnum = z.enum(VISUALIZATION_TYPES);
export type VisualizationType = z.infer<typeof visualizationTypeEnum>;

export const BLOCK_TYPES = [
  "rich_text",
  "divider",
  "image",
  "media",
  "code",
  "code_playground",
  "visualization",
  "comparison",
  "callout",
  "step_sequence",
  "table",
  "timeline",
  "flowchart",
  "quiz",
  "knowledge_check",
  "exercise",
  "reflection",
  "challenge",
] as const;

export const blockTypeEnum = z.enum(BLOCK_TYPES);
export type LessonBlockType = z.infer<typeof blockTypeEnum>;

/* ------------------------------------------------------------------ */
/* rich_text                                                           */
/* ------------------------------------------------------------------ */

const inlineNodeSchema = z.object({
  text: z.string().max(2000),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  code: z.boolean().optional(),
  href: z.string().max(500).optional(),
});

const richTextNodeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    children: z.array(inlineNodeSchema).max(50),
  }),
  z.object({
    kind: z.literal("paragraph"),
    children: z.array(inlineNodeSchema).max(100),
  }),
  z.object({
    kind: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(z.array(inlineNodeSchema).max(50)).max(50),
  }),
  // Flattened list authoring: one child = one bullet / number.
  z.object({
    kind: z.literal("bullet_list"),
    children: z.array(inlineNodeSchema).max(100),
  }),
  z.object({
    kind: z.literal("numbered_list"),
    children: z.array(inlineNodeSchema).max(100),
  }),
  // Inline callout (note / emphasis block) authored within rich text.
  z.object({
    kind: z.literal("callout"),
    tone: z
      .enum(["info", "tip", "warning", "important", "common_mistake"])
      .default("info"),
    title: z.string().max(200).optional(),
    children: z.array(inlineNodeSchema).max(50),
  }),
]);

export const richTextBlockSchema = z.object({
  type: z.literal("rich_text"),
  content: z.object({
    nodes: z.array(richTextNodeSchema).min(1).max(100),
  }),
});

/* ------------------------------------------------------------------ */
/* image                                                               */
/* ------------------------------------------------------------------ */

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  content: z.object({
    src: z.string().min(1).max(1000),
    alt: z.string().max(300).default(""),
    caption: z.string().max(500).optional(),
    width: z.enum(["sm", "md", "lg", "full"]).default("md"),
    aspectRatio: z.string().max(20).optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* media (video / audio)                                               */
/* ------------------------------------------------------------------ */

export const mediaBlockSchema = z.object({
  type: z.literal("media"),
  content: z.object({
    // Video or audio file URL (e.g. from the Upload module or any CDN).
    src: z.string().min(1).max(1000),
    mediaType: z.enum(["video", "audio"]).default("video"),
    // Poster frame for video blocks.
    poster: z.string().max(1000).optional(),
    caption: z.string().max(500).optional(),
    // Subtitle track (WebVTT) for video blocks.
    subtitles: z.string().max(1000).optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* code                                                                */
/* ------------------------------------------------------------------ */

export const codeBlockSchema = z.object({
  type: z.literal("code"),
  content: z.object({
    language: z.string().min(1).max(30).default("go"),
    source: z.string().min(1).max(20000),
    filename: z.string().max(200).optional(),
    highlightLines: z.array(z.number().int().min(1)).max(100).default([]),
    explanation: z.string().max(3000).optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* code_playground                                                     */
/* ------------------------------------------------------------------ */

export const codePlaygroundBlockSchema = z.object({
  type: z.literal("code_playground"),
  content: z.object({
    language: z.string().min(1).max(30).default("go"),
    starterCode: z.string().min(1).max(20000),
    expectedOutput: z.string().max(5000).optional(),
    instructions: z.string().max(3000).optional(),
    executionConfig: z
      .object({
        entrypoint: z.string().max(200).optional(),
        timeoutMs: z.number().int().min(100).max(30000).optional(),
      })
      .optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* visualization                                                       */
/* ------------------------------------------------------------------ */

const vizStepSchema = z.object({
  title: z.string().min(1).max(200),
  explanation: z.string().max(2000).optional(),
});

export const visualizationBlockSchema = z.object({
  type: z.literal("visualization"),
  content: z.object({
    visualizationType: visualizationTypeEnum,
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    config: z.record(z.string(), z.unknown()).default({}),
    steps: z.array(vizStepSchema).max(50).optional(),
    takeaway: z.string().max(1000).optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* comparison                                                          */
/* ------------------------------------------------------------------ */

export const comparisonBlockSchema = z.object({
  type: z.literal("comparison"),
  content: z.object({
    title: z.string().max(200).optional(),
    sides: z
      .array(
        z.object({
          title: z.string().min(1).max(200),
          description: z.string().max(2000).optional(),
          advantages: z.array(z.string().max(500)).max(10).default([]),
          disadvantages: z.array(z.string().max(500)).max(10).default([]),
          example: z.string().max(5000).optional(),
        }),
      )
      .min(2)
      .max(3),
  }),
});

/* ------------------------------------------------------------------ */
/* callout                                                             */
/* ------------------------------------------------------------------ */

export const calloutBlockSchema = z.object({
  type: z.literal("callout"),
  content: z.object({
    tone: z
      .enum(["info", "tip", "warning", "important", "common_mistake"])
      .default("info"),
    title: z.string().max(200).optional(),
    text: z.string().min(1).max(3000),
  }),
});

/* ------------------------------------------------------------------ */
/* step_sequence                                                       */
/* ------------------------------------------------------------------ */

export const stepSequenceBlockSchema = z.object({
  type: z.literal("step_sequence"),
  content: z.object({
    title: z.string().max(200).optional(),
    steps: z
      .array(
        z.object({
          title: z.string().min(1).max(200),
          explanation: z.string().max(3000).optional(),
          code: z.string().max(10000).optional(),
          illustration: z.string().max(1000).optional(),
          visualizationState: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .min(1)
      .max(20),
  }),
});

/* ------------------------------------------------------------------ */
/* quiz                                                                */
/* ------------------------------------------------------------------ */

export const quizQuestionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("multiple_choice"),
    id: z.string().min(1).max(100),
    prompt: z.string().min(1).max(3000),
    choices: z
      .array(z.object({ id: z.string().min(1).max(100), label: z.string().max(1000) }))
      .min(2)
      .max(8),
    correctChoiceId: z.string().min(1).max(100),
    explanation: z.string().max(3000).optional(),
  }),
  z.object({
    kind: z.literal("true_false"),
    id: z.string().min(1).max(100),
    prompt: z.string().min(1).max(3000),
    correctAnswer: z.boolean(),
    explanation: z.string().max(3000).optional(),
  }),
  z.object({
    kind: z.literal("predict_output"),
    id: z.string().min(1).max(100),
    prompt: z.string().min(1).max(3000),
    code: z.string().max(10000).optional(),
    correctAnswer: z.string().min(1).max(3000),
    explanation: z.string().max(3000).optional(),
  }),
]);

export const quizBlockSchema = z.object({
  type: z.literal("quiz"),
  content: z.object({
    title: z.string().max(200).optional(),
    questions: z.array(quizQuestionSchema).min(1).max(20),
    xpReward: z.number().int().min(0).max(1000).default(0),
  }),
});

/* ------------------------------------------------------------------ */
/* challenge                                                           */
/* ------------------------------------------------------------------ */

export const challengeBlockSchema = z.object({
  type: z.literal("challenge"),
  content: z.object({
    title: z.string().min(1).max(200),
    statement: z.string().min(1).max(10000),
    instructions: z.array(z.string().max(1000)).max(20).default([]),
    starterCode: z.string().max(20000).default(""),
    requirements: z.array(z.string().max(1000)).max(20).default([]),
    testConfig: z
      .object({
        language: z.string().max(30).default("go"),
        runCommand: z.string().max(300).optional(),
        cases: z
          .array(
            z.object({
              name: z.string().max(200),
              input: z.string().max(5000).optional(),
              expected: z.string().max(5000).optional(),
            }),
          )
          .max(20)
          .optional(),
      })
      .optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
    xpReward: z.number().int().min(0).max(1000).default(0),
    problemId: z.number().int().nullable().optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* Union                                                               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* divider                                                             */
/* ------------------------------------------------------------------ */

export const dividerBlockSchema = z.object({
  type: z.literal("divider"),
  content: z.object({
    style: z.enum(["line", "dashed", "dotted", "space"]).default("line"),
    caption: z.string().max(200).optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* table                                                               */
/* ------------------------------------------------------------------ */

export const tableBlockSchema = z.object({
  type: z.literal("table"),
  content: z.object({
    caption: z.string().max(500).optional(),
    headers: z.array(z.string().min(1).max(100)).min(1).max(10),
    rows: z
      .array(z.array(z.string().max(500)).max(10))
      .min(1)
      .max(200),
  }),
});

/* ------------------------------------------------------------------ */
/* timeline (standalone block)                                         */
/* ------------------------------------------------------------------ */

export const timelineEventSchema = z.object({
  when: z.string().min(1).max(60).optional(),
  year: z.string().min(1).max(60).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

export const timelineBlockSchema = z.object({
  type: z.literal("timeline"),
  content: z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    events: z.array(timelineEventSchema).min(1).max(50),
  }),
});

/* ------------------------------------------------------------------ */
/* flowchart (standalone block) — same node/edge grammar as the        */
/* flowchart visualization type                                        */
/* ------------------------------------------------------------------ */

export const graphNodeSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  layer: z.number().int().min(0).max(20).optional(),
  shape: z.enum(["box", "decision", "start", "end"]).default("box"),
});

export const graphEdgeSchema = z.object({
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
  label: z.string().max(100).optional(),
  dashed: z.boolean().default(false),
});

export const flowchartBlockSchema = z.object({
  type: z.literal("flowchart"),
  content: z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
    takeaway: z.string().max(1000).optional(),
    nodes: z.array(graphNodeSchema).min(1).max(60),
    edges: z.array(graphEdgeSchema).max(120).default([]),
  }),
});

/* ------------------------------------------------------------------ */
/* knowledge_check — same question grammar as quiz, but self-graded    */
/* in the browser (no XP, no server roundtrip)                         */
/* ------------------------------------------------------------------ */

export const knowledgeCheckBlockSchema = z.object({
  type: z.literal("knowledge_check"),
  content: z.object({
    title: z.string().max(200).optional(),
    questions: z.array(quizQuestionSchema).min(1).max(20),
  }),
});

/* ------------------------------------------------------------------ */
/* exercise — ungraded practice with progressive hints                 */
/* ------------------------------------------------------------------ */

export const exerciseBlockSchema = z.object({
  type: z.literal("exercise"),
  content: z.object({
    title: z.string().min(1).max(200).optional(),
    prompt: z.string().min(1).max(5000),
    language: z.string().min(1).max(30).default("go"),
    starterCode: z.string().max(20000).default(""),
    hints: z.array(z.string().max(1000)).max(10).default([]),
    solution: z.string().max(20000).optional(),
  }),
});

/* ------------------------------------------------------------------ */
/* reflection — written-response prompt, stored on the client only     */
/* ------------------------------------------------------------------ */

export const reflectionBlockSchema = z.object({
  type: z.literal("reflection"),
  content: z.object({
    title: z.string().max(200).optional(),
    prompt: z.string().min(1).max(5000),
    guidance: z.array(z.string().max(1000)).max(10).default([]),
    placeholder: z.string().max(300).optional(),
  }),
});

export const lessonBlockSchema = z.discriminatedUnion("type", [
  richTextBlockSchema,
  imageBlockSchema,
  mediaBlockSchema,
  codeBlockSchema,
  codePlaygroundBlockSchema,
  visualizationBlockSchema,
  comparisonBlockSchema,
  calloutBlockSchema,
  stepSequenceBlockSchema,
  quizBlockSchema,
  challengeBlockSchema,
  dividerBlockSchema,
  tableBlockSchema,
  timelineBlockSchema,
  flowchartBlockSchema,
  knowledgeCheckBlockSchema,
  exerciseBlockSchema,
  reflectionBlockSchema,
]);

export type LessonBlockPayload = z.infer<typeof lessonBlockSchema>;
export type RichTextBlock = z.infer<typeof richTextBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type MediaBlock = z.infer<typeof mediaBlockSchema>;
export type CodeBlockPayload = z.infer<typeof codeBlockSchema>;
export type CodePlaygroundBlock = z.infer<typeof codePlaygroundBlockSchema>;
export type VisualizationBlock = z.infer<typeof visualizationBlockSchema>;
export type ComparisonBlock = z.infer<typeof comparisonBlockSchema>;
export type CalloutBlock = z.infer<typeof calloutBlockSchema>;
export type StepSequenceBlock = z.infer<typeof stepSequenceBlockSchema>;
export type QuizBlock = z.infer<typeof quizBlockSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type ChallengeBlock = z.infer<typeof challengeBlockSchema>;
export type DividerBlock = z.infer<typeof dividerBlockSchema>;
export type TableBlock = z.infer<typeof tableBlockSchema>;
export type TimelineBlock = z.infer<typeof timelineBlockSchema>;
export type FlowchartBlock = z.infer<typeof flowchartBlockSchema>;
export type KnowledgeCheckBlock = z.infer<typeof knowledgeCheckBlockSchema>;
export type ExerciseBlock = z.infer<typeof exerciseBlockSchema>;
export type ReflectionBlock = z.infer<typeof reflectionBlockSchema>;

/** Parse block content; returns null instead of throwing for renderer safety. */
export function parseLessonBlock(
  type: string,
  content: unknown,
): LessonBlockPayload | null {
  const result = lessonBlockSchema.safeParse({ type, content });
  return result.success ? result.data : null;
}

/** Strip correct answers/explanation — used for learner-facing payloads. */
export function sanitizeQuizForLearner(block: LessonBlockPayload): LessonBlockPayload {
  if (block.type !== "quiz") return block;
  return {
    ...block,
    content: {
      ...block.content,
      questions: block.content.questions.map((q:any) => {
        if (q.kind === "multiple_choice") {
          const { correctChoiceId: _c, explanation: _e, ...rest } = q;
          return rest as typeof q;
        }
        if (q.kind === "true_false") {
          const { correctAnswer: _a, explanation: _e, ...rest } = q;
          return rest as typeof q;
        }
        const { correctAnswer: _a, explanation: _e, ...rest } = q;
        return rest as typeof q;
      }),
    },
  };
}
