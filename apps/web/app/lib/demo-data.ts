/**
 * Demo data for the GoCraft UI.
 *
 * Everything in this file is sample content used to exercise the interface.
 * It is intentionally isolated from any real account or backend response.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export type LessonStatus = "completed" | "in-progress" | "available" | "locked";

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string; filename?: string }
  | { type: "callout"; tone: "info" | "tip"; text: string };

export type Quiz = {
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  xp: number;
  status: LessonStatus;
  objective: string;
  /** null = content still being authored; lesson page shows an honest empty state. */
  content: ContentBlock[] | null;
  quiz: Quiz | null;
};

export type LearningModule = {
  id: string;
  index: number;
  title: string;
  objective: string;
  prerequisites: string[];
  estimatedHours: number;
  lessons: Lesson[];
};

export function moduleProgress(module: LearningModule): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = module.lessons.length;
  const completed = module.lessons.filter((l) => l.status === "completed").length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function moduleStatus(module: LearningModule): LessonStatus {
  if (module.lessons.length === 0) return "available";
  const completed = module.lessons.filter((l) => l.status === "completed").length;
  if (completed === module.lessons.length) return "completed";
  if (module.lessons.some((l) => l.status === "in-progress")) return "in-progress";
  if (completed > 0) return "in-progress";
  if (module.lessons.some((l) => l.status === "locked")) return "locked";
  return "available";
}

function lesson(
  id: string,
  title: string,
  minutes: number,
  xp: number,
  status: LessonStatus,
  objective: string,
  content: ContentBlock[] | null = null,
  quiz: Quiz | null = null,
): Lesson {
  return { id, title, minutes, xp, status, objective, content, quiz };
}

/* ------------------------------------------------------------------ */
/* Curriculum                                                          */
/* ------------------------------------------------------------------ */

