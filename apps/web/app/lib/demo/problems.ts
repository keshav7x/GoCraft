import type { Problem } from "./types";

/* ------------------------------------------------------------------ */
/* Representative practice problems (demo). No sandbox/execution       */
/* backend exists — submissions are simulated locally and labeled.     */
/* ------------------------------------------------------------------ */

export const PROBLEM_TOPICS = [
  "strings",
  "maps",
  "slices",
  "functions",
  "interfaces",
  "errors",
  "concurrency",
  "algorithms",
] as const;

type RawProblem = Omit<
  Problem,
  "id" | "topic" | "minutes" | "acceptance" | "functionSignature" | "starterCode"
>;

const rawProblems: RawProblem[] = [
  {
    slug: "anagram-check",
    title: "Valid Anagram",
    difficulty: "Easy",
    topics: ["strings", "maps"],
    tags: ["frequency-count", "unicode"],
    xp: 50,
    estMinutes: 15,
    summary: "Decide whether two strings are anagrams of each other.",
    description: [
      "Given two strings s and t, return true when t is an anagram of s.",
      "An anagram uses the exact same characters with the same counts, in any order.",
    ],
    examples: [
      { input: 's = "listen", t = "silent"', output: "true" },
      {
        input: 's = "hello", t = "world"',
        output: "false",
        explanation: '"hello" and "world" do not share the same character counts.',
      },
    ],
    constraints: ["1 <= len(s), len(t) <= 10_000", "Both strings contain lowercase letters"],
    signature: {
      filename: "anagram.go",
      source: "func isAnagram(s, t string) bool {\n\t// your code here\n}",
    },
    testCases: [
      { name: "basic", input: 'isAnagram("listen", "silent")', expected: "true" },
      { name: "different lengths", input: 'isAnagram("a", "ab")', expected: "false" },
    ],
    related: ["word-frequency", "first-unique-rune"],
  },
  {
    slug: "word-frequency",
    title: "Word Frequency Counter",
    difficulty: "Easy",
    topics: ["maps", "strings"],
    tags: ["counts", "text-processing"],
    xp: 50,
    estMinutes: 15,
    summary: "Count how often each word appears in a sentence.",
    description: [
      "Write a function that takes a sentence and returns a map of word → occurrence count.",
      "Words are separated by whitespace. Compare words case-insensitively.",
    ],
    examples: [
      {
        input: 'countWords("go go gopher")',
        output: '{"go": 2, "gopher": 1}',
      },
    ],
    constraints: ["Input may be empty", "Words contain only letters"],
    signature: {
      filename: "wordfreq.go",
      source: "func countWords(sentence string) map[string]int {\n\t// your code here\n}",
    },
    testCases: [
      { name: "repeat", input: 'countWords("go go")', expected: `map["go":2]` },
      { name: "empty", input: 'countWords("")', expected: "map[]" },
    ],
    related: ["anagram-check", "unique-characters"],
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz, the Go way",
    difficulty: "Easy",
    topics: ["functions", "slices"],
    tags: ["basics"],
    xp: 40,
    estMinutes: 10,
    summary: "Generate FizzBuzz output using idiomatic loops and append.",
    description: [
      "Return a slice of strings for 1..n: Fizz for multiples of 3, Buzz for 5, FizzBuzz for both.",
    ],
    examples: [{ input: "fizzBuzz(5)", output: '["1", "2", "Fizz", "4", "Buzz"]' }],
    constraints: ["1 <= n <= 1000"],
    signature: {
      filename: "fizzbuzz.go",
      source: "func fizzBuzz(n int) []string {\n\t// your code here\n}",
    },
    testCases: [{ name: "n=3", input: "fizzBuzz(3)", expected: '["1", "2", "Fizz"]' }],
    related: ["unique-characters"],
  },
  {
    slug: "unique-characters",
    title: "Has All Unique Characters",
    difficulty: "Easy",
    topics: ["strings", "maps", "algorithms"],
    tags: ["sets"],
    xp: 50,
    estMinutes: 12,
    summary: "Detect whether a string contains every character only once.",
    description: ["Return true if no rune in the string repeats."],
    examples: [
      { input: 'hasUnique("gopher")', output: "true" },
      { input: 'hasUnique("book")', output: "false", explanation: "'o' appears twice" },
    ],
    constraints: ["Strings may include any Unicode rune"],
    signature: {
      filename: "unique.go",
      source: "func hasUnique(s string) bool {\n\t// your code here\n}",
    },
    testCases: [{ name: "repeat", input: 'hasUnique("aa")', expected: "false" }],
    related: ["first-unique-rune", "anagram-check"],
  },
  {
    slug: "first-unique-rune",
    title: "First Unique Rune",
    difficulty: "Medium",
    topics: ["strings", "maps"],
    tags: ["unicode", "frequency-count"],
    xp: 80,
    estMinutes: 20,
    summary: "Find the index of the first non-repeating rune.",
    description: [
      "Return the index of the first rune that does not repeat anywhere in the string, or -1.",
      "Work in runes, not bytes, so multi-byte characters behave correctly.",
    ],
    examples: [
      { input: 'firstUnique("leetcode")', output: "0" },
      { input: 'firstUnique("aabb")', output: "-1" },
    ],
    constraints: ["0 <= len(s) <= 100_000 bytes"],
    signature: {
      filename: "firstunique.go",
      source: "func firstUnique(s string) int {\n\t// your code here\n}",
    },
    testCases: [{ name: "all unique", input: 'firstUnique("abc")', expected: "0" }],
    related: ["anagram-check", "unique-characters"],
  },
  {
    slug: "merge-intervals",
    title: "Merge Overlapping Intervals",
    difficulty: "Medium",
    topics: ["slices", "algorithms"],
    tags: ["sorting", "intervals"],
    xp: 90,
    estMinutes: 25,
    summary: "Collapse overlapping [start, end] ranges into a minimal set.",
    description: [
      "Given a slice of intervals, merge all overlapping ones and return the result sorted by start.",
    ],
    examples: [
      {
        input: "merge([[1,3],[2,6],[8,10],[15,18]])",
        output: "[[1,6],[8,10],[15,18]]",
      },
    ],
    constraints: ["0 <= intervals.length <= 10^4", "start <= end"],
    signature: {
      filename: "merge.go",
      source: "func merge(intervals [][2]int) [][2]int {\n\t// your code here\n}",
    },
    testCases: [
      { name: "nested", input: "merge([[1,4],[2,3]])", expected: "[[1,4]]" },
    ],
    related: ["two-sum", "rotate-slice"],
  },
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Medium",
    topics: ["slices", "maps", "algorithms"],
    tags: ["hash-map", "classic"],
    xp: 80,
    estMinutes: 20,
    summary: "Find two indices whose values add up to a target.",
    description: [
      "Return the indices of the two numbers that sum to target. Exactly one solution exists.",
      "Aim for O(n) using a map of value → index.",
    ],
    examples: [{ input: "twoSum([2, 7, 11, 15], 9)", output: "[0, 1]" }],
    constraints: ["2 <= n <= 10^4", "Exactly one valid answer"],
    signature: {
      filename: "twosum.go",
      source: "func twoSum(nums []int, target int) [2]int {\n\t// your code here\n}",
    },
    testCases: [{ name: "negatives", input: "twoSum([-1, -2, -3], -5)", expected: "[1, 2]" }],
    related: ["merge-intervals"],
  },
  {
    slug: "rotate-slice",
    title: "Rotate Slice in Place",
    difficulty: "Medium",
    topics: ["slices"],
    tags: ["in-place", "two-pointers"],
    xp: 70,
    estMinutes: 18,
    summary: "Rotate a slice right by k positions without extra memory.",
    description: [
      "Rotate nums to the right by k steps in place. Try the reverse-then-reverse trick.",
    ],
    examples: [{ input: "rotate([1,2,3,4,5,6,7], 3)", output: "[5,6,7,1,2,3,4]" }],
    constraints: ["1 <= n <= 10^5", "0 <= k <= n"],
    signature: {
      filename: "rotate.go",
      source: "func rotate(nums []int, k int) {\n\t// your code here\n}",
    },
    testCases: [{ name: "k=0", input: "rotate([1,2], 0)", expected: "[1,2]" }],
    related: ["merge-intervals"],
  },
  {
    slug: "rate-limiter",
    title: "Token Bucket Rate Limiter",
    difficulty: "Medium",
    topics: ["concurrency", "algorithms"],
    tags: ["channels", "time"],
    xp: 100,
    estMinutes: 30,
    summary: "Implement a thread-safe token bucket with a refill ticker.",
    description: [
      "Design a rate limiter that allows up to n operations per second. It must be safe for concurrent use.",
      "Use a mutex or a channel-owning goroutine — explain your choice in a comment.",
    ],
    examples: [
      {
        input: "lim := NewLimiter(2); lim.Allow() // t=0ms",
        output: "true",
        explanation: "Burst capacity starts full.",
      },
    ],
    constraints: ["Must be goroutine-safe", "No busy waiting"],
    signature: {
      filename: "limiter.go",
      source: "type Limiter struct {\n\t// your fields\n}\n\nfunc (l *Limiter) Allow() bool {\n\t// your code here\n}",
    },
    testCases: [
      { name: "burst then deny", input: "lim.Allow(); lim.Allow(); lim.Allow()", expected: "true, true, false" },
    ],
    related: ["worker-pool"],
  },
  {
    slug: "worker-pool",
    title: "Bounded Worker Pool",
    difficulty: "Medium",
    topics: ["concurrency"],
    tags: ["fan-out", "channels", "waitgroup"],
    xp: 100,
    estMinutes: 30,
    summary: "Process jobs with a fixed number of goroutines.",
    description: [
      "Given a slice of jobs and a worker count, process all jobs with at most `workers` goroutines and collect results in order-independent fashion.",
    ],
    examples: [
      {
        input: "runPool(jobs, 4)",
        output: "results slice with one entry per job",
      },
    ],
    constraints: ["jobs may be empty", "workers >= 1"],
    signature: {
      filename: "pool.go",
      source: "func runPool(jobs []int, workers int) []int {\n\t// your code here\n}",
    },
    testCases: [{ name: "single worker", input: "runPool([1,2,3], 1)", expected: "processed 3" }],
    related: ["rate-limiter", "pipeline"],
  },
  {
    slug: "pipeline",
    title: "Channel Pipeline",
    difficulty: "Hard",
    topics: ["concurrency"],
    tags: ["channels", "context"],
    xp: 130,
    estMinutes: 40,
    summary: "Build a multi-stage pipeline with cancellation.",
    description: [
      "Create generate → square → take(n) stages connected by channels. Support cancellation via context.Context.",
      "Stages must shut down cleanly: no goroutine leaks after the consumer stops.",
    ],
    examples: [
      { input: "square(generate(ctx, 1,2,3), ctx)", output: "channels 1, 4, 9 then closes" },
    ],
    constraints: ["No goroutine leaks", "Respect ctx.Done()"],
    signature: {
      filename: "pipeline.go",
      source: "func square(ctx context.Context, in <-chan int) <-chan int {\n\t// your code here\n}",
    },
    testCases: [{ name: "closes", input: "drain(square(generate(ctx, 2)))", expected: "[4]" }],
    related: ["worker-pool", "fan-out"],
  },
  {
    slug: "fan-out",
    title: "Fan-out / Fan-in",
    difficulty: "Hard",
    topics: ["concurrency"],
    tags: ["channels", "merge"],
    xp: 130,
    estMinutes: 40,
    summary: "Distribute work across workers and merge their outputs.",
    description: [
      "Split a job stream across n workers and merge results into one channel. Close the merged channel only after every worker finishes.",
    ],
    examples: [{ input: "fanIn(fanOut(jobs, 3)...)", output: "single results channel" }],
    constraints: ["Must terminate", "No send-on-closed panic"],
    signature: {
      filename: "fanin.go",
      source: "func merge(cs ...<-chan int) <-chan int {\n\t// your code here\n}",
    },
    testCases: [{ name: "empty", input: "merge()", expected: "closed channel" }],
    related: ["pipeline", "worker-pool"],
  },
  {
    slug: "stringer-stack",
    title: "Formatting Value Stack",
    difficulty: "Medium",
    topics: ["interfaces", "structs"],
    tags: ["fmt", "composition"],
    xp: 90,
    estMinutes: 22,
    summary: "Use the fmt.Stringer interface to format a custom type.",
    description: [
      "Implement String() string for a Stack[int] so fmt.Println(stack) prints top → bottom.",
    ],
    examples: [{ input: "fmt.Println(stack)", output: "[3 2 1] (top first)" }],
    constraints: ["Empty stack prints []"],
    signature: {
      filename: "stack.go",
      source: "type Stack []int\n\nfunc (s Stack) String() string {\n\t// your code here\n}",
    },
    testCases: [{ name: "empty", input: "Stack{}.String()", expected: "[]" }],
    related: ["shape-area", "retry-wrapper"],
  },
  {
    slug: "shape-area",
    title: "Area with Interfaces",
    difficulty: "Medium",
    topics: ["interfaces", "structs", "functions"],
    tags: ["polymorphism"],
    xp: 90,
    estMinutes: 22,
    summary: "Compute areas of mixed shapes via a small interface.",
    description: [
      "Define Shape with Area() float64, implement for Circle and Rect, then total the areas of a mixed slice.",
    ],
    examples: [{ input: "totalArea([]Shape{Rect{2,3}, Circle{1}})", output: "6 + π" }],
    constraints: ["Use math.Pi for the circle"],
    signature: {
      filename: "shape.go",
      source: "type Shape interface {\n\tArea() float64\n}",
    },
    testCases: [{ name: "rect only", input: "totalArea([]Shape{Rect{2,5}})", expected: "10" }],
    related: ["stringer-stack", "shape-area"],
  },
  {
    slug: "retry-wrapper",
    title: "Retry with Backoff",
    difficulty: "Medium",
    topics: ["errors", "functions"],
    tags: ["error-handling", "time"],
    xp: 90,
    estMinutes: 25,
    summary: "Wrap a flaky operation with bounded retries and errors.Is checks.",
    description: [
      "Retry fn up to maxAttempts times with linear backoff. Stop immediately on non-retryable errors.",
      "Return the last error wrapped with attempt context using %w.",
    ],
    examples: [
      {
        input: "retry(func() error { return ErrTemporary }, 3)",
        output: "error after 3 attempts, chain preserves ErrTemporary",
      },
    ],
    constraints: ["Backoff must not exceed 1s total", "Use %w wrapping"],
    signature: {
      filename: "retry.go",
      source: "func retry(fn func() error, maxAttempts int) error {\n\t// your code here\n}",
    },
    testCases: [{ name: "immediate success", input: "retry(nilFn, 3)", expected: "nil" }],
    related: ["validate-inputs"],
  },
  {
    slug: "validate-inputs",
    title: "Struct Validation Errors",
    difficulty: "Easy",
    topics: ["errors", "structs"],
    tags: ["error-types"],
    xp: 60,
    estMinutes: 18,
    summary: "Collect validation failures into a single error value.",
    description: [
      "Implement Validate() error on a User struct. Return a custom ValidationError listing every failed field.",
    ],
    examples: [{ input: 'User{Name: ""}.Validate()', output: 'ValidationError{"name is required"}' }],
    constraints: ["Empty name and invalid email are errors"],
    signature: {
      filename: "validate.go",
      source: "type ValidationError struct {\n\tFields map[string]string\n}\n\nfunc (e *ValidationError) Error() string { return \"validation failed\" }",
    },
    testCases: [{ name: "valid", input: 'User{Name: "ada", Email: "a@b.c"}.Validate()', expected: "nil" }],
    related: ["retry-wrapper"],
  },
  {
    slug: "dedupe-interface-slice",
    title: "Deduplicate Comparable Values",
    difficulty: "Hard",
    topics: ["interfaces", "slices", "algorithms"],
    tags: ["generics", "comparable"],
    xp: 120,
    estMinutes: 30,
    summary: "Write a generic unique() using type parameters.",
    description: [
      "Implement unique[T comparable](items []T) []T preserving first-seen order.",
      "Discuss why interface{} alone would be weaker than a type parameter.",
    ],
    examples: [{ input: "unique([]int{1,1,2})", output: "[1 2]" }],
    constraints: ["Preserve order", "O(n) expected"],
    signature: {
      filename: "unique.go",
      source: "func unique[T comparable](items []T) []T {\n\t// your code here\n}",
    },
    testCases: [{ name: "empty", input: "unique([]int{})", expected: "[]" }],
    related: ["two-sum"],
  },
  {
    slug: "http-timeout-client",
    title: "HTTP Client with Timeout",
    difficulty: "Hard",
    topics: ["errors", "functions", "concurrency"],
    tags: ["net/http", "context"],
    xp: 120,
    estMinutes: 35,
    summary: "Fetch a URL safely with timeouts and status handling.",
    description: [
      "GET a URL with a 2s timeout via context. Return an error for non-2xx statuses; close body always.",
    ],
    examples: [{ input: 'fetchTitle("https://example.com")', output: '"Example Domain" or error' }],
    constraints: ["Always close the body", "No default client"],
    signature: {
      filename: "fetch.go",
      source: "func fetchTitle(ctx context.Context, url string) (string, error) {\n\t// your code here\n}",
    },
    testCases: [{ name: "timeout", input: "ctx canceled", expected: "ctx.Err()" }],
    related: ["retry-wrapper", "rate-limiter"],
  },
  {
    slug: "shuffled-deck",
    title: "Fair Shuffle",
    difficulty: "Easy",
    topics: ["slices", "algorithms"],
    tags: ["random"],
    xp: 50,
    estMinutes: 12,
    summary: "Implement a Fisher–Yates shuffle over a slice.",
    description: ["Shuffle a slice of ints in place using math/rand. Explain bias pitfalls briefly."],
    examples: [{ input: "shuffle([1,2,3,4])", output: "any permutation, uniformly random" }],
    constraints: ["In place", "No allocation of a second full slice"],
    signature: {
      filename: "shuffle.go",
      source: "func shuffle(nums []int) {\n\t// your code here\n}",
    },
    testCases: [{ name: "single", input: "shuffle([1])", expected: "[1]" }],
    related: ["rotate-slice", "fizzbuzz"],
  },
  {
    slug: "bracket-match",
    title: "Valid Bracket Sequence",
    difficulty: "Easy",
    topics: ["strings", "algorithms"],
    tags: ["stack"],
    xp: 60,
    estMinutes: 15,
    summary: "Check balanced (), [], {} using a slice as a stack.",
    description: ["Return true when every opening bracket has a matching closer in the right order."],
    examples: [
      { input: 'isValid("([]{})")', output: "true" },
      { input: 'isValid("(]")', output: "false" },
    ],
    constraints: ["Only bracket characters appear"],
    signature: {
      filename: "brackets.go",
      source: "func isValid(s string) bool {\n\t// your code here\n}",
    },
    testCases: [{ name: "nested", input: 'isValid("([)]")', expected: "false" }],
    related: ["unique-characters"],
  },
];

export const PROBLEMS: Problem[] = rawProblems.map((problem, index) => ({
  ...problem,
  id: problem.slug,
  topic: problem.topics[0] ?? "algorithms",
  minutes: problem.estMinutes,
  acceptance: 62 + ((index * 17) % 33),
  functionSignature: problem.signature.source,
  starterCode: `package solution\n\n${problem.signature.source}\n`,
}));

export const DIFFICULTY_ORDER: Record<Problem["difficulty"], number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

export const TOPICS: string[] = Array.from(
  new Set(PROBLEMS.flatMap((problem) => problem.topics)),
).sort();

export function getProblem(slug: string): Problem | undefined {
  return PROBLEMS.find((problem) => problem.slug === slug);
}

export function findProblem(id: string): Problem | undefined {
  return PROBLEMS.find((problem) => problem.id === id || problem.slug === id);
}

export function relatedProblems(problem: Problem): Problem[] {
  return problem.related
    .map((related) => getProblem(related))
    .filter((entry): entry is Problem => Boolean(entry));
}