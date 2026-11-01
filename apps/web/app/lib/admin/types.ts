export type AdminDifficulty = "beginner" | "intermediate" | "advanced";

export type PublishStatus = "draft" | "published";

export type BlockType =
  // Text & formatting
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraph"
  | "bulletedList"
  | "numberedList"
  | "quote"
  | "callout"
  | "divider"
  // Programming
  | "code"
  | "terminalOutput"
  | "fileStructure"
  | "exercise"
  // Visual content
  | "image"
  | "diagram"
  | "visualExplanation"
  | "stepByStep"
  | "videoEmbed"
  // Assessment
  | "quiz"
  | "predictOutput"
  | "fillBlanks"
  | "codingChallenge"
  | "hint"
  | "solutionExplanation";

export type BlockCategory = "Text" | "Programming" | "Visual" | "Assessment";

export interface ExerciseExample {
  id: string;
  input: string;
  output: string;
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface VisualAnnotation {
  id: string;
  label: string;
  note: string;
}

export interface StepItem {
  id: string;
  title: string;
  description: string;
}

export interface BlockDataMap {
  heading1: { text: string };
  heading2: { text: string };
  heading3: { text: string };
  paragraph: { text: string; bold?: boolean; italic?: boolean };
  bulletedList: { items: string[] };
  numberedList: { items: string[] };
  quote: { text: string; attribution: string };
  callout: { tone: "info" | "success" | "warning" | "danger"; title: string; text: string };
  divider: Record<string, never>;

  code: {
    language: string;
    code: string;
    explanation: string;
    expectedOutput: string;
    highlightLines: string;
  };
  terminalOutput: { title: string; output: string };
  fileStructure: { title: string; tree: string };
  exercise: {
    statement: string;
    difficulty: AdminDifficulty;
    language: string;
    starterCode: string;
    examples: ExerciseExample[];
    hints: string[];
    solutionExplanation: string;
  };

  image: {
    mediaId: string | null;
    src: string | null;
    caption: string;
    alt: string;
    alignment: "left" | "center" | "right";
    width: "sm" | "md" | "lg" | "full";
  };
  diagram: {
    mediaId: string | null;
    src: string | null;
    title: string;
    alt: string;
  };
  visualExplanation: {
    mediaId: string | null;
    src: string | null;
    title: string;
    explanation: string;
    annotations: VisualAnnotation[];
  };
  stepByStep: { title: string; steps: StepItem[] };
  videoEmbed: { url: string; title: string };