export const MODULES: LearningModule[] = [
  {
    id: "getting-started",
    index: 1,
    title: "Getting Started",
    objective: "Install the toolchain, run your first program, and understand how Go code is organized.",
    prerequisites: [],
    estimatedHours: 2,
    lessons: [
      lesson(
        "why-go",
        "Why Go",
        8,
        40,
        "completed",
        "Understand where Go fits and what makes it different.",
        [
          { type: "p", text: "Go was designed at Google to solve real infrastructure problems: slow builds, complex concurrency, and hard-to-deploy binaries. It trades a little expressiveness for a great deal of predictability." },
          { type: "h", text: "What you get" },
          { type: "list", items: [
            "A single static binary — no runtime to ship alongside your app.",
            "Fast compilation even on large codebases.",
            "Concurrency built into the language with goroutines and channels.",
            "A standard library strong enough to run production HTTP servers.",
            "Gofmt — one canonical formatting style, zero style debates.",
          ] },
          { type: "callout", tone: "tip", text: "Go is at its best for servers, CLIs, and developer tooling. If you are building a highly polymorphic domain model, languages with richer type hierarchies may serve you better." },
        ],
        {
          question: "Which property is Go's compile-and-deploy sweet spot?",
          options: [
            { id: "a", text: "Single static binaries with fast builds" },
            { id: "b", text: "Runtime JIT compilation" },
            { id: "c", text: "Dynamic module loading at runtime" },
          ],
          correctId: "a",
          explanation: "Go compiles to a single static binary, which makes deployment and distribution simple.",
        },
      ),
      lesson(
        "hello-world",
        "Hello, World",
        10,
        50,
        "completed",
        "Write and run your first Go program.",
        [
          { type: "p", text: "Every Go program lives in a package, and an executable program starts in package main with a function called main." },
          { type: "code", filename: "hello.go", code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"hello, gopher\")\n}" },
          { type: "p", text: "Run it with go run hello.go, or build a binary with go build. Notice there are no semicolons and no parentheses around the if conditions you will meet later — gofmt has one opinion and it is final." },
          { type: "callout", tone: "info", text: "Imports must be used. An unused import is a compile error, not a warning — Go refuses to ship dead weight." },
        ],
        {
          question: "What happens if you import a package and never use it?",
          options: [
            { id: "a", text: "A warning at compile time" },
            { id: "b", text: "A compile error" },
            { id: "c", text: "Nothing — it is tree-shaken away" },
          ],
          correctId: "b",
          explanation: "Unused imports fail compilation. This is deliberate: it keeps binaries lean and diffs clean.",
        },
      ),
      lesson(
        "toolchain",
        "The Toolchain",
        12,
        50,
        "in-progress",
        "Learn go run, go build, go test, and the module workflow.",
        [
          { type: "p", text: "The Go toolchain is one binary with a small number of verbs you will use daily." },
          { type: "list", items: [
            "go run . — compile and execute the package in the current directory.",
            "go build ./... — compile every package, surface errors, discard output.",
            "go test ./... — run tests; -race enables the race detector.",
            "go mod tidy — sync go.mod with the imports in your code.",
            "go vet ./... — static checks for suspicious constructs.",
          ] },
          { type: "code", filename: "terminal", code: "$ go mod init example.com/hello\ngo: creating new go.mod: module example.com/hello\n$ go run .\nhello, gopher" },
          { type: "callout", tone: "info", text: "A module is a versioned collection of packages described by go.mod. One binary, no package manager second-guessing you." },
        ],
        {
          question: "Which command runs a package's tests?",
          options: [
            { id: "a", text: "go test ./..." },
            { id: "b", text: "go run test" },
            { id: "c", text: "go make test" },
          ],
          correctId: "a",
          explanation: "go test ./... runs tests in the current module; add -race to check for data races.",
        },
      ),
      lesson(
        "packages",
        "Packages and Imports",
        10,
        50,
        "available",
        "Organize code into packages and control what you export.",
        [
          { type: "p", text: "A package is a folder of Go files sharing one package name. Exported identifiers start with an uppercase letter; everything else is private to the package." },
          { type: "code", filename: "greet/greet.go", code: "package greet\n\n// Greet is exported and usable from other packages.\nfunc Greet(name string) string {\n\treturn \"hello, \" + name\n}\n\n// greeting is private to this package.\nfunc greeting() string { return \"hello\"" },
          { type: "callout", tone: "tip", text: "Package names are short, lowercase, and singular: net/http, encoding/json — not utils or helpers." },
        ],
        null,
      ),
    ],
  },
  {
    id: "variables-constants",
    index: 2,
    title: "Variables and Constants",
    objective: "Declare state with var and const, understand zero values, and scope with short declarations.",
    prerequisites: ["getting-started"],
    estimatedHours: 2,
    lessons: [
      lesson(
        "declaring-variables",
        "Declaring Variables",
        10,
        50,
        "completed",
        "Use var, :=, and understand zero values.",
        [
          { type: "p", text: "There are three common ways to introduce a variable, and each one says something about intent." },
          { type: "code", filename: "vars.go", code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tvar count int        // zero value: 0\n\tvar name = \"gopher\"  // type inferred as string\n\ttotal := 42          // short declaration, only inside a function\n\n\tfmt.Println(count, name, total)\n}" },
          { type: "p", text: "Every type in Go has a zero value — 0 for numbers, \"\" for strings, false for bools, nil for slices, maps, pointers, and channels. There is no uninitialized memory." },
          { type: "callout", tone: "info", text: "var inside a function that is never assigned still works: it simply holds the zero value." },
        ],
        {
          question: "What is the zero value of an int declared with var x int?",
          options: [
            { id: "a", text: "nil" },
            { id: "b", text: "0" },
            { id: "c", text: "undefined" },
          ],
          correctId: "b",
          explanation: "Numeric types default to 0; strings to \"\"; bools to false; reference types to nil.",
        },
      ),
      lesson(
        "constants-iota",
        "Constants and iota",
        12,
        60,
        "available",
        "Declare immutable values and build enumerations with iota.",
        [
          { type: "p", text: "Constants are immutable at compile time. iota gives you a counting shorthand inside const blocks." },
          { type: "code", filename: "level.go", code: "package main\n\ntype Level uint8\n\nconst (\n\tLevelNovice Level = iota // 0\n\tLevelApprentice           // 1\n\tLevelExpert               // 2\n)\n\nconst Version = \"1.0.0\"" },
          { type: "callout", tone: "tip", text: "Typed constants are still flexible: a const declared as int can hold any int expression that fits — it is computed at compile time." },
        ],
        null,
      ),
      lesson(
        "scope",
        "Scope and Shadowing",
        10,
        50,
        "available",
        "Know where variables live and avoid accidental shadowing.",
        [
          { type: "p", text: "Short declarations create or reuse variables in the innermost block. Inside an if statement, a := variable exists only in that branch — including its else." },
          { type: "code", filename: "scope.go", code: "func demo() error {\n\tvar err error\n\tif v, err := fetch(); err != nil {\n\t\treturn err // the inner err\n\t} else {\n\t\t_ = v\n\t}\n\treturn err // the outer err — still nil\n}" },
          { type: "callout", tone: "info", text: "Shadowed error variables are a classic Go bug: check errors in the scope where they were assigned." },
        ],
        null,
      ),
    ],
  },
  {
    id: "data-types",
    index: 3,
    title: "Data Types",
    objective: "Work confidently with strings, numbers, and conversion rules.",
    prerequisites: ["variables-constants"],
    estimatedHours: 3,
    lessons: [
      lesson(
        "strings",
        "Strings and Runes",
        12,
        60,
        "available",
        "Iterate over bytes and runes without corrupting UTF-8.",
        [
          { type: "p", text: "A Go string is an immutable sequence of bytes, not a sequence of characters. When you range over a string you get runes — Unicode code points — decoded from UTF-8." },
          { type: "code", filename: "strings.go", code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\ts := \"gopher ✓\"\n\tfmt.Println(len(s))          // byte length\n\tfor i, r := range s {        // rune + byte index\n\t\tfmt.Printf(\"%d %c\\n\", i, r)\n\t}\n}" },
          { type: "callout", tone: "tip", text: "len(s) counts bytes. To count user-perceived characters, range over the string or use utf8.RuneCountInString." },
        ],
        {
          question: "What does len(s) return for a Go string?",
          options: [
            { id: "a", text: "Number of bytes" },
            { id: "b", text: "Number of runes" },
            { id: "c", text: "Number of graphemes" },
          ],
          correctId: "a",
          explanation: "Strings are byte slices; len reports byte length, which differs from rune count for non-ASCII text.",
        },
      ),
      lesson(
        "numbers",
        "Numbers and Conversions",
        10,
        50,
        "available",
        "Convert between numeric types deliberately.",
        [
          { type: "p", text: "Go never converts numeric types implicitly. x := int64(5) + 1 does not compile — you must write x := int64(5) + int64(1). The same rule applies to string ↔ bytes." },
          { type: "code", filename: "convert.go", code: "celsius := 21.5\nfahrenheit := celsius*9/5 + 32   // float64 math\naccount := int64(balance)         // explicit narrowing\ns := string(rune(0x2713))         // \"✓\"" },
        ],
        null,
      ),
      lesson(
        "zero-values",
        "Zero Values and Initialization",
        8,
        40,
        "available",
        "Predict what an uninitialized variable holds.",
        null,
        null,
      ),
    ],
  },
  {
    id: "control-flow",
    index: 4,
    title: "Control Flow",
    objective: "Use if, for, switch, and defer with Go's compact syntax.",
    prerequisites: ["data-types"],
    estimatedHours: 3,
    lessons: [
      lesson(
        "conditionals",
        "If and Switch",
        10,
        50,
        "available",
        "Write compact conditionals with init statements.",
        [
          { type: "p", text: "if and switch can carry an init statement — the idiomatic way to handle a value and its error in one expression." },
          { type: "code", filename: "flow.go", code: "if user, err := load(id); err != nil {\n\treturn fmt.Errorf(\"load %s: %w\", id, err)\n} else {\n\trender(user)\n}\n\nswitch status {\ncase 200, 204:\n\tok()\ncase 404:\n\tnotFound()\ndefault:\n\tunknown(status)\n}" },
          { type: "callout", tone: "info", text: "Go does not fall through. Cases are evaluated top-down and the first match wins; each case may be a comma-separated list." },
        ],
        {
          question: "What does Go's switch do if no case matches?",
          options: [
            { id: "a", text: "Runs the first case by default" },
            { id: "b", text: "Runs default, if present" },
            { id: "c", text: "Panics" },
          ],
          correctId: "b",
          explanation: "Without a matching case, default runs when present; otherwise the switch is a no-op.",
        },
      ),
      lesson(
        "for-loops",
        "The For Loop",
        12,
        60,
        "available",
        "Use Go's single loop construct in all its forms.",
        [
          { type: "p", text: "for is Go's only looping keyword. It has three forms: three-clause, condition-only, and range." },
          { type: "code", filename: "loops.go", code: "for i := 0; i < 3; i++ {     // three-clause\n\tfmt.Println(i)\n}\n\nfor retries < 5 {            // condition-only\n\tretries++\n}\n\nfor i, v := range items {    // range\n\tfmt.Println(i, v)\n}\n\nfor {                        // infinite — need break\n\tif done() { break }\n}" },
        ],
        null,
      ),
      lesson(
        "defer",
        "Defer and Panic/Recover",
        12,
        60,
        "available",
        "Schedule cleanup reliably and contain failures.",
        [
          { type: "p", text: "defer runs a function call when the surrounding function returns — arguments are evaluated immediately, execution is delayed. It is the standard tool for closing files and unlocking mutexes." },
          { type: "code", filename: "defer.go", code: "func read(path string) ([]byte, error) {\n\tf, err := os.Open(path)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdefer f.Close()\n\treturn io.ReadAll(f)\n}" },
          { type: "callout", tone: "tip", text: "defer runs LIFO: the last deferred call executes first. Keep defers close to the resource they release." },
        ],
        null,
      ),
    ],
  },
  {
    id: "functions",
    index: 5,
    title: "Functions",
    objective: "Master multiple returns, variadics, closures, and function values.",
    prerequisites: ["control-flow"],
    estimatedHours: 3,
    lessons: [
      lesson(
        "multiple-returns",
        "Multiple Returns",
        10,
        50,
        "available",
        "Return values and errors together — the Go way.",
        [
          { type: "p", text: "Go functions can return several values. The convention is (result, error), checked immediately at the call site." },
          { type: "code", filename: "parse.go", code: "func atoi(s string) (int, error) {\n\tn, err := strconv.Atoi(s)\n\tif err != nil {\n\t\treturn 0, fmt.Errorf(\"bad number %q: %w\", s, err)\n\t}\n\treturn n, nil\n}" },
        ],
        null,
      ),
      lesson(
        "variadic-closures",
        "Variadics, Closures, Methods",
        14,
        60,
        "available",
        "Write flexible call signatures and stateful closures.",
        [
          { type: "p", text: "A variadic parameter collects trailing arguments into a slice. Closures capture variables by reference — worth remembering when looping." },
          { type: "code", filename: "funcs.go", code: "func sum(nums ...int) int {\n\ttotal := 0\n\tfor _, n := range nums { total += n }\n\treturn total\n}\n\nfunc counter() func() int {\n\tn := 0\n\treturn func() int { n++; return n }\n}" },
        ],
        null,
      ),
    ],
  },
  {
    id: "arrays-slices-maps",
    index: 6,
    title: "Arrays, Slices, and Maps",
    objective: "Choose the right collection and understand how slices share memory.",
    prerequisites: ["functions"],
    estimatedHours: 4,
    lessons: [
      lesson(
        "slices",
        "Slices in Depth",
        14,
        70,
        "available",
        "Understand len, cap, append, and aliasing.",
        [
          { type: "p", text: "A slice is a lightweight descriptor: pointer, length, capacity. Appending beyond capacity reallocates and copies — otherwise you mutate the shared backing array." },
          { type: "code", filename: "slices.go", code: "base := []int{1, 2, 3}\nview := base[:2]        // len 2, cap 3\nview = append(view, 99) // fits in cap — overwrites base[2]!\nfmt.Println(base)       // [1 2 99]" },
          { type: "callout", tone: "info", text: "copy(dst, src) and slices.Clone exist for when you genuinely need independence. Aliasing bugs hide here." },
        ],
        {
          question: "When does append reallocate a slice's backing array?",
          options: [
            { id: "a", text: "Whenever len exceeds cap" },
            { id: "b", text: "On every call" },
            { id: "c", text: "Only when copying from another slice" },
          ],
          correctId: "a",
          explanation: "append reallocates only when capacity is exceeded; otherwise it writes in place.",
        },
      ),
      lesson(
        "maps",
        "Maps",
        12,
        60,
        "available",
        "Read, write, and safely iterate over maps.",
        [
          { type: "code", filename: "maps.go", code: "counts := make(map[string]int)\ncounts[\"go\"]++          // zero value makes this safe\n\nif v, ok := counts[\"rust\"]; ok {\n\tfmt.Println(v)\n}\n\nfor k, v := range counts { // order is randomized\n\tfmt.Println(k, v)\n}" },
          { type: "callout", tone: "tip", text: "Reading a missing key yields the zero value — that is a feature. Use the comma-ok form when absence matters." },
        ],
        null,
      ),
      lesson(
        "iteration-order",
        "Iteration Order and Deletes",
        8,
        40,
        "locked",
        "Know why map order is random and how deletes work.",
        null,
        null,
      ),
    ],
  },
  {
    id: "structs-methods",
    index: 7,
    title: "Structs and Methods",
    objective: "Model data with structs, attach methods, and control visibility.",
    prerequisites: ["arrays-slices-maps"],
    estimatedHours: 4,
    lessons: [
      lesson(
        "defining-structs",
        "Defining Structs",
        12,
        60,
        "locked",
        "Compose data with fields, tags, and embedding.",
        null,
        null,
      ),
      lesson(
        "value-receivers",
        "Value vs Pointer Receivers",
        14,
        70,
        "locked",
        "Choose receivers that match your mutation semantics.",
        null,
        null,
      ),
      lesson(
        "embedding",
        "Embedding and Composition",
        12,
        60,
        "locked",
        "Build reuse through composition instead of inheritance.",
        null,
        null,
      ),
    ],
  },
  {
    id: "interfaces",
    index: 8,
    title: "Interfaces",
    objective: "Design small interfaces and understand satisfaction by structure.",
    prerequisites: ["structs-methods"],
    estimatedHours: 4,
    lessons: [
      lesson(
        "implicit-satisfaction",
        "Implicit Satisfaction",
        12,
        60,
        "locked",
        "See how types satisfy interfaces without declarations.",
        null,
        null,
      ),
      lesson(
        "small-interfaces",
        "Designing Small Interfaces",
        12,
        60,
        "locked",
        "Prefer one-method interfaces that callers can fake.",
        null,
        null,
      ),
      lesson(
        "type-assertions",
        "Type Assertions and Switches",
        10,
        50,
        "locked",
        "Narrow interface values safely at runtime.",
        null,
        null,
      ),
    ],
  },
  {
    id: "errors",
    index: 9,
    title: "Errors",
    objective: "Create, wrap, and inspect errors as values.",
    prerequisites: ["interfaces"],
    estimatedHours: 3,
    lessons: [
      lesson(
        "error-values",
        "Errors as Values",
        10,
        50,
        "locked",
        "Treat errors like any other value.",
        null,
        null,
      ),
      lesson(
        "wrapping",
        "Wrapping with %w",
        12,
        60,
        "locked",
        "Preserve context and enable errors.Is / errors.As.",
        null,
        null,
      ),
      lesson(
        "sentinel-errors",
        "Sentinel and Typed Errors",
        10,
        50,
        "locked",
        "Know when a sentinel error is the right tool.",
        null,
        null,
      ),
    ],
  },
  {
    id: "goroutines-channels",
    index: 10,
    title: "Goroutines and Channels",
    objective: "Run work concurrently and coordinate it safely.",
    prerequisites: ["errors"],
    estimatedHours: 5,
    lessons: [
      lesson(
        "goroutines",
        "Goroutines",
        12,
        70,
        "locked",
        "Start concurrent work and shut it down cleanly.",
        null,
        null,
      ),
      lesson(
        "channels",
        "Channels",
        14,
        70,
        "locked",
        "Pass ownership of data between goroutines.",
        null,
        null,
      ),
      lesson(
        "select-timeout",
        "Select, Timeouts, and Cancellation",
        14,
        70,
        "locked",
        "Coordinate multiple channels with context.",
        null,
        null,
      ),
    ],
  },
  {
    id: "concurrency-patterns",
    index: 11,
    title: "Concurrency Patterns",
    objective: "Apply worker pools, fan-in/fan-out, and sync primitives correctly.",
    prerequisites: ["goroutines-channels"],
    estimatedHours: 5,
    lessons: [
      lesson("worker-pools", "Worker Pools", 15, 80, "locked", "Bound concurrency without starving the machine.", null, null),
      lesson("fan-in-out", "Fan-in / Fan-out", 14, 80, "locked", "Split and merge streams of work.", null, null),
      lesson("sync-primitives", "Mutexes and sync", 14, 80, "locked", "Know when a mutex beats a channel.", null, null),
      lesson("race-detector", "The Race Detector", 10, 60, "locked", "Catch data races in CI before users do.", null, null),
    ],
  },
  {
    id: "networking-http",
    index: 12,
    title: "Networking and HTTP",
    objective: "Serve and consume HTTP APIs with the standard library.",
    prerequisites: ["concurrency-patterns"],
    estimatedHours: 5,
    lessons: [
      lesson("http-servers", "HTTP Servers", 14, 70, "locked", "Register routes and write handlers that scale.", null, null),
      lesson("http-clients", "HTTP Clients and Timeouts", 12, 70, "locked", "Call external APIs without hanging your process.", null, null),
      lesson("json-apis", "JSON APIs and Validation", 14, 70, "locked", "Encode responses and validate request bodies.", null, null),
    ],
  },
  {
    id: "testing-tooling",
    index: 13,
    title: "Testing and Tooling",
    objective: "Write table-driven tests, use fuzzing, and keep quality in CI.",
    prerequisites: ["networking-http"],
    estimatedHours: 4,
    lessons: [
      lesson("table-tests", "Table-driven Tests", 12, 70, "locked", "Structure cases so new inputs are one line.", null, null),
      lesson("mocks-fakes", "Fakes over Mocks", 12, 70, "locked", "Test behavior through small interfaces.", null, null),
      lesson("fuzz-bench", "Fuzzing and Benchmarks", 12, 70, "locked", "Find edge cases and guard performance.", null, null),
    ],
  },
];

export const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
export const COMPLETED_LESSONS = MODULES.reduce(
  (sum, m) => sum + m.lessons.filter((l) => l.status === "completed").length,
  0,
);

export function findModule(moduleId: string): LearningModule | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function findLesson(moduleId: string, lessonId: string): Lesson | undefined {
  return findModule(moduleId)?.lessons.find((l) => l.id === lessonId);
}

/* ------------------------------------------------------------------ */
/* Profile / progress                                                  */
/* ------------------------------------------------------------------ */

export type DemoUser = {
  name: string;
  handle: string;
  initials: string;
  title: string;
  level: number;
  levelName: string;
  xp: number;
  xpIntoLevel: number;
  xpPerLevel: number;
  streakDays: number;
  longestStreak: number;
  solvedProblems: number;
  nextUnlock: { name: string; detail: string; percent: number };
};

export const CURRENT_USER: DemoUser = {
  name: "Kesha",
  handle: "@kesha",
  initials: "K",
  title: "Apprentice Gopher",
  level: 3,
  levelName: "Apprentice",
  xp: 840,
  xpIntoLevel: 240,
  xpPerLevel: 1000,
  streakDays: 7,
  longestStreak: 14,
  solvedProblems: 12,
  nextUnlock: {
    name: "Avatar: Byte the Gopher",
    detail: "Unlocks at Level 4",
    percent: 68,
  },
};

export type DailyQuest = {
  title: string;
  detail: string;
  progress: number;
  goal: number;
  xp: number;
  href: string;
  actionLabel: string;
};

export const DAILY_QUEST: DailyQuest = {
  title: "Solve 3 problems",
  detail: "Any topic. Difficulty doesn't matter — consistency does.",
  progress: 1,
  goal: 3,
  xp: 120,
  href: "/dashboard/problems",
  actionLabel: "Continue quest",
};

export type HeatmapCell = { date: string; level: 0 | 1 | 2 | 3 | 4 };

/** Deterministic 18-week activity heatmap (demo only). */
export function buildHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const today = new Date("2026-10-28");
  const start = new Date(today);
  start.setDate(start.getDate() - (18 * 7 - 1));

  for (let i = 0; i < 18 * 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const seed =
      (date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate() * 7) % 100;
    const recent = i >= 18 * 7 - 9;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (recent) level = seed < 15 ? 0 : seed < 45 ? 2 : seed < 75 ? 3 : 4;
    else level = seed < 55 ? 0 : seed < 75 ? 1 : seed < 90 ? 2 : 3;
    cells.push({ date: date.toISOString().slice(0, 10), level });
  }
  return cells;
}

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  xp: string;
  kind: "problem" | "lesson" | "achievement" | "purchase";
};

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", title: "Word Counter", detail: "Solved · Maps · Easy", time: "2h ago", xp: "+100 XP", kind: "problem" },
  { id: "a2", title: "The Toolchain", detail: "Lesson in progress", time: "5h ago", xp: "+50 XP", kind: "lesson" },
  { id: "a3", title: "First Sprint", detail: "Achievement · 7-day streak", time: "Yesterday", xp: "+25 XP", kind: "achievement" },
  { id: "a4", title: "Slice of Life", detail: "Solved · Slices · Medium", time: "Yesterday", xp: "+150 XP", kind: "problem" },
  { id: "a5", title: "Theme purchased", detail: "Midnight Terminal", time: "2 days ago", xp: "−600 XP", kind: "purchase" },
];

/* ------------------------------------------------------------------ */
/* Problems                                                            */
/* ------------------------------------------------------------------ */

export type ProblemExample = { input: string; output: string; explanation?: string };

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  tags: string[];
  xp: number;
  solved: boolean;
  attemptStatus: "solved" | "attempted" | "todo";
  acceptance: number;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  related: string[];
};

export const PROBLEM_TOPICS = [
  "Maps",
  "Slices",
  "Strings",
  "Concurrency",
  "Interfaces",
  "Errors",
  "Structs",
  "Algorithms",
  "Data Structures",
] as const;

const rawProblems: Problem[] = [
  {
    id: "word-counter",
    title: "Word Counter",
    difficulty: "Easy",
    topic: "Maps",
    tags: ["strings", "map", "frequency"],
    xp: 100,
    solved: true,
    attemptStatus: "solved",
    acceptance: 82,
    description:
      "Write a function that returns the frequency of each word in a sentence. Words are separated by whitespace and comparison is case-insensitive.",
    examples: [
      { input: `countWords("go go Gopher")`, output: `map[go:2 gopher:1]`, explanation: "Case is folded before counting." },
      { input: `countWords("")`, output: `map[]`, explanation: "An empty sentence has no words." },
    ],
    constraints: ["0 ≤ len(sentence) ≤ 10^5", "Words contain only letters and spaces"],
    related: ["anagram-check", "first-unique-rune"],
  },
  {
    id: "slice-rotate",
    title: "Rotate the Slice",
    difficulty: "Easy",
    topic: "Slices",
    tags: ["slices", "in-place"],
    xp: 100,
    solved: true,
    attemptStatus: "solved",
    acceptance: 76,
    description:
      "Rotate a slice of integers to the left by k positions, using O(1) extra memory.",
    examples: [
      { input: "rotate([]int{1,2,3,4,5}, 2)", output: "[]int{3,4,5,1,2}" },
      { input: "rotate([]int{1,2}, 0)", output: "[]int{1,2}", explanation: "k = 0 is a no-op." },
    ],
    constraints: ["1 ≤ len(nums) ≤ 10^5", "0 ≤ k ≤ len(nums)"],
    related: ["merge-sorted-slices", "word-counter"],
  },
  {
    id: "anagram-check",
    title: "Anagram Check",
    difficulty: "Easy",
    topic: "Strings",
    tags: ["strings", "map", "sorting"],
    xp: 100,
    solved: false,
    attemptStatus: "attempted",
    acceptance: 64,
    description:
      "Given two strings, decide whether they are anagrams of each other after lowercasing and ignoring non-letter characters.",
    examples: [
      { input: `isAnagram("Listen", "Silent!")`, output: "true" },
      { input: `isAnagram("go", "gopher")`, output: "false" },
    ],
    constraints: ["1 ≤ len(s) ≤ 10^4", "Input is UTF-8"],
    related: ["word-counter", "first-unique-rune"],
  },
  {
    id: "merge-sorted-slices",
    title: "Merge Sorted Slices",
    difficulty: "Medium",
    topic: "Slices",
    tags: ["two-pointers", "merge"],
    xp: 150,
    solved: false,
    attemptStatus: "attempted",
    acceptance: 58,
    description:
      "Merge two pre-sorted slices into one sorted slice without allocating an intermediate copy larger than the result.",
    examples: [
      { input: "merge([]int{1,3}, []int{2,4})", output: "[]int{1,2,3,4}" },
    ],
    constraints: ["0 ≤ len(a), len(b) ≤ 10^5", "Both inputs sorted ascending"],
    related: ["slice-rotate", "heap-top-k"],
  },
  {
    id: "rate-limiter",
    title: "Token Bucket Rate Limiter",
    difficulty: "Medium",
    topic: "Concurrency",
    tags: ["goroutines", "channels", "time"],
    xp: 200,
    solved: false,
    attemptStatus: "todo",
    acceptance: 41,
    description:
      "Implement a token-bucket rate limiter that allows n requests per second. The limiter must be safe for concurrent use and must not leak goroutines after Close().",
    examples: [
      { input: "lim := NewLimiter(2); lim.Allow()", output: "true", explanation: "First burst is available immediately." },
      { input: "sleep(600ms); lim.Allow()", output: "true" },
    ],
    constraints: ["Allow() must be goroutine-safe", "Close() must release all waiters"],
    related: ["worker-pool", "context-cancel"],
  },
  {
    id: "worker-pool",
    title: "Bounded Worker Pool",
    difficulty: "Medium",
    topic: "Concurrency",
    tags: ["goroutines", "channels", "fan-out"],
    xp: 200,
    solved: false,
    attemptStatus: "todo",
    acceptance: 47,
    description:
      "Process a stream of jobs with exactly N workers. Results must arrive in completion order, and the pool must exit after the last job is processed.",
    examples: [
      { input: "pool := NewPool(4); pool.Run(jobs)", output: "[]Result, error" },
    ],
    constraints: ["1 ≤ N ≤ 64", "No goroutine may outlive Run()"],
    related: ["rate-limiter", "context-cancel"],
  },
  {
    id: "context-cancel",
    title: "Cancelable Fan-out",
    difficulty: "Hard",
    topic: "Concurrency",
    tags: ["context", "select", "cancellation"],
    xp: 300,
    solved: false,
    attemptStatus: "todo",
    acceptance: 29,
    description:
      "Fan out a request to K backends and return the first successful response. Cancellation must propagate to every worker, and all goroutines must exit within 50ms of return.",
    examples: [
      { input: "firstSuccess(ctx, backends)", output: "(*Response, error)" },
    ],
    constraints: ["K ≤ 32", "Must honor ctx cancellation", "No goroutine leaks"],
    related: ["worker-pool", "rate-limiter"],
  },
  {
    id: "shape-area",
    title: "Area Through Interfaces",
    difficulty: "Easy",
    topic: "Interfaces",
    tags: ["interface", "polymorphism"],
    xp: 100,
    solved: true,
    attemptStatus: "solved",
    acceptance: 88,
    description:
      "Define a Shape interface with an Area() float64 method and compute the total area of a mixed slice of shapes.",
    examples: [
      { input: "totalArea([]Shape{Rect{2,3}, Circle{1}})", output: "9.14159..." },
    ],
    constraints: ["All shapes are valid (positive dimensions)"],
    related: ["error-wrapping", "binary-tree-depth"],
  },
  {
    id: "error-wrapping",
    title: "Error Chain Inspector",
    difficulty: "Medium",
    topic: "Errors",
    tags: ["errors", "wrapping", "errors.Is"],
    xp: 150,
    solved: false,
    attemptStatus: "todo",
    acceptance: 55,
    description:
      "Given a wrapped error chain, return the depth of the chain and whether it contains a sentinel error ErrNotFound.",
    examples: [
      { input: "inspect(fmt.Errorf(\"read: %w\", ErrNotFound))", output: "{depth: 1, found: true}" },
    ],
    constraints: ["Chain length ≤ 32", "Use errors.Is, not string matching"],
    related: ["shape-area", "panic-recover"],
  },
  {
    id: "panic-recover",
    title: "Safe Goroutine Runner",
    difficulty: "Medium",
    topic: "Errors",
    tags: ["panic", "recover", "goroutines"],
    xp: 150,
    solved: false,
    attemptStatus: "todo",
    acceptance: 52,
    description:
      "Run a list of tasks concurrently and convert any panic into an error result. One task panicking must not affect the others.",
    examples: [
      { input: "runAll(ctx, tasks)", output: "[]Result{...}" },
    ],
    constraints: ["A panic in one task must not cancel siblings", "Results keep input order"],
    related: ["error-wrapping", "worker-pool"],
  },
  {
    id: "first-unique-rune",
    title: "First Unique Rune",
    difficulty: "Easy",
    topic: "Strings",
    tags: ["strings", "map", "unicode"],
    xp: 100,
    solved: true,
    attemptStatus: "solved",
    acceptance: 80,
    description:
      "Return the first non-repeating rune in a string, or ' ' if none exists. Must handle multi-byte characters correctly.",
    examples: [
      { input: `firstUnique("gophers")`, output: `"g"` },
      { input: `firstUnique("aabb")`, output: `" "` },
    ],
    constraints: ["1 ≤ len(s) ≤ 10^5", "Input is valid UTF-8"],
    related: ["anagram-check", "word-counter"],
  },
  {
    id: "binary-tree-depth",
    title: "Maximum Tree Depth",
    difficulty: "Easy",
    topic: "Algorithms",
    tags: ["recursion", "tree"],
    xp: 100,
    solved: false,
    attemptStatus: "todo",
    acceptance: 74,
    description: "Return the maximum depth of a binary tree. An empty tree has depth 0.",
    examples: [
      { input: "depth(tree(3, tree(9), tree(20, tree(15), tree(7))))", output: "3" },
    ],
    constraints: ["Nodes ≤ 10^4", "Recursion depth ≤ tree height"],
    related: ["lru-cache", "merge-sorted-slices"],
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "Hard",
    topic: "Data Structures",
    tags: ["map", "list", "design"],
    xp: 300,
    solved: false,
    attemptStatus: "attempted",
    acceptance: 33,
    description:
      "Design a fixed-capacity LRU cache with O(1) Get and Put. Use the standard library where possible; container/list is allowed.",
    examples: [
      { input: `cache.Put("a", 1); cache.Put("b", 2); cache.Get("a"); cache.Put("c", 3)`, output: `Get("b") == -1` },
    ],
    constraints: ["1 ≤ capacity ≤ 3000", "Get and Put must be O(1)"],
    related: ["binary-tree-depth", "heap-top-k"],
  },
  {
    id: "heap-top-k",
    title: "Top-K Frequent",
    difficulty: "Hard",
    topic: "Algorithms",
    tags: ["heap", "map", "sorting"],
    xp: 300,
    solved: false,
    attemptStatus: "todo",
    acceptance: 36,
    description:
      "Return the k most frequent words in a sentence, ordered by frequency then lexicographically.",
    examples: [
      { input: `topK("a b a c b a", 2)`, output: `["a", "b"]` },
    ],
    constraints: ["1 ≤ k ≤ distinct words", "Must beat O(n log n) full sort when k ≪ n"],
    related: ["lru-cache", "merge-sorted-slices"],
  },
  {
    id: "struct-tags",
    title: "Struct Tag Parser",
    difficulty: "Medium",
    topic: "Structs",
    tags: ["reflect", "tags", "json"],
    xp: 150,
    solved: false,
    attemptStatus: "todo",
    acceptance: 49,
    description:
      "Using reflection, collect every field name and its json tag for a struct type, skipping unexported fields.",
    examples: [
      { input: `parseTags(Proxy{})`, output: `[{user_id, false}, {Name, true}]` },
    ],
    constraints: ["Nested structs are not traversed", "Must not panic on unexported fields"],
    related: ["shape-area", "error-wrapping"],
  },
  {
    id: "channel-merge",
    title: "Merge N Channels",
    difficulty: "Medium",
    topic: "Concurrency",
    tags: ["channels", "select", "varargs"],
    xp: 200,
    solved: false,
    attemptStatus: "todo",
    acceptance: 44,
    description:
      "Merge N input channels into one output channel. The output must close only after every input channel is closed.",
    examples: [
      { input: "merge(ch1, ch2, ch3)", output: "<-chan int" },
    ],
    constraints: ["N ≤ 16", "Output closes exactly once", "No goroutine leaks"],
    related: ["worker-pool", "context-cancel"],
  },
  {
    id: "string-builder-bench",
    title: "String Builder Benchmark",
    difficulty: "Easy",
    topic: "Algorithms",
    tags: ["benchmark", "strings"],
    xp: 100,
    solved: false,
    attemptStatus: "todo",
    acceptance: 91,
    description:
      "Concatenate 10,000 strings efficiently. Your solution must allocate fewer than 10 times as many bytes as the final result.",
    examples: [
      { input: "join(parts, \",\")", output: "string" },
    ],
    constraints: ["parts length = 10,000", "Report allocations with testing.AllocsPerRun"],
    related: ["first-unique-rune", "anagram-check"],
  },
];

export const PROBLEMS: Problem[] = rawProblems;
export const PROBLEM_TAGS: string[] = Array.from(
  new Set(rawProblems.flatMap((p) => p.tags)),
).sort();

export function findProblem(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}

export const TOPIC_PATHS: { topic: string; blurb: string; problems: number }[] = [
  { topic: "Maps", blurb: "Frequency counts, sets, and grouping", problems: 4 },
  { topic: "Slices", blurb: "In-place edits and two-pointer moves", problems: 3 },
  { topic: "Concurrency", blurb: "Goroutines, channels, cancellation", problems: 5 },
  { topic: "Errors", blurb: "Wrapping, panics, and recovery", problems: 3 },
];

/* ------------------------------------------------------------------ */
/* Friends                                                             */
/* ------------------------------------------------------------------ */

export type FriendStatus = "friend" | "sent" | "received" | "none";

export type Friend = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  level: number;
  xp: number;
  streak: number;
  status: FriendStatus;
  title: string;
  solved: number;
  modulesDone: number;
  lastActive: string;
  bio?: string;
};

export const FRIENDS: Friend[] = [
  { id: "amara", name: "Amara Osei", handle: "@amara", initials: "AO", level: 7, xp: 3120, streak: 21, status: "friend", title: "Interface Whisperer", solved: 46, modulesDone: 8, lastActive: "12m ago", bio: "Backend engineer learning concurrency the right way." },
  { id: "diego", name: "Diego Ramírez", handle: "@diego", initials: "DR", level: 5, xp: 1980, streak: 9, status: "friend", title: "Slice Wrangler", solved: 31, modulesDone: 6, lastActive: "2h ago", bio: "Turning Python habits into idiomatic Go." },
  { id: "mei", name: "Mei Watanabe", handle: "@meiw", initials: "MW", level: 6, xp: 2450, streak: 30, status: "friend", title: "Channel Surfer", solved: 38, modulesDone: 7, lastActive: "Yesterday", bio: "30-day streak chaser. Loves a good select statement." },
  { id: "tom", name: "Tom Nilsson", handle: "@tomn", initials: "TN", level: 4, xp: 1420, streak: 4, status: "friend", title: "Race Detector", solved: 22, modulesDone: 5, lastActive: "3d ago", bio: "SRE moving services from scripts to Go binaries." },
  { id: "priya", name: "Priya Nair", handle: "@priya", initials: "PN", level: 8, xp: 4210, streak: 12, status: "received", title: "Master Gopher", solved: 61, modulesDone: 11, lastActive: "4h ago", bio: "Writes tests first, apologizes never." },
  { id: "jonas", name: "Jonas Berg", handle: "@jonasb", initials: "JB", level: 3, xp: 890, streak: 0, status: "sent", title: "Apprentice Gopher", solved: 14, modulesDone: 3, lastActive: "1w ago", bio: "Curious about Go from the embedded world." },
  { id: "sofia", name: "Sofia Marino", handle: "@sofiam", initials: "SM", level: 5, xp: 2100, streak: 6, status: "none", title: "Error Wrapper", solved: 29, modulesDone: 6, lastActive: "6h ago", bio: "Fan of the standard library." },
  { id: "ravi", name: "Ravi Menon", handle: "@ravim", initials: "RM", level: 4, xp: 1610, streak: 2, status: "none", title: "HTTP Handler", solved: 25, modulesDone: 5, lastActive: "2d ago", bio: "Building APIs that stay up." },
];

