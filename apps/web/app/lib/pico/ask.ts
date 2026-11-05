import type { PicoContext } from "./context";
import { quoteDigest } from "./context";
import type { PicoMessage } from "./types";

/**
 * Pico — GoCraft's learning companion.
 *
 * No AI backend exists in this codebase today (verified: no model/provider
 * integration anywhere in apps/api or apps/web). Per the product brief this
 * module is the single, deliberately isolated integration point: every
 * question flows through `askPico`, which today answers with a local
 * heuristic grounded in the lesson context. To connect a real model,
 * replace the body of `askPico` with a call to your endpoint — the
 * signature (context + history + question → answer) is the contract and
 * must stay stable. Do not add a second AI path elsewhere.
 */

export type AskPicoInput = {
  context: PicoContext;
  /** Prior turns, oldest first. Used for hint escalation and variety. */
  history: PicoMessage[];
  question: string;
};

const SIMULATED_LATENCY_MS: [number, number] = [450, 950];

export async function askPico({
  context,
  history,
  question,
}: AskPicoInput): Promise<string> {
  await new Promise((r) =>
    setTimeout(r, SIMULATED_LATENCY_MS[0] + Math.random() * (SIMULATED_LATENCY_MS[1] - SIMULATED_LATENCY_MS[0])),
  );
  return answer(context, history, question.trim());
}

/* ------------------------------------------------------------------ */
/* Go concept knowledge base — short, honest, beginner-friendly          */
/* ------------------------------------------------------------------ */

type Explainer = { match: RegExp; say: string; followUp: string };

