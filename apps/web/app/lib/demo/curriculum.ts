import type { CourseModule, Lesson } from "./types";

/* ------------------------------------------------------------------ */
/* Go curriculum outline. "ready" lessons have real content;           */
/* "outline" lessons are planned and clearly marked in the UI.         */
/* ------------------------------------------------------------------ */

export const CURRICULUM: CourseModule[] = [
  {
    id: "getting-started",
    order: 1,
    title: "Getting Started",
    objective: "Install Go, understand the toolchain, and run your first program.",
    icon: "rocket",
    prerequisites: [],
    lessons: [
      {
        id: "why-go",
        title: "Why Go",
        minutes: 6,
        xp: 40,
        status: "ready",
        summary:
          "What Go optimizes for, where it shines, and how this course is structured.",
        sections: [
          {
            paragraphs: [
              "Go is a statically typed language designed at Google for building simple, reliable, and efficient software. It compiles fast, ships as a single binary, and has a first-class concurrency model.",
              "This curriculum is progressive: each module builds on the last. Lessons marked as ready contain full explanations, code, and a checkpoint quiz. Outline lessons are planned next steps.",
            ],
          },
          {
            heading: "Where Go shines",
            paragraphs: [
              "CLI tools, network services, infrastructure software, and anything that benefits from cheap concurrency and predictable performance.",
            ],
            callout: {
              tone: "info",
              text: "Go's standard library is unusually complete — many projects need very few external dependencies.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "Which property is Go best known for among mainstream languages?",
            choices: [
              { id: "a", label: "Gradual typing with macros" },
              { id: "b", label: "Fast compilation and simple concurrency" },
              { id: "c", label: "Runtime metaprogramming" },
              { id: "d", label: "Manual memory pools as the only model" },
            ],
            correctChoiceId: "b",
            explanation:
              "Go pairs a fast compiler with goroutines and channels, which makes concurrent programs straightforward to express.",
          },
        ],
      },
      {
        id: "installing-go",
        title: "Installing Go & the toolchain",
        minutes: 8,
        xp: 50,
        status: "ready",
        summary:
          "Install the toolchain, understand GOPATH vs modules, and learn the core go commands.",
        sections: [
          {
            paragraphs: [
              "Download the toolchain from go.dev and verify installation with go version. Modern Go projects use modules — a module is a directory with a go.mod file that pins your module path and dependencies.",
            ],
          },
          {
            heading: "Commands you will use daily",
            paragraphs: [
              "go run compiles and runs in one step during development. go build produces a binary. go test runs your tests. go mod tidy syncs go.mod/go.sum with your imports.",
            ],
            code: {
              filename: "terminal",
              source: "$ go version\ngo version go1.25 linux/amd64\n\n$ mkdir hello && cd hello\n$ go mod init example.com/hello\n$ go mod tidy",
            },
            callout: {
              tone: "tip",
              text: "Commit go.mod and go.sum — they are how teammates and CI reproduce your dependency graph.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What file defines a Go module and its dependencies?",
            choices: [
              { id: "a", label: "package.json" },
              { id: "b", label: "go.mod (with go.sum)" },
              { id: "c", label: "Makefile" },
              { id: "d", label: "Cargo.lock" },
            ],
            correctChoiceId: "b",
            explanation:
              "go.mod declares the module path and Go version; go.sum records cryptographic hashes of dependencies.",
          },
        ],
      },
      {
        id: "hello-world",
        title: "Hello, world",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "Packages, func main, and your first compiled Go program.",
        sections: [
          {
            paragraphs: [
              "Every executable Go program starts in package main and runs the function main. Imports declare the packages you use; the compiler errors on unused imports — on purpose.",
            ],
            code: {
              source: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hello, gopher")\n}',
            },
          },
          {
            heading: "Reading the structure",
            paragraphs: [
              "package main + func main marks an executable. import \"fmt\" pulls in the formatted I/O package. Tabs are the community-standard indentation — gofmt enforces it.",
            ],
            callout: {
              tone: "tip",
              text: "Run gofmt -w . (or enable format-on-save) and never argue about formatting again.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What happens if you import a package and never use it?",
            choices: [
              { id: "a", label: "It compiles with a warning" },
              { id: "b", label: "The compiler reports an error" },
              { id: "c", label: "It is silently stripped" },
              { id: "d", label: "It panics at runtime" },
            ],
            correctChoiceId: "b",
            explanation:
              "Unused imports and variables are compile errors in Go — the language treats them as mistakes worth catching early.",
          },
        ],
      },
      {
        id: "build-and-test",
        title: "Build, run, test",
        minutes: 8,
        xp: 50,
        status: "outline",
        summary: "go build, go run, go test workflows and project layout conventions.",
      },
    ],
  },
  {
    id: "variables",
    order: 2,
    title: "Variables and Constants",
    objective: "Declare state with var and :=, understand zero values, and define constants.",
    icon: "variable",
    prerequisites: ["getting-started"],
    lessons: [
      {
        id: "declaring",
        title: "Declaring variables",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "var, :=, scope, and why short declarations matter.",
        sections: [
          {
            paragraphs: [
              "Use var for explicit declarations with a package or block scope, and := for short declarations inside functions. A short declaration must declare at least one new variable on the left.",
            ],
            code: {
              source: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tvar name string = "gopher" // explicit type\n\tlang := "Go"               // type inferred\n\tvar version = 1.25         // inferred from value\n\tvar active bool            // zero value: false\n\n\tfmt.Println(name, lang, version, active)\n}',
            },
          },
          {
            heading: "Zero values",
            paragraphs: [
              "Every declared variable has a zero value: empty string for strings, 0 for numbers, false for bools, nil for pointers, maps, slices, channels, funcs, and interfaces. Go never leaves memory uninitialized.",
            ],
            callout: {
              tone: "info",
              text: "nil is the zero value for several reference types — checking for nil is a normal part of Go code.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What is the zero value of a bool declared with var ok bool?",
            choices: [
              { id: "a", label: "true" },
              { id: "b", label: "false" },
              { id: "c", label: "nil" },
              { id: "d", label: "It fails to compile" },
            ],
            correctChoiceId: "b",
            explanation:
              "Bools zero to false. Go initializes every variable so reads never hit uninitialized memory.",
          },
          {
            id: "q2",
            prompt: "Which of these is a valid short declaration?",
            choices: [
              { id: "a", label: "x := 10" },
              { id: "b", label: "var x := 10" },
              { id: "c", label: "x : = 10" },
              { id: "d", label: ":= x 10" },
            ],
            correctChoiceId: "a",
            explanation:
              "Short declaration is := and only works inside a function. var and := cannot be combined.",
          },
        ],
      },
      {
        id: "constants",
        title: "Constants and iota",
        minutes: 9,
        xp: 60,
        status: "ready",
        summary: "Typed/untyped constants and enumerations with iota.",
        sections: [
          {
            paragraphs: [
              "Constants are fixed values known at compile time. Untyped constants adapt to context; typed constants keep their declared type. iota is a counter that increments per const block line — the idiomatic way to write enums.",
            ],
            code: {
              source: "const Pi = 3.14159\n\nconst (\n\tStatusOK = 200 + iota // 200\n\tStatusCreated         // 201\n\tStatusAccepted        // 202\n)\n\nconst AppName = \"GoCraft\" // string constant",
            },
          },
          {
            callout: {
              tone: "tip",
              text: "Use constants for configuration that should never change at runtime — magic numbers become named and greppable.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "In the const block above, what is the value of StatusCreated?",
            choices: [
              { id: "a", label: "200" },
              { id: "b", label: "201" },
              { id: "c", label: "1" },
              { id: "d", label: "202" },
            ],
            correctChoiceId: "b",
            explanation:
              "iota starts at 0 for the first line and increments each line: 200+0, 200+1=201, 200+2=202.",
          },
        ],
      },
      {
        id: "shadowing",
        title: "Scope and shadowing",
        minutes: 7,
        xp: 50,
        status: "outline",
        summary: "Block scoping, shadowed variables, and common pitfalls.",
      },
    ],
  },
  {
    id: "data-types",
    order: 3,
    title: "Data Types",
    objective: "Work confidently with strings, numbers, structs, and the type system basics.",
    icon: "box",
    prerequisites: ["variables"],
    lessons: [
      {
        id: "strings",
        title: "Strings and runes",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "Bytes vs runes, UTF-8, and safe string iteration.",
        sections: [
          {
            paragraphs: [
              "A Go string is an immutable sequence of bytes, conventionally UTF-8. Indexing yields bytes; ranging yields runes (Unicode code points). This distinction is the source of most 'why is my length wrong?' moments.",
            ],
            code: {
              source: 'package main\n\nimport "fmt"\n\nfunc main() {\n\ts := "gophers"\n\tfmt.Println(len(s)) // 7 bytes\n\n\tfor i, r := range "héllo" {\n\t\tfmt.Printf("%d: %q\\n", i, r)\n\t}\n}',
            },
            callout: {
              tone: "warning",
              text: "len(s) counts bytes, not characters. Use utf8.RuneCountInString when you need character count.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What does len(s) return for a UTF-8 string?",
            choices: [
              { id: "a", label: "Number of characters" },
              { id: "b", label: "Number of bytes" },
              { id: "c", label: "Number of runes always" },
              { id: "d", label: "It panics on non-ASCII" },
            ],
            correctChoiceId: "b",
            explanation:
              "Strings are byte slices. Multi-byte UTF-8 characters make len() larger than the visible character count.",
          },
        ],
      },
      {
        id: "numeric-types",
        title: "Numeric types and conversions",
        minutes: 8,
        xp: 50,
        status: "outline",
        summary: "int sizes, float precision, and explicit conversions.",
      },
      {
        id: "type-definitions",
        title: "Custom type definitions",
        minutes: 8,
        xp: 50,
        status: "outline",
        summary: "Named types, underlying types, and why they improve APIs.",
      },
    ],
  },
  {
    id: "control-flow",
    order: 4,
    title: "Control Flow",
    objective: "Master if, for (Go's only loop), switch, and defer.",
    icon: "branch",
    prerequisites: ["data-types"],
    lessons: [
      {
        id: "if-and-switch",
        title: "if, else, and switch",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "Scoped conditionals and expression switches without fallthrough.",
        sections: [
          {
            paragraphs: [
              "if statements can include an initializer that is scoped to the branches — a common idiom for error checks. switch is an expression match; unlike many languages it does not fall through by default.",
            ],
            code: {
              source: 'func classify(n int) string {\n\tswitch {\n\tcase n < 0:\n\t\treturn "negative"\n\tcase n == 0:\n\t\treturn "zero"\n\tdefault:\n\t\treturn "positive"\n\t}\n}\n\nfunc check() error {\n\tif v, err := load(); err != nil {\n\t\treturn err // v is scoped to this if\n\t} else {\n\t\tuse(v)\n\t}\n\treturn nil\n}',
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "Does a matched switch case fall through to the next case in Go?",
            choices: [
              { id: "a", label: "Yes, always" },
              { id: "b", label: "No, unless you write fallthrough" },
              { id: "c", label: "Only in switch true" },
              { id: "d", label: "Only with typed switches" },
            ],
            correctChoiceId: "b",
            explanation:
              "Go breaks out of the matched case automatically. Explicit fallthrough exists but is rare.",
          },
        ],
      },
      {
        id: "for-loops",
        title: "The for loop, three ways",
        minutes: 9,
        xp: 60,
        status: "ready",
        summary: "Condition-only, C-style, and range loops plus break/continue.",
        sections: [
          {
            paragraphs: [
              "Go has one loop construct: for. You can use it as a while loop (condition only), a classic three-clause loop, or a range loop over slices, maps, strings, and channels.",
            ],
            code: {
              source: "// condition-only\nfor retries > 0 {\n\tretries--\n}\n\n// three-clause\nfor i := 0; i < 3; i++ {\n\tfmt.Println(i)\n}\n\n// range\nfor index, value := range items {\n\tfmt.Println(index, value)\n}",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "Which keyword terminates a loop early?",
            choices: [
              { id: "a", label: "exit" },
              { id: "b", label: "break" },
              { id: "c", label: "stop" },
              { id: "d", label: "return" },
            ],
            correctChoiceId: "b",
            explanation:
              "break exits the innermost loop or switch. return exits the whole function.",
          },
        ],
      },
      {
        id: "defer",
        title: "defer in practice",
        minutes: 8,
        xp: 50,
        status: "outline",
        summary: "Deferred calls, LIFO order, and closure pitfalls.",
      },
    ],
  },
  {
    id: "functions",
    order: 5,
    title: "Functions",
    objective: "Write functions with multiple returns, variadics, and function values.",
    icon: "function",
    prerequisites: ["control-flow"],
    lessons: [
      {
        id: "basics",
        title: "Parameters, returns, and multiple return values",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "Signatures, named results, and the idiomatic error return.",
        sections: [
          {
            paragraphs: [
              "Functions can return multiple values. The last return is conventionally an error. Named result parameters are allowed but overusing them hurts readability.",
            ],
            code: {
              source: 'import "errors"\n\nfunc divide(a, b float64) (float64, error) {\n\tif b == 0 {\n\t\treturn 0, errors.New("division by zero")\n\t}\n\treturn a / b, nil\n}\n\nfunc main() {\n\tresult, err := divide(10, 2)\n\tif err != nil {\n\t\tfmt.Println("error:", err)\n\t\treturn\n\t}\n\tfmt.Println(result) // 5\n}',
            },
          },
          {
            callout: {
              tone: "tip",
              text: "Handle errors where you can add context — wrap with %w in fmt.Errorf when passing them up layers.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What is the idiomatic way to signal failure from a Go function?",
            choices: [
              { id: "a", label: "Throw an exception" },
              { id: "b", label: "Return an error value" },
              { id: "c", label: "Return a boolean only" },
              { id: "d", label: "Call os.Exit" },
            ],
            correctChoiceId: "b",
            explanation:
              "Go returns errors as values so callers must decide how to handle them — no hidden control flow.",
          },
        ],
      },
      {
        id: "closures-variadic",
        title: "Closures and variadic functions",
        minutes: 9,
        xp: 60,
        status: "outline",
        summary: "Anonymous functions, captured variables, and ...args.",
      },
      {
        id: "methods-preview",
        title: "Methods as functions with receivers",
        minutes: 7,
        xp: 50,
        status: "outline",
        summary: "A bridge into structs — receiver syntax and when to use it.",
      },
    ],
  },
  {
    id: "collections",
    order: 6,
    title: "Arrays, Slices, and Maps",
    objective: "Use Go's core data structures correctly, including make, append, and nil maps.",
    icon: "layers",
    prerequisites: ["functions"],
    lessons: [
      {
        id: "slices",
        title: "Slices: the everyday sequence",
        minutes: 12,
        xp: 70,
        status: "ready",
        summary: "Slice headers, append, capacity, and aliasing surprises.",
        sections: [
          {
            paragraphs: [
              "A slice is a lightweight descriptor: pointer, length, capacity. Arrays are values with fixed size; slices reference a backing array. Most Go code uses slices — arrays mostly appear as building blocks.",
            ],
            code: {
              source: "nums := []int{1, 2, 3}\nnums = append(nums, 4, 5)\n\nbatch := make([]int, 0, 8) // len 0, cap 8\n\n// Slicing shares the backing array:\na := []int{1, 2, 3, 4}\nb := a[1:3] // b == [2 3], same backing array\nb[0] = 99   // a becomes [1 99 3 4]",
            },
            callout: {
              tone: "warning",
              text: "Slices share backing arrays. Copy with copy() when you need an independent snapshot.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What does append do when capacity is exceeded?",
            choices: [
              { id: "a", label: "Panics" },
              { id: "b", label: "Allocates a new backing array and copies" },
              { id: "c", label: "Returns nil" },
              { id: "d", label: "Reuses adjacent memory" },
            ],
            correctChoiceId: "b",
            explanation:
              "When append grows beyond capacity it allocates a larger backing array — the returned slice may no longer alias the original.",
          },
        ],
      },
      {
        id: "maps",
        title: "Maps",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "make, comma-ok lookup, ranging order, and nil map writes.",
        sections: [
          {
            paragraphs: [
              "Maps are hash tables with O(1) average lookups. Reading a missing key yields the zero value; use the comma-ok form to distinguish. Ranging a map has randomized order — never rely on iteration order.",
            ],
            code: {
              source: 'ages := map[string]int{"ana": 31, "ben": 28}\n\nage, ok := ages["ana"]\nif !ok {\n\tfmt.Println("no entry")\n}\n\ndelete(ages, "ben")\n\nfor name, age := range ages {\n\tfmt.Println(name, age)\n}',
            },
            callout: {
              tone: "warning",
              text: "Writing to a nil map panics. Create with make(map[K]V) or a map literal before writing.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "What is a reliable way to check whether a key exists in a map?",
            choices: [
              { id: "a", label: "Compare with nil" },
              { id: "b", label: "The comma-ok idiom: v, ok := m[k]" },
              { id: "c", label: "len(m[k]) > 0" },
              { id: "d", label: "m.has(k)" },
            ],
            correctChoiceId: "b",
            explanation:
              "m[k] returns the zero value for missing keys; ok tells you whether the key was actually present.",
          },
        ],
      },
      {
        id: "arrays",
        title: "Fixed-size arrays",
        minutes: 5,
        xp: 40,
        status: "outline",
        summary: "When a fixed array beats a slice.",
      },
    ],
  },
  {
    id: "structs",
    order: 7,
    title: "Structs and Methods",
    objective: "Model data with structs, attach methods, and control mutation with receivers.",
    icon: "component",
    prerequisites: ["collections"],
    lessons: [
      {
        id: "struct-basics",
        title: "Structs and receivers",
        minutes: 11,
        xp: 70,
        status: "ready",
        summary: "Define structs, attach methods, and choose value vs pointer receivers.",
        sections: [
          {
            paragraphs: [
              "Structs group related fields. Methods attach behavior via a receiver. Use pointer receivers when the method mutates the receiver or the struct is large — mixing receiver types on one type is discouraged.",
            ],
            code: {
              source: 'type Counter struct {\n\tname  string\n\tcount int\n}\n\nfunc (c *Counter) Increment() {\n\tc.count++\n}\n\nfunc (c Counter) Value() int {\n\treturn c.count\n}\n\nfunc main() {\n\tc := Counter{name: "hits"}\n\tc.Increment()\n\tfmt.Println(c.Value()) // 1\n}',
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "When should a method use a pointer receiver?",
            choices: [
              { id: "a", label: "Always, for consistency only" },
              { id: "b", label: "When it mutates the receiver or needs to avoid copies" },
              { id: "c", label: "Only on interfaces" },
              { id: "d", label: "Never — receivers are always copied" },
            ],
            correctChoiceId: "b",
            explanation:
              "Pointer receivers let methods modify the original value and avoid copying large structs. Pick one receiver style per type.",
          },
        ],
      },
      {
        id: "struct-embedding",
        title: "Embedding and composition",
        minutes: 9,
        xp: 60,
        status: "outline",
        summary: "Promotion, composition over inheritance, and gotchas.",
      },
    ],
  },
  {
    id: "interfaces",
    order: 8,
    title: "Interfaces",
    objective: "Define small interfaces and let types satisfy them implicitly.",
    icon: "puzzle",
    prerequisites: ["structs"],
    lessons: [
      {
        id: "interface-basics",
        title: "Implicit satisfaction",
        minutes: 11,
        xp: 70,
        status: "ready",
        summary: "Behavioral contracts, nil interfaces, and accepting interfaces.",
        sections: [
          {
            paragraphs: [
              "An interface is satisfied implicitly — any type with the right methods implements it, with no declaration. Design interfaces small, at the consumer's side: the interface you need, not the interface a concrete type happens to offer.",
            ],
            code: {
              source: 'type Stringer interface {\n\tString() string\n}\n\ntype Point struct{ X, Y int }\n\nfunc (p Point) String() string {\n\treturn fmt.Sprintf("(%d, %d)", p.X, p.Y)\n}\n\nfunc main() {\n\tvar s Stringer = Point{3, 4}\n\tfmt.Println(s) // (3, 4)\n}',
            },
            callout: {
              tone: "info",
              text: "A non-nil interface holding a nil pointer is a classic bug: the interface itself is not nil.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "How does a type declare that it implements an interface in Go?",
            choices: [
              { id: "a", label: "With the implements keyword" },
              { id: "b", label: "Implicitly, by providing the methods" },
              { id: "c", label: "By registering in init()" },
              { id: "d", label: "By embedding the interface" },
            ],
            correctChoiceId: "b",
            explanation:
              "Go uses structural typing — if the method set matches, assignment to the interface compiles.",
          },
        ],
      },
      {
        id: "interface-values",
        title: "Type assertions and switches",
        minutes: 8,
        xp: 50,
        status: "outline",
        summary: "Extracting concrete values safely at API boundaries.",
      },
    ],
  },
  {
    id: "errors",
    order: 9,
    title: "Errors",
    objective: "Create, wrap, and inspect errors like production Go code.",
    icon: "alert",
    prerequisites: ["functions", "interfaces"],
    lessons: [
      {
        id: "error-handling",
        title: "Creating and wrapping errors",
        minutes: 10,
        xp: 60,
        status: "ready",
        summary: "errors.New, fmt.Errorf with %w, and errors.Is/As.",
        sections: [
          {
            paragraphs: [
              "Errors are values. Create them with errors.New or fmt.Errorf. Wrap with %w to preserve a chain you can inspect later with errors.Is (sentinel/equality) and errors.As (typed extraction).",
            ],
            code: {
              source: 'var ErrNotFound = errors.New("not found")\n\nfunc findUser(id int) (string, error) {\n\tif id != 1 {\n\t\treturn "", fmt.Errorf("find user %d: %w", id, ErrNotFound)\n\t}\n\treturn "ada", nil\n}\n\nfunc main() {\n\t_, err := findUser(2)\n\tif errors.Is(err, ErrNotFound) {\n\t\tfmt.Println("handled not-found")\n\t}\n}',
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "Which function unwraps an error chain to find a sentinel error?",
            choices: [
              { id: "a", label: "errors.Is" },
              { id: "b", label: "errors.Uwrap" },
              { id: "c", label: "fmt.Sprint" },
              { id: "d", label: "errors.Cause" },
            ],
            correctChoiceId: "a",
            explanation:
              "errors.Is walks the chain comparing with ==; errors.As walks it trying a type assertion.",
          },
        ],
      },
      {
        id: "error-patterns",
        title: "Sentinels, types, and when to panic",
        minutes: 9,
        xp: 60,
        status: "outline",
        summary: "Designing error surfaces for library and application code.",
      },
    ],
  },
  {
    id: "goroutines",
    order: 10,
    title: "Goroutines and Channels",
    objective: "Run concurrent work safely and communicate over channels.",
    icon: "thread",
    prerequisites: ["errors"],
    lessons: [
      {
        id: "channels",
        title: "Goroutines and channels",
        minutes: 12,
        xp: 80,
        status: "ready",
        summary: "go, unbuffered vs buffered channels, close, and range.",
        sections: [
          {
            paragraphs: [
              "A goroutine is a lightweight, multiplexed thread of execution started with go. Channels let goroutines communicate by passing values. Unbuffered channels synchronize sender and receiver; buffered channels decouple up to their capacity.",
            ],
            code: {
              source: 'func main() {\n\tresults := make(chan int)\n\n\tgo func() {\n\t\tresults <- 41 + 1 // blocks until received\n\t}()\n\n\tvalue := <-results\n\tfmt.Println(value) // 42\n\n\tclose(results)\n}',
            },
            callout: {
              tone: "warning",
              text: "Sending on a closed channel panics; receiving yields zero values. Usually the sender should close.",
            },
          },
        ],
        quiz: [
          {
            id: "q1",
            prompt: "Who should generally close a channel?",
            choices: [
              { id: "a", label: "The receiver" },
              { id: "b", label: "The sender" },
              { id: "c", label: "The garbage collector" },
              { id: "d", label: "Either, randomly" },
            ],
            correctChoiceId: "b",
            explanation:
              "Closing is a signal that no more values will be sent — so the sender owns that decision.",
          },
        ],
      },
      {
        id: "select",
        title: "select and timeouts",
        minutes: 9,
        xp: 70,
        status: "outline",
        summary: "Waiting on multiple channels and bounding work with time.",
      },
      {
        id: "sync-primitives",
        title: "Mutexes and sync.WaitGroup",
        minutes: 9,
        xp: 70,
        status: "outline",
        summary: "When shared memory needs locks instead of channels.",
      },
    ],
  },
  {
    id: "concurrency",
    order: 11,
    title: "Concurrency Patterns",
    objective: "Fan-out/fan-in, worker pools, context cancellation, and the race detector.",
    icon: "network",
    prerequisites: ["goroutines"],
    lessons: [
      {
        id: "worker-pools",
        title: "Worker pools",
        minutes: 12,
        xp: 80,
        status: "outline",
        summary: "Bound concurrency, feed a job channel, collect results.",
      },
      {
        id: "context",
        title: "Cancellation with context",
        minutes: 11,
        xp: 80,
        status: "outline",
        summary: "Propagate deadlines and cancellation through call graphs.",
      },
      {
        id: "race-detector",
        title: "Testing with -race",
        minutes: 7,
        xp: 50,
        status: "outline",
        summary: "Detect data races in CI before your users do.",
      },
    ],
  },
  {
    id: "networking",
    order: 12,
    title: "Networking and HTTP",
    objective: "Build HTTP services and clients with net/http.",
    icon: "server",
    prerequisites: ["concurrency"],
    lessons: [
      {
        id: "http-server",
        title: "Your first HTTP server",
        minutes: 12,
        xp: 80,
        status: "outline",
        summary: "Handlers, routing, middleware, and graceful shutdown.",
      },
      {
        id: "http-client",
        title: "Robust HTTP clients",
        minutes: 10,
        xp: 70,
        status: "outline",
        summary: "Timeouts, context, connection reuse, and error handling.",
      },
    ],
  },
  {
    id: "testing",
    order: 13,
    title: "Testing and Tooling",
    objective: "Write table-driven tests, use go vet, and structure projects.",
    icon: "flask",
    prerequisites: ["functions"],
    lessons: [
      {
        id: "table-tests",
        title: "Table-driven tests",
        minutes: 11,
        xp: 70,
        status: "outline",
        summary: "The dominant Go testing style, with subtests and t.Run.",
      },
      {
        id: "mocking",
        title: "Fakes over mocks",
        minutes: 9,
        xp: 60,
        status: "outline",
        summary: "Prefer hand-rolled fakes and interfaces at seams.",
      },
    ],
  },
];

export function getModule(id: string): CourseModule | undefined {
  return CURRICULUM.find((module) => module.id === id);
}

export function getLesson(
  moduleId: string,
  lessonId: string,
): { module: CourseModule; lesson: (typeof CURRICULUM)[number]["lessons"][number] } | undefined {
  const module = getModule(moduleId);
  if (!module) return undefined;
  const lesson = module.lessons.find((entry) => entry.id === lessonId);
  if (!lesson) return undefined;
  return { module, lesson };
}

export function allLessons(): { module: CourseModule; lessonId: string }[] {
  return CURRICULUM.flatMap((module) =>
    module.lessons.map((lesson) => ({ module, lessonId: lesson.id })),
  );
}

export function totalLessons(): number {
  return CURRICULUM.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function readyLessons(): number {
  return CURRICULUM.reduce(
    (sum, module) => sum + module.lessons.filter((l) => l.status === "ready").length,
    0,
  );
}

export function nextLesson(
  moduleId: string,
  lessonId: string,
): { module: CourseModule; lessonId: string } | undefined {
  const flat = allLessons();
  const index = flat.findIndex(
    (entry) => entry.module.id === moduleId && entry.lessonId === lessonId,
  );
  if (index === -1 || index === flat.length - 1) return undefined;
  return flat[index + 1];
}

export function previousLesson(
  moduleId: string,
  lessonId: string,
): { module: CourseModule; lessonId: string } | undefined {
  const flat = allLessons();
  const index = flat.findIndex(
    (entry) => entry.module.id === moduleId && entry.lessonId === lessonId,
  );
  if (index <= 0) return undefined;
  return flat[index - 1];
}

export function findModule(id: string): CourseModule | undefined {
  return CURRICULUM.find((module) => module.id === id);
}

export type PlannedModule = {
  id: string;
  title: string;
  objective: string;
  order: number;
  prerequisiteIds: string[];
};

/** Roadmap modules that are outlined but not yet published. */
export const CURRICULUM_PLANNED: PlannedModule[] = [
  {
    id: "generics",
    title: "Generics",
    objective: "Write type-parameterized functions and constraints.",
    order: 14,
    prerequisiteIds: ["interfaces"],
  },
  {
    
    id: "modules-tooling",
    title: "Modules and Tooling",
    objective: "Version dependencies, structure repos, and automate with go generate.",
    order: 15,
    prerequisiteIds: ["testing"],
  },
  {
    id: "deployment",
    title: "Deployment",
    objective: "Containerize, configure, and ship Go services.",
    order: 16,
    prerequisiteIds: ["networking"],
  },
];


export function findLesson(
  moduleId: string,
  lessonId: string,
):
  | {
      module: CourseModule;
      lesson: (typeof CURRICULUM)[number]["lessons"][number];
      prev: (typeof CURRICULUM)[number]["lessons"][number] | null;
      next: (typeof CURRICULUM)[number]["lessons"][number] | null;
      nextModule: CourseModule | null;
    }
  | null {
  const moduleIndex = CURRICULUM.findIndex((module) => module.id === moduleId);
  if (moduleIndex < 0) return null;
  const module = CURRICULUM[moduleIndex];
  if (!module) return null;
  const lessonIndex = module.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (lessonIndex < 0) return null;
  const lesson = module.lessons[lessonIndex];
  if (!lesson) return null;
  return {
    module,
    lesson,
    prev: module.lessons[lessonIndex - 1] ?? null,
    next: module.lessons[lessonIndex + 1] ?? null,
    nextModule: CURRICULUM[moduleIndex + 1] ?? null,
  };
}