export type LeaderboardRow = {
  rank: number;
  friendId: string;
  name: string;
  initials: string;
  xp: number;
  delta: number;
  isYou?: boolean;
};

export const LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, friendId: "priya", name: "Priya Nair", initials: "PN", xp: 4210, delta: 320 },
  { rank: 2, friendId: "amara", name: "Amara Osei", initials: "AO", xp: 3120, delta: 180 },
  { rank: 3, friendId: "mei", name: "Mei Watanabe", initials: "MW", xp: 2450, delta: 240 },
  { rank: 4, friendId: "sofia", name: "Sofia Marino", initials: "SM", xp: 2100, delta: 90 },
  { rank: 5, friendId: "diego", name: "Diego Ramírez", initials: "DR", xp: 1980, delta: 140 },
  { rank: 6, friendId: "ravi", name: "Ravi Menon", initials: "RM", xp: 1610, delta: 60 },
  { rank: 7, friendId: "tom", name: "Tom Nilsson", initials: "TN", xp: 1420, delta: 45 },
  { rank: 8, friendId: "you", name: "You", initials: "K", xp: 840, delta: 215, isYou: true },
];

export type FriendActivity = {
  id: string;
  friendId: string;
  name: string;
  initials: string;
  action: string;
  detail: string;
  time: string;
  xp?: number;
};

