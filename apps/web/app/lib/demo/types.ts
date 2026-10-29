/* ------------------------------------------------------------------ */
/* Demo data model. Everything in app/lib/demo is clearly isolated    */
/* sample data — it is NOT connected to the GoCraft API.               */
/* Client-side mutations live in app/lib/store/demo.ts (localStorage)  */
/* and are labeled as demo wherever they surface in the UI.            */
/* ------------------------------------------------------------------ */

export type Difficulty = "Easy" | "Medium" | "Hard";

export type QuizChoice = { id: string; label: string };
export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
};

export type LessonSection = {
  heading?: string;
  paragraphs?: string[];
  code?: { filename?: string; source: string };
  callout?: { tone: "info" | "tip" | "warning"; text: string };
};

export type LessonStatus = "ready" | "outline";

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  xp: number;
  status: LessonStatus;
  summary: string;
  sections?: LessonSection[];
  quiz?: QuizQuestion[];
};

export type CourseModule = {
  id: string;
  order: number;
  title: string;
  objective: string;
  icon: "rocket" | "variable" | "box" | "branch" | "function" | "layers" | "component" | "puzzle" | "alert" | "thread" | "network" | "server" | "flask";
  prerequisites: string[];
  lessons: Lesson[];
};

export type CurriculumModule = CourseModule;

export type ProblemExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type ProblemTestCase = {
  name: string;
  input: string;
  expected: string;
};

export type Problem = {
  /** Route id — same as slug. */
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  /** Primary topic for list views. */
  topic: string;
  topics: string[];
  tags: string[];
  xp: number;
  estMinutes: number;
  minutes: number;
  acceptance: number;
  summary: string;
  description: string[];
  examples: ProblemExample[];
  constraints: string[];
  signature: { filename: string; source: string };
  /** Alias of signature.source for detail pages. */
  functionSignature: string;
  starterCode: string;
  testCases: ProblemTestCase[];
  related: string[];
};

export type DemoUser = {
  handle: string;
  name: string;
  bio: string;
  avatarTone: "slate" | "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "teal";
  level: number;
  xp: number;
  streakDays: number;
  solved: number;
  lessonsDone: number;
  online: boolean;
  lastActive: string;
  isSelf?: boolean;
};

export type FriendRequest = {
  id: string;
  handle: string;
  direction: "incoming" | "outgoing";
  sentAt: string;
};

export type FriendActivity = {
  id: string;
  handle: string;
  action: string;
  detail: string;
  at: string;
  xp?: number;
};

export type MarketCategory = "themes" | "avatars" | "stickers" | "badges";

export type MarketItem = {
  id: string;
  name: string;
  category: MarketCategory;
  price: number;
  description: string;
  accent?: "graphite" | "indigo" | "emerald" | "amber" | "rose";
  swatch?: string[];
  tone?: DemoUser["avatarTone"];
  icon?: string;
  free?: boolean;
};

export type ActivityEvent = {
  id: string;
  kind: "lesson" | "problem" | "achievement" | "purchase";
  title: string;
  detail: string;
  at: string;
  xp?: number;
};

export type ActorActivity = {
  id: string;
  actorName: string;
  initials: string;
  color: string;
  action: string;
  target: string;
  href: string;
  time: string;
  xp?: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  at: string;
  unread: boolean;
};
