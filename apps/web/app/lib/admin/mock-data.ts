import {
  createBlock,
  uid,
  type AdminUser,
  type Block,
  type Lesson,
  type MediaAsset,
  type Module,
} from "./types";

function placeholderSvg(label: string, from: string, to: string, w = 960, h = 600) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w * 0.82}" cy="${h * 0.24}" r="${h * 0.22}" fill="rgba(255,255,255,0.12)"/><circle cx="${w * 0.18}" cy="${h * 0.78}" r="${h * 0.3}" fill="rgba(0,0,0,0.08)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${Math.round(h / 12)}" font-weight="600" fill="rgba(255,255,255,0.92)">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SEED_MEDIA: MediaAsset[] = [
  {
    id: "media_goroutine",
    name: "goroutine-scheduler.svg",
    url: placeholderSvg("Goroutine Scheduler", "#0f7a55", "#34c48f"),
    size: 24_800,
    type: "image/svg+xml",
    alt: "Diagram of the Go runtime goroutine scheduler",
    uploadedAt: "2026-10-12T09:20:00.000Z",
  },
  {
    id: "media_memory",
    name: "memory-layout.svg",
    url: placeholderSvg("Memory Layout", "#0d84b6", "#1fa1d1"),
    size: 19_200,
    type: "image/svg+xml",
    alt: "Stack and heap memory layout illustration",
    uploadedAt: "2026-10-14T11:05:00.000Z",
  },
  {
    id: "media_channels",
    name: "channel-pipeline.svg",
    url: placeholderSvg("Channel Pipeline", "#16845b", "#7ed9b4"),
    size: 22_400,
    type: "image/svg+xml",
    alt: "Producer and consumer connected through a channel",
    uploadedAt: "2026-10-18T15:42:00.000Z",
  },
  {
    id: "media_cover_basics",
    name: "cover-go-basics.svg",
    url: placeholderSvg("Go Basics", "#0a5c40", "#34c48f", 1200, 675),
    size: 31_600,
    type: "image/svg+xml",
    alt: "Course cover for Go basics",
    uploadedAt: "2026-10-02T08:00:00.000Z",
  },
  {
    id: "cover_concurrency",
    name: "cover-concurrency.svg",
    url: placeholderSvg("Concurrency", "#144a65", "#0d84b6", 1200, 675),
    size: 29_100,
    type: "image/svg+xml",
    alt: "Course cover for Go concurrency",
    uploadedAt: "2026-10-05T10:30:00.000Z",
  },
  {
    id: "cover_error_handling",
    name: "cover-error-handling.svg",
    url: placeholderSvg("Error Handling", "#9a6700", "#e0a82e", 1200, 675),
    size: 27_800,
    type: "image/svg+xml",
    alt: "Course cover for Go error handling",
    uploadedAt: "2026-10-08T13:15:00.000Z",
  },
  {
    id: "media_stack_frame",
    name: "stack-frame.svg",
    url: placeholderSvg("Stack Frame", "#3d4454", "#6b7385"),
    size: 15_300,
    type: "image/svg+xml",
    alt: "Anatomy of a stack frame",
    uploadedAt: "2026-10-20T16:00:00.000Z",
  },
  {
    id: "media_defer_flow",
    name: "defer-execution-flow.svg",
    url: placeholderSvg("Defer Flow", "#c1342c", "#f0685f"),
    size: 18_900,
    type: "image/svg+xml",
    alt: "Deferred call execution order",
    uploadedAt: "2026-10-22T09:45:00.000Z",
  },
];

function block(partial: Block): Block {
  return partial;
}