export const FRIEND_ACTIVITY: FriendActivity[] = [
  { id: "f1", friendId: "amara", name: "Amara Osei", initials: "AO", action: "Solved", detail: "Token Bucket Rate Limiter · Medium", time: "12m ago", xp: 200 },
  { id: "f2", friendId: "mei", name: "Mei Watanabe", initials: "MW", action: "Reached", detail: "30-day streak", time: "1h ago", xp: 150 },
  { id: "f3", friendId: "diego", name: "Diego Ramírez", initials: "DR", action: "Completed", detail: "Module: Control Flow", time: "2h ago", xp: 180 },
  { id: "f4", friendId: "priya", name: "Priya Nair", initials: "PN", action: "Unlocked", detail: "Badge: Test First", time: "5h ago", xp: 100 },
];

export function findFriend(id: string): Friend | undefined {
  return FRIENDS.find((f) => f.id === id);
}

/* ------------------------------------------------------------------ */
/* Marketplace                                                         */
/* ------------------------------------------------------------------ */

export type ItemCategory = "themes" | "avatars" | "stickers" | "badges";

export type MarketplaceItem = {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  description: string;
  owned: boolean;
  locked: boolean;
  lockReason?: string;
  free?: boolean;
  swatch: string[];
};

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  { id: "theme-midnight", name: "Midnight Terminal", category: "themes", price: 600, description: "A dark editor theme tuned for long sessions.", owned: true, locked: false, swatch: ["#0f172a", "#1e293b", "#38bdf8"] },
  { id: "theme-paper", name: "Paper Light", category: "themes", price: 0, description: "Warm, low-contrast surfaces for daylight coding.", owned: false, locked: false, free: true, swatch: ["#fafaf9", "#e7e5e4", "#a8a29e"] },
  { id: "theme-go-cyan", name: "Go Cyan", category: "themes", price: 750, description: "Classic Gopher blue across the whole interface.", owned: false, locked: false, swatch: ["#00ADD8", "#0e6a93", "#eef9fd"] },
  { id: "theme-solar", name: "Solar Dusk", category: "themes", price: 900, description: "Amber-on-indigo palette inspired by Solarized.", owned: false, locked: true, lockReason: "Unlocks at Level 5", swatch: ["#fdf6e3", "#b58900", "#268bd2"] },
  { id: "avatar-byte", name: "Byte the Gopher", category: "avatars", price: 500, description: "The classic blue gopher, hand-drawn.", owned: false, locked: true, lockReason: "Unlocks at Level 4", swatch: ["#00ADD8", "#ffffff", "#0e6a93"] },
  { id: "avatar-ascii", name: "ASCII Face", category: "avatars", price: 350, description: "Monospace personality for terminal lovers.", owned: true, locked: false, swatch: ["#020617", "#f8fafc", "#64748b"] },
  { id: "avatar-pixel", name: "Pixel Byte", category: "avatars", price: 400, description: "8-bit gopher in a 32×32 grid.", owned: false, locked: false, swatch: ["#38bdf8", "#1d4ed8", "#fde047"] },
  { id: "sticker-gopher", name: "Gopher Peek", category: "stickers", price: 0, description: "A gopher peeking over your cards.", owned: false, locked: false, free: true, swatch: ["#00ADD8", "#bbd8f0"] },
  { id: "sticker-bolt", name: "Streak Bolt", category: "stickers", price: 200, description: "Shows next to a active streak.", owned: false, locked: false, swatch: ["#f59e0b", "#fef3c7"] },
  { id: "sticker-chan", name: "Channel Closed", category: "stickers", price: 250, description: "For the concurrency crowd.", owned: false, locked: true, lockReason: "Complete module 10 to unlock", swatch: ["#8b5cf6", "#ede9fe"] },
  { id: "badge-ten-solved", name: "Ten Down", category: "badges", price: 300, description: "Earned style for solving 10 problems.", owned: true, locked: false, swatch: ["#0f7b4f", "#d1fae5"] },
  { id: "badge-race-free", name: "Race Free", category: "badges", price: 800, description: "For shipping concurrency without data races.", owned: false, locked: false, swatch: ["#0d84b6", "#d7f1fa"] },
];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  themes: "Themes",
  avatars: "Avatars",
  stickers: "Stickers",
  badges: "Badges",
};

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  kind: "friend" | "xp" | "achievement" | "system";
};

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Friend request", detail: "Priya Nair wants to connect", time: "10m ago", unread: true, kind: "friend" },
  { id: "n2", title: "Daily quest ready", detail: "Solve 3 problems for 120 XP", time: "1h ago", unread: true, kind: "xp" },
  { id: "n3", title: "Streak milestone", detail: "7 days in a row — keep it going", time: "Yesterday", unread: false, kind: "achievement" },
];

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export type Achievement = {
  id: string;
  name: string;
  detail: string;
  earned: boolean;
  progress?: { current: number; goal: number };
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-blood", name: "First Blood", detail: "Solve your first problem", earned: true },
  { id: "week-strong", name: "Week Strong", detail: "7-day learning streak", earned: true },
  { id: "module-one", name: "Groundwork", detail: "Complete the first module", earned: true },
  { id: "fifty", name: "Half Century", detail: "Solve 50 problems", earned: false, progress: { current: 12, goal: 50 } },
  { id: "concurrency", name: "Race Free", detail: "Solve 10 concurrency problems", earned: false, progress: { current: 0, goal: 10 } },
  { id: "social", name: "Study Group", detail: "Add 10 friends", earned: false, progress: { current: 4, goal: 10 } },
];
