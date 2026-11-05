import type { PicoContext } from "./context";
import { answer } from "./ask";
import type { PicoMessage } from "./types";

export type AskPicoInput = {
  question: string;
  /** Prior turns, oldest first. */
  history: Array<Pick<PicoMessage, "role" | "text">>;
  context: PicoContext;
};

/**
 * Compatibility wrapper around `./ask.ts`, which is the single,
 * deliberately isolated integration point for a future model. Everything
 * flows through `askPico` here → `answer` there, so there is exactly one
 * code path to replace when an AI backend is connected.
 */
export async function askPico({
  question,
  history,
  context,
}: AskPicoInput): Promise<string> {
  const normalized: PicoMessage[] = history.map((m, i) => ({
    id: `hist-${i}`,
    role: m.role,
    text: m.text,
  }));
  return answer(context, normalized, question);
}