const lesson1Blocks: Block[] = [
  block({
    id: "blk_l1_1",
    type: "paragraph",
    data: {
      text: "Goroutines are the backbone of concurrency in Go. Unlike OS threads, they are scheduled by the Go runtime, which makes starting thousands of them surprisingly cheap.",
    },
  }),
  block({
    id: "blk_l1_2",
    type: "heading2",
    data: { text: "Spawning a goroutine" },
  }),
  block({
    id: "blk_l1_3",
    type: "code",
    data: {
      language: "go",
      code: 'package main\n\nimport (\n    "fmt"\n    "time"\n)\n\nfunc main() {\n    go func() {\n        fmt.Println("hello from a goroutine")\n    }()\n\n    time.Sleep(100 * time.Millisecond)\n}',
      explanation:
        "The go keyword starts a new goroutine. The main function returns as soon as it finishes, so we sleep briefly to let the spawned goroutine print.",
      expectedOutput: "hello from a goroutine",
      highlightLines: "6",
    },
  }),
  block({
    id: "blk_l1_4",
    type: "image",
    data: {
      mediaId: "media_goroutine",
      src: SEED_MEDIA[0]!.url,
      caption: "The runtime multiplexes goroutines onto OS threads.",
      alt: "Goroutine scheduler mapping many goroutines onto fewer OS threads",
      alignment: "center",
      width: "lg",
    },
  }),
  block({
    id: "blk_l1_5",
    type: "visualExplanation",
    data: {
      mediaId: "media_channels",
      src: SEED_MEDIA[2]!.url,
      title: "How a channel connects goroutines",
      explanation:
        "A channel is a typed conduit. The producer goroutine sends values, the consumer receives them, and the runtime blocks either side until the other is ready — no locks required.",
      annotations: [
        { id: "an_1", label: "Producer", note: "Calls ch <- value to send" },
        { id: "an_2", label: "Channel", note: "Buffers or synchronizes delivery" },
        { id: "an_3", label: "Consumer", note: "Calls <-ch to receive" },
      ],
    },
  }),
  block({
    id: "blk_l1_6",
    type: "callout",
    data: {
      tone: "info",
      title: "Keep it simple",
      text: "Prefer channels over shared memory. If you must share memory, share as little as possible and protect it with a mutex.",
    },
  }),
  block({
    id: "blk_l1_7",
    type: "exercise",
    data: {
      statement:
        "Write a function that launches two goroutines. Each one sends its name into a channel. Collect both names from the channel and return them as a slice.",
      difficulty: "beginner",
      language: "go",
      starterCode: "func gatherNames(names ...string) []string {\n    // your code here\n}",
      examples: [
        { id: "ex_1", input: 'gatherNames("ada", "linus")', output: '["ada", "linus"] (any order)' },
        { id: "ex_2", input: "gatherNames()", output: "[]" },
      ],
      hints: ["Make a channel with make(chan string).", "Launch one goroutine per name with a for loop."],
      solutionExplanation:
        "Create an unbuffered channel, start one goroutine per name that sends into it, then receive len(names) times in a loop.",
    },
  }),
];

const lesson2Blocks: Block[] = [
  block({ id: "blk_l2_1", type: "heading1", data: { text: "Why channels?" } }),
  block({
    id: "blk_l2_2",
    type: "paragraph",
    data: {
      text: "Channels give goroutines a safe way to exchange data. They encode the 'don't communicate by sharing memory; share memory by communicating' philosophy at the language level.",
    },
  }),
  block({
    id: "blk_l2_3",
    type: "code",
    data: {
      language: "go",
      code: 'ch := make(chan int, 2)\nch <- 1\nch <- 2\nfmt.Println(<-ch)\nfmt.Println(<-ch)',
      explanation: "This buffered channel holds two values before the sender would block.",
      expectedOutput: "1\n2",
      highlightLines: "",
    },
  }),
  block({
    id: "blk_l2_4",
    type: "numberedList",
    data: { items: ["Unbuffered channels synchronize sender and receiver.", "Buffered channels allow a fixed queue.", "close(ch) signals that no more values will be sent."] },
  }),
];

const lesson3Blocks: Block[] = [
  block({
    id: "blk_l3_1",
    type: "paragraph",
    data: {
      text: "Let's check your understanding of goroutine scheduling and channel semantics before moving on.",
    },
  }),
  block({
    id: "blk_l3_2",
    type: "quiz",
    data: {
      question: "What happens when a goroutine sends on an unbuffered channel with no receiver ready?",
      choices: [
        { id: "ch_1", text: "The value is dropped" },
        { id: "ch_2", text: "The send blocks until a receiver is ready" },
        { id: "ch_3", text: "A compile-time error occurs" },
        { id: "ch_4", text: "The goroutine panics" },
      ],
      correctChoiceId: "ch_2",
      explanation:
        "Unbuffered channels hand off directly: the sender blocks until a receiver takes the value.",
    },
  }),
];

function makeLesson(partial: Omit<Lesson, "id" | "updatedAt" | "blocks" | "displayOrder" | "slug"> & { slug?: string; displayOrder?: number; blocks?: Block[] }): Lesson {
  return {
    id: partial.id,
    moduleId: partial.moduleId,
    title: partial.title,
    description: partial.description,
    slug: partial.slug ?? partial.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    estimatedDuration: partial.estimatedDuration,
    difficulty: partial.difficulty,
    displayOrder: partial.displayOrder ?? 1,
    status: partial.status,
    updatedAt: partial.updatedAt,
    blocks: partial.blocks ?? [createBlock("paragraph")],
  };
}

export const SEED_MODULES: Module[] = [
  {
    id: "mod_basics",
    title: "Go Basics",
    description:
      "Start from zero: variables, control flow, functions, and the data structures that make Go programs feel simple.",
    coverImage: SEED_MEDIA[3]!.url,
    coverImageId: "media_cover_basics",
    difficulty: "beginner",
    objectives: [
      "Declare variables and understand type inference",
      "Write functions with multiple return values",
      "Use slices, maps and structs confidently",
    ],
    estimatedDuration: 180,
    displayOrder: 1,
    status: "published",
    updatedAt: "2026-10-28T14:10:00.000Z",
    lessons: [
      makeLesson({
        id: "les_basics_1",
        moduleId: "mod_basics",
        title: "Hello, Go",
        description: "Your first program, the go run workflow, and how packages fit together.",
        slug: "hello-go",
        estimatedDuration: 25,
        difficulty: "beginner",
        displayOrder: 1,
        status: "published",
        updatedAt: "2026-10-26T10:00:00.000Z",
        blocks: [
          createBlock("heading1"),
          createBlock("paragraph"),
        ],
      }),
      makeLesson({
        id: "les_basics_2",
        moduleId: "mod_basics",
        title: "Variables and Types",
        description: "Short variable declaration, zero values, and when to reach for explicit types.",
        slug: "variables-and-types",
        estimatedDuration: 30,
        difficulty: "beginner",
        displayOrder: 2,
        status: "draft",
        updatedAt: "2026-10-29T16:30:00.000Z",
      }),
    ],
  },
  {
    id: "mod_concurrency",
    title: "Concurrency in Go",
    description:
      "Goroutines, channels, select, and the patterns that make concurrent Go readable and safe.",
    coverImage: SEED_MEDIA[4]!.url,
    coverImageId: "cover_concurrency",
    difficulty: "intermediate",
    objectives: [
      "Reason about goroutine scheduling",
      "Design channel-based pipelines",
      "Apply context for cancellation",
    ],
    estimatedDuration: 240,
    displayOrder: 2,
    status: "published",
    updatedAt: "2026-10-30T09:15:00.000Z",
    lessons: [
      makeLesson({
        id: "les_conc_1",
        moduleId: "mod_concurrency",
        title: "Goroutines and Channels",
        description: "Spawning work and connecting it with typed channels.",
        slug: "goroutines-and-channels",
        estimatedDuration: 40,
        difficulty: "intermediate",
        displayOrder: 1,
        status: "published",
        updatedAt: "2026-10-30T09:15:00.000Z",
        blocks: lesson1Blocks,
      }),
      makeLesson({
        id: "les_conc_2",
        moduleId: "mod_concurrency",
        title: "Select and Buffered Channels",
        description: "Waiting on multiple channels and tuning buffer sizes.",
        slug: "select-and-buffered-channels",
        estimatedDuration: 35,
        difficulty: "intermediate",
        displayOrder: 2,
        status: "published",
        updatedAt: "2026-10-29T11:20:00.000Z",
        blocks: lesson2Blocks,
      }),
      makeLesson({
        id: "les_conc_3",
        moduleId: "mod_concurrency",
        title: "Knowledge Check",
        description: "A short quiz to lock in channel semantics.",
        slug: "knowledge-check",
        estimatedDuration: 15,
        difficulty: "intermediate",
        displayOrder: 3,
        status: "draft",
        updatedAt: "2026-10-31T08:05:00.000Z",
        blocks: lesson3Blocks,
      }),
    ],
  },
  {
    id: "mod_errors",
    title: "Error Handling",
    description:
      "Errors as values: wrapping, inspecting, and designing APIs that fail loudly and clearly.",
    coverImage: SEED_MEDIA[5]!.url,
    coverImageId: "cover_error_handling",
    difficulty: "advanced",
    objectives: ["Wrap errors with context", "Inspect errors with errors.Is/As", "Design sentinel-free APIs"],
    estimatedDuration: 150,
    displayOrder: 3,
    status: "draft",
    updatedAt: "2026-10-31T12:40:00.000Z",
    lessons: [
      makeLesson({
        id: "les_err_1",
        moduleId: "mod_errors",
        title: "Errors as Values",
        description: "Why Go returns errors explicitly and how to propagate them.",
        slug: "errors-as-values",
        estimatedDuration: 35,
        difficulty: "advanced",
        displayOrder: 1,
        status: "draft",
        updatedAt: "2026-10-31T12:40:00.000Z",
      }),
    ],
  },
];