  quiz: {
    question: string;
    choices: QuizChoice[];
    correctChoiceId: string | null;
    explanation: string;
  };
  predictOutput: { code: string; language: string; answer: string; explanation: string };
  fillBlanks: { text: string; answers: string[]; explanation: string };
  codingChallenge: {
    prompt: string;
    difficulty: AdminDifficulty;
    language: string;
    starterCode: string;
    criteria: string[];
  };
  hint: { text: string };
  solutionExplanation: { code: string; language: string; explanation: string };
}

export type Block = { id: string } & {
  [K in BlockType]: { type: K; data: BlockDataMap[K] };
}[BlockType];

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  slug: string;
  estimatedDuration: number;
  difficulty: AdminDifficulty;
  displayOrder: number;
  status: PublishStatus;
  updatedAt: string;
  blocks: Block[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  coverImageId: string | null;
  difficulty: AdminDifficulty;
  objectives: string[];
  estimatedDuration: number;
  displayOrder: number;
  status: PublishStatus;
  updatedAt: string;
  lessons: Lesson[];
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  alt: string;
  uploadedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  lastActive: string;
  enrolledModules: string[];
  lessonsCompleted: number;
  progress: number;
  status: "active" | "suspended" | "invited";
}

export type ModuleInput = Omit<
  Module,
  "id" | "updatedAt" | "lessons" | "coverImage" | "coverImageId"
> & { coverImageId: string | null };

export type LessonInput = Omit<
  Lesson,
  "id" | "moduleId" | "updatedAt" | "blocks" | "displayOrder"
> & { displayOrder?: number };

export const BLOCK_CATEGORIES: Record<BlockCategory, BlockType[]> = {
  Text: [
    "heading1",
    "heading2",
    "heading3",
    "paragraph",
    "bulletedList",
    "numberedList",
    "quote",
    "callout",
    "divider",
  ],
  Programming: ["code", "terminalOutput", "fileStructure", "exercise"],
  Visual: ["image", "diagram", "visualExplanation", "stepByStep", "videoEmbed"],
  Assessment: ["quiz", "predictOutput", "fillBlanks", "codingChallenge", "hint", "solutionExplanation"],
};

export const BLOCK_META: Record<
  BlockType,
  { label: string; description: string; category: BlockCategory; icon: string }
> = {
  heading1: { label: "Heading 1", description: "Large section title", category: "Text", icon: "H1" },
  heading2: { label: "Heading 2", description: "Medium section title", category: "Text", icon: "H2" },
  heading3: { label: "Heading 3", description: "Small section title", category: "Text", icon: "H3" },
  paragraph: { label: "Paragraph", description: "Plain body text", category: "Text", icon: "¶" },
  bulletedList: { label: "Bulleted list", description: "Unordered list of items", category: "Text", icon: "•" },
  numberedList: { label: "Numbered list", description: "Ordered list of items", category: "Text", icon: "1." },
  quote: { label: "Quote", description: "Highlighted quotation", category: "Text", icon: "”" },
  callout: { label: "Callout", description: "Note, tip or warning", category: "Text", icon: "!" },
  divider: { label: "Divider", description: "Horizontal separator", category: "Text", icon: "—" },
  code: { label: "Code snippet", description: "Code with explanation & output", category: "Programming", icon: "</>" },
  terminalOutput: { label: "Terminal output", description: "Command output block", category: "Programming", icon: ">_" },
  fileStructure: { label: "File structure", description: "Project tree visualization", category: "Programming", icon: "📁" },
  exercise: { label: "Coding exercise", description: "Interactive practice task", category: "Programming", icon: "⚙" },
  image: { label: "Image", description: "Image with caption & alt text", category: "Visual", icon: "🖼" },
  diagram: { label: "Diagram", description: "Illustrative diagram", category: "Visual", icon: "▦" },
  visualExplanation: { label: "Visual explanation", description: "Annotated visual walkthrough", category: "Visual", icon: "👁" },
  stepByStep: { label: "Step-by-step", description: "Sequential illustration", category: "Visual", icon: "☰" },
  videoEmbed: { label: "Video embed", description: "Embedded video lesson", category: "Visual", icon: "▶" },
  quiz: { label: "Quiz", description: "Multiple-choice question", category: "Assessment", icon: "✓" },
  predictOutput: { label: "Predict the output", description: "Guess what the code prints", category: "Assessment", icon: "?" },
  fillBlanks: { label: "Fill in the blanks", description: "Complete the missing parts", category: "Assessment", icon: "␣" },
  codingChallenge: { label: "Coding challenge", description: "Open-ended graded task", category: "Assessment", icon: "🏁" },
  hint: { label: "Hint", description: "Collapsible learner hint", category: "Assessment", icon: "💡" },
  solutionExplanation: { label: "Solution explanation", description: "Walkthrough of the solution", category: "Assessment", icon: "🔑" },
};

export const LANGUAGE_OPTIONS = [
  "go",
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "cpp",
  "rust",
  "bash",
  "json",
  "yaml",
  "plaintext",
] as const;

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function defaultBlockData(type: BlockType): BlockDataMap[BlockType] {
  switch (type) {
    case "heading1":
    case "heading2":
    case "heading3":
      return { text: "" };
    case "paragraph":
      return { text: "" };
    case "bulletedList":
    case "numberedList":
      return { items: [""] };
    case "quote":
      return { text: "", attribution: "" };
    case "callout":
      return { tone: "info", title: "Note", text: "" };
    case "divider":
      return {};
    case "code":
      return { language: "go", code: "", explanation: "", expectedOutput: "", highlightLines: "" };
    case "terminalOutput":
      return { title: "Terminal", output: "" };
    case "fileStructure":
      return { title: "Project layout", tree: "main.go\n└── package.json" };
    case "exercise":
      return {
        statement: "",
        difficulty: "beginner",
        language: "go",
        starterCode: "",
        examples: [{ id: uid("ex"), input: "", output: "" }],
        hints: [""],
        solutionExplanation: "",
      };
    case "image":
      return { mediaId: null, src: null, caption: "", alt: "", alignment: "center", width: "lg" };
    case "diagram":
      return { mediaId: null, src: null, title: "", alt: "" };
    case "visualExplanation":
      return {
        mediaId: null,
        src: null,
        title: "",
        explanation: "",
        annotations: [{ id: uid("an"), label: "", note: "" }],
      };
    case "stepByStep":
      return {
        title: "",
        steps: [{ id: uid("st"), title: "Step 1", description: "" }],
      };
    case "videoEmbed":
      return { url: "", title: "" };
    case "quiz":
      return {
        question: "",
        choices: [
          { id: uid("ch"), text: "" },
          { id: uid("ch"), text: "" },
        ],
        correctChoiceId: null,
        explanation: "",
      };
    case "predictOutput":
      return { code: "", language: "go", answer: "", explanation: "" };
    case "fillBlanks":
      return { text: "", answers: [""], explanation: "" };
    case "codingChallenge":
      return {
        prompt: "",
        difficulty: "beginner",
        language: "go",
        starterCode: "",
        criteria: [""],
      };
    case "hint":
      return { text: "" };
    case "solutionExplanation":
      return { code: "", language: "go", explanation: "" };
  }
}

export function createBlock(type: BlockType): Block {
  return { id: uid("blk"), type, data: defaultBlockData(type) } as Block;
}