const EXPLAINERS: Explainer[] = [
  {
    match: /\bgoroutine(s)?\b/,
    say: "A goroutine is a lightweight thread managed by the Go runtime — think of it as a worker you spin up with the `go` keyword. They're cheap enough to start thousands of, but they share memory by communicating, not by locking everything down.",
    followUp: "If two goroutines both write to the same variable, what do you think happens?",
  },
  {
    match: /\bchannel(s)?\b/,
    say: "A channel is a typed pipe between goroutines. One side sends, the other receives, and by default both sides block until the other is ready — that synchronization is the feature, not a side effect.",
    followUp: "What do you suppose happens to a send with no receiver listening?",
  },
  {
    match: /\bslice(s)?\b/,
    say: "A slice is a view over an underlying array: pointer + length + capacity. Appending may or may not allocate a new array, which is why two slices can end up sharing memory — a classic Go footgun.",
    followUp: "If `append` exceeds capacity, what must the runtime do before writing the new element?",
  },
  {
    match: /\bpointer(s)?\b|\baddress(es)?\b|\bvalue receiver/,
    say: "A pointer holds the address of a value instead of the value itself. Use one when you want a function to observe or mutate the original, or when the value is large and copying is wasteful.",
    followUp: "When would copying a struct be totally fine, and when would it silently break your logic?",
  },
  {
    match: /\binterface(s)?\b/,
    say: "An interface defines behavior — a set of method signatures — and any type that implements them satisfies it implicitly. No `implements` keyword, no inheritance tree; capability is all that matters.",
    followUp: "Why do you think Go chose implicit satisfaction over explicit declarations?",
  },
  {
    match: /\bstruct(s)?\b/,
    say: "A struct groups fields under one named type — Go's answer to records/classes. Behavior comes from attaching methods with a receiver; composition comes from embedding other structs.",
    followUp: "What would happen if you embedded the same named type twice?",
  },
  {
    match: /\bmutex(es)?\b|\bsync\./,
    say: "A `sync.Mutex` is a lock around a critical section — one goroutine at a time inside, everyone else waits. It's the blunt instrument; channels are the structured one. Both are valid, misuse is what differs.",
    followUp: "What could go wrong if one code path forgets to unlock?",
  },
  {
    match: /\bdefer\b/,
    say: "`defer` schedules a call to run when the surrounding function returns — LIFO order. Reach for it for cleanup: closing files, unlocking mutexes, rolling back — so the cleanup can't be skipped by an early return.",
    followUp: "If a deferred call and a return value interact, which sees which — and does it surprise you?",
  },
  {
    match: /\berror(s)?\b/,
    say: "Errors are ordinary values in Go — a function returns `error` and you check it immediately instead of catching exceptions. The discipline is the point: every failure path stays visible in the code.",
    followUp: "Why might ignoring an error with `_` compile and still be a bug?",
  },
  {
    match: /\bmap(s)?\b/,
    say: "Maps are Go's hash tables — unordered key→value. Reads on a missing key give the zero value, so use the two-value form `v, ok := m[k]` when absence matters. Maps are reference types: passing one copies the header, not the data.",
    followUp: "What does iterating a map guarantee about order — and why does that matter for tests?",
  },
  {
    match: /\bgenerics?\b|\[T any\]/,
    say: "Generics let one function or type serve many concrete types via type parameters and constraints. Write ordinary code first, generalize when the duplication is real — Go culture favors boring clarity over abstraction.",
    followUp: "What's the cost of an overly-generic signature nobody can read six months later?",
  },
  {
    match: /\bdeadlock\b/,
    say: "A deadlock is everyone waiting for someone who never comes — commonly an unbuffered channel send with no receiver, or locks acquired in opposite orders. Go's runtime can even detect the classic 'all goroutines are asleep' case.",
    followUp: "Sketch a two-goroutine deadlock with a single channel. Where exactly does it seize up?",
  },
  {
    match: /\brange\b/,
    say: "`range` walks slices, arrays, maps, and channels, yielding index/value (or key/value, or channel values). It copies the value each iteration — so taking the address of the loop variable is a famous trap.",
    followUp: "If you `go` a closure inside a range loop, which copy of the variable does it capture?",
  },
  {
    match: /\bcapacity\b|\bcap\(/,
    say: "Capacity is how much room a slice has before Go must grow the backing array. Length is what you use; capacity is what you need to understand when performance matters — preallocate with `make([]T, 0, n)` when you know n.",
    followUp: "Why does doubling capacity amortize the cost of growth so well?",
  },
];

const ANSWER_SEEKING =
  /(give|show|tell)\s+me\s+(the\s+)?(answer|solution)|what('s| is)\s+the\s+(answer|solution)|just\s+tell|spoil/i;

const HINT_SEEKING =
  /\b(hint|stuck|help\s+me|don'?t\s+(understand|get)|lost|confused|walk\s+me\s+through)\b/i;

const QUIZ_ME = /\b(quiz|test|check)\s+me\b|test\s+my\s+understanding/i;

const GREETING = /^(hi|hello|hey|yo|sup)\b/i;
const THANKS = /\b(thanks|thx|ty|thank you)\b/i;

function hintEscalation(history: PicoMessage[]): number {
  // Count prior Pico replies that already contain hints → escalate depth.
  return history.filter(
    (m) => m.role === "pico" && /nudge|hint/i.test(m.text),
  ).length;
}

function anchor(ctx: PicoContext): string {
  return (
    ctx.headings[0] ??
    ctx.objectives[0] ??
    ctx.lessonDescription ??
    ctx.lessonTitle
  );
}

function hintReply(ctx: PicoContext, history: PicoMessage[]): string {
  const depth = hintEscalation(history);

  if (ctx.challengeTitles.length > 0) {
    const t = ctx.challengeTitles[0]!;
    if (depth === 0) {
      return `Happy to nudge without spoiling "${t}". Start from the requirements list and ask: which one is doing the real work here? Trace the example input by hand before writing any code.\n\nWhat have you tried so far?`;
    }
    if (depth === 1) {
      return `Okay, a deeper nudge. For "${t}": break the problem into (1) the smallest input, (2) the transformation each line needs, (3) what the grader expects on stdout or in the answer field. Solve exactly one of those three and we'll build from there.\n\nWhich part feels shakiest — parsing, transformation, or output?`;
    }
    return `Alright — strong hint, still yours to finish. The intended move in "${t}" is almost always visible in the starter code: name the invariant (what stays true each iteration), write that as the loop body, then wire input→output around it. Compare your output against the visible test cases one at a time rather than all at once.\n\nWant to walk through your current code line by line?`;
  }

  if (ctx.objectives.length > 0) {
    const o = ctx.objectives[0]!;
    if (depth === 0) {
      return `Here's a nudge: restate the goal in your own words first — "${o}". Usually the confusion lives in one noun or verb in that sentence. Which word feels fuzzy to you?`;
    }
    return `Deeper nudge: the lesson builds this in pieces — ${
      ctx.headings.slice(0, 3).join(" → ") || "step by step"
    }. Skim just the first of those sections and tell me in one sentence what it claims. I'll check your understanding and we'll keep going.`;
  }

  return `Let me nudge instead of hand it over. Go back to where "${anchor(
    ctx,
  )}" is explained — read only that far, then say it back to me in your words. Catching the misunderstanding is the real win here.\n\nWhat do you remember from that section?`;
}

function quizReply(ctx: PicoContext): string {
  const heading = ctx.headings[0] ?? ctx.lessonTitle;
  const objective = ctx.objectives[0];
  const visual = ctx.visuals[0];
  if (visual) {
    return `Challenge accepted. Look at the "${visual.title}" ${visual.kind.toLowerCase()} on the right:\n\nWhich single thing in it changed the most when you interacted with it, and what does that tell you about how the underlying mechanism works?\n\nAnswer in two sentences — then I'll push back.`;
  }
  if (objective) {
    return `Here's one for you. Without scrolling back:\n\n"${objective}"\n\nExplain it to a friend who has never written Go, in two sentences, without using jargon from the lesson. Go.`;
  }
  return `Here's one. The section "${heading}" makes a claim — find it, and give me the strongest argument against it. If you can't argue against it, you don't quite own it yet.`;
}

function answerSeekingReply(ctx: PicoContext, history: PicoMessage[]): string {
  const base = hintReply(ctx, history);
  return `I'm not going to hand you the answer — but here's how to get it yourself.\n\n${base}`;
}

function quoteIfPossible(ctx: PicoContext): string | null {
  return quoteDigest(ctx.textDigest, "", 220);
}

export function answer(
  ctx: PicoContext,
  history: PicoMessage[],
  question: string,
): string {
  const q = question.replace(/\s+/g, " ").trim();
  const lower = q.toLowerCase();

  if (!q) {
    return `Ask me anything about "${ctx.lessonTitle}" — a concept, a line of code, or "I don't get this at all." I'll meet you there.`;
  }

  /* Greetings & gratitude ------------------------------------------ */
  if (GREETING.test(lower) && lower.length < 40) {
    const done = ctx.checks.challenge + ctx.checks.quiz;
    return `Hey! Good timing — you're in "${ctx.lessonTitle}". ${
      done > 0
        ? `There ${done === 1 ? "is" : "are"} ${done} interactive check${done === 1 ? "" : "s"} in here worth doing before moving on.`
        : `No quizzes in this one, so read closely and poke at the examples.`
    }\n\nWhat's on your mind?`;
  }
  if (THANKS.test(lower)) {
    return `Anytime. That's literally what I'm here for.\n\nOne last push before you click away — what's the one idea from "${ctx.lessonTitle}" you want to make sure survives the night?`;
  }

  /* Structured intents ---------------------------------------------- */
  if (QUIZ_ME.test(lower)) return quizReply(ctx);
  if (ANSWER_SEEKING.test(lower)) return answerSeekingReply(ctx, history);
  if (HINT_SEEKING.test(lower)) return hintReply(ctx, history);

  /* "Why" questions — anchor to objectives --------------------------- */
  if (/^why\b/.test(lower)) {
    const o = ctx.objectives[0];
    const quote = quoteIfPossible(ctx);
    return (
      (o
        ? `Fair challenge. The honest framing from this lesson: it wants you to walk away able to ${o.replace(/\.$/, "")}. That capability shows up the moment you read, debug, or review real Go — it's the difference between pattern-matching syntax and knowing what's actually happening in memory.`
        : `Fair challenge. Short answer: this exact material is load-bearing for every lesson after it — get the mental model now and the rest compounds; skip it and every future example feels like magic.`) +
      (quote ? `\n\nThe lesson itself puts it this way: "${quote}"` : "") +
      `\n\nWhy does it matter *to you* specifically — what are you hoping to build with it?`
    );
  }

  /* Keyword knowledge base ------------------------------------------- */
  for (const { match, say, followUp } of EXPLAINERS) {
    if (match.test(lower)) {
      const quote = quoteIfPossible(ctx);
      const section = ctx.headings.find((h) => match.test(h)) ?? ctx.headings[0];
      return (
        `${say}` +
        (section ? `\n\nThat's the thread running through "${section}" in this lesson.` : "") +
        (quote && match.test(ctx.textDigest.toLowerCase()) ? `\n\nNearby in the text: "${quote}"` : "") +
        `\n\n${followUp}`
      );
    }
  }

  /* Explain / what-is fallback with lesson grounding ------------------ */
  if (/^(what|how|explain|describe|clarify|can you explain)\b/.test(lower)) {
    const section =
      ctx.headings.find((h) =>
        lower.split(" ").some((w) => w.length > 3 && h.toLowerCase().includes(w)),
      ) ?? ctx.headings[0];
    const quote = quoteIfPossible(ctx);
    return (
      (section
        ? `Let's unpack "${section}". The core move there is: ${
            ctx.objectives[0] ?? `understand what the example is demonstrating before looking at the result`
          }. Read the example slowly — every line is doing one job.`
        : `Let's slow this down. The key idea of this lesson is simpler than it looks once you see the pattern.`) +
      (quote ? `\n\nDirectly from the text: "${quote}"` : "") +
      `\n\nWhich line, word, or model feels fuzziest — the concept, or the code?`
    );
  }

  /* Visualizations ---------------------------------------------------- */
  if (/\b(diagram|visuali[sz]|figure|graphic|anim|simulation|lab)\b/.test(lower)) {
    const v = ctx.visuals[0];
    if (v) {
      return `Good instinct — the "${v.title}" ${v.kind.toLowerCase()} is the fastest way to build intuition here. Play with it: change one thing, predict the result, then check.\n\nWhat specifically did you want it to show you? I'll translate the mechanics into words.`;
    }
    return `This lesson doesn't ship an interactive diagram — its examples do the heavy lifting instead.\n\nWould you like me to walk through the main example line by line?`;
  }

  /* Generic fallback — grounded, rotates, always ends with a probe ---- */
  const sections = ctx.headings.slice(0, 3).join(" · ");
  const variants = [
    `Honest answer: that's beyond what I can ground in this lesson alone — but here's where I'd look. The likely-relevant sections are: ${
      sections || ctx.lessonTitle
    }. Start with the first one and compare it against your question.\n\nWhat did you already know about this before you asked?`,
    `Let me be precise instead of plausible. "${ctx.lessonTitle}" covers ${
      sections || "its core example end to end"
    } — if your question lives inside that, point me at the exact sentence and I'll dig in. If it's past the lesson, I'll say so.\n\nWhere did you hit the wall — the idea, or the syntax?`,
    `I want to make sure I answer the question you actually have. Here's my read: you're circling somewhere around ${
      ctx.headings[ctx.headings.length - 1] ?? anchor(ctx)
    }. Skim that once more and tell me the first thing that doesn't click.\n\nAlternatively, say "give me a hint" and I'll point, not solve.`,
  ];
  const idx = history.filter((m) => m.role === "pico").length % variants.length;
  return variants[idx]!;
}