export const SEED_USERS: AdminUser[] = [
  {
    id: "usr_1",
    name: "Aisha Rahman",
    email: "aisha@example.com",
    registeredAt: "2026-08-14T10:00:00.000Z",
    lastActive: "2026-10-31T18:22:00.000Z",
    enrolledModules: ["Go Basics", "Concurrency in Go"],
    lessonsCompleted: 9,
    progress: 64,
    status: "active",
  },
  {
    id: "usr_2",
    name: "Bruno Silva",
    email: "bruno@example.com",
    registeredAt: "2026-09-02T09:30:00.000Z",
    lastActive: "2026-10-31T12:05:00.000Z",
    enrolledModules: ["Concurrency in Go"],
    lessonsCompleted: 4,
    progress: 38,
    status: "active",
  },
  {
    id: "usr_3",
    name: "Chen Wei",
    email: "chen@example.com",
    registeredAt: "2026-07-21T14:45:00.000Z",
    lastActive: "2026-10-30T20:11:00.000Z",
    enrolledModules: ["Go Basics", "Error Handling"],
    lessonsCompleted: 14,
    progress: 82,
    status: "active",
  },
  {
    id: "usr_4",
    name: "Dana Kowalski",
    email: "dana@example.com",
    registeredAt: "2026-10-18T08:15:00.000Z",
    lastActive: "2026-10-19T09:00:00.000Z",
    enrolledModules: ["Go Basics"],
    lessonsCompleted: 1,
    progress: 12,
    status: "suspended",
  },
  {
    id: "usr_5",
    name: "Elias Berg",
    email: "elias@example.com",
    registeredAt: "2026-10-28T16:00:00.000Z",
    lastActive: "2026-10-28T16:00:00.000Z",
    enrolledModules: [],
    lessonsCompleted: 0,
    progress: 0,
    status: "invited",
  },
];

export const ANALYTICS = {
  totals: {
    users: 1284,
    activeUsers: 462,
    enrollments: 2140,
    lessonsCompleted: 8931,
  },
  completionRate: 71,
  dailyActive: [
    { day: "Mon", users: 312 },
    { day: "Tue", users: 348 },
    { day: "Wed", users: 401 },
    { day: "Thu", users: 377 },
    { day: "Fri", users: 425 },
    { day: "Sat", users: 268 },
    { day: "Sun", users: 231 },
  ],
  enrollmentsOverTime: [
    { week: "W1", enrollments: 210 },
    { week: "W2", enrollments: 265 },
    { week: "W3", enrollments: 312 },
    { week: "W4", enrollments: 298 },
    { week: "W5", enrollments: 361 },
    { week: "W6", enrollments: 420 },
  ],
  popularModules: [
    { name: "Go Basics", enrollments: 842, completion: 76 },
    { name: "Concurrency in Go", enrollments: 613, completion: 58 },
    { name: "Error Handling", enrollments: 301, completion: 44 },
  ],
  popularLessons: [
    { name: "Hello, Go", module: "Go Basics", views: 913, completion: 88 },
    { name: "Goroutines and Channels", module: "Concurrency in Go", views: 702, completion: 71 },
    { name: "Variables and Types", module: "Go Basics", views: 654, completion: 69 },
    { name: "Select and Buffered Channels", module: "Concurrency in Go", views: 488, completion: 54 },
    { name: "Errors as Values", module: "Error Handling", views: 312, completion: 41 },
  ],
  activity: [
    { user: "Aisha Rahman", action: "Completed lesson", target: "Goroutines and Channels", at: "2h ago" },
    { user: "Chen Wei", action: "Completed lesson", target: "Errors as Values", at: "4h ago" },
    { user: "Bruno Silva", action: "Enrolled in", target: "Concurrency in Go", at: "6h ago" },
    { user: "Aisha Rahman", action: "Started module", target: "Error Handling", at: "1d ago" },
    { user: "Chen Wei", action: "Completed module", target: "Go Basics", at: "2d ago" },
  ],
};
