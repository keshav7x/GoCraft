"use client";

import { ArrowUpRight, Coins, Send, Zap } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { CURRENT_USER } from "../../../lib/demo-data";
import { useDemoStore as useProgressStore } from "../../../lib/progress-store";
import { getLevelInfo } from "../../../lib/levels";
import { useDemoStore } from "../../../lib/demo-store";
import { initialsOf } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { EmptyState } from "../../ui/empty-state";
import { Progress } from "../../ui/progress";
import { CountUp, Disclosure, Row, Section } from "./settings-shared";
import { SendXpDialog } from "./send-xp-dialog";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function WalletSection() {
  const balance = useProgressStore((s) => s.xp);
  const transactions = useProgressStore((s) => s.xpTransactions);
  const dailyGoal = useDemoStore((s) => s.settings.dailyGoal);
  const reduceMotion = useReducedMotion();
  const [sendOpen, setSendOpen] = useState(false);

  const level = useMemo(() => getLevelInfo(balance), [balance]);
  const totalSent = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  return (
    <Section
      id="wallet"
      title="XP wallet"
      description="Your single GoCraft currency — spendable XP, level progress, and transfer history."
      badge={<Badge variant="accent">Demo economy</Badge>}
    >
      <Row className="flex-col gap-4">
        <div className="flex w-full flex-col gap-4 rounded-xl border border-line bg-gradient-to-b from-sky-50/80 to-transparent p-4 dark:from-sky-500/[0.06] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-ink-3">Spendable XP</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-ink">
              <CountUp value={balance} reduce={reduceMotion} />
              <span className="ml-1.5 text-sm font-medium text-ink-3">XP</span>
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-ink-3">
              <Zap size={12} className="text-accent-600" />
              Level {level.level} · {level.title}
              {level.nextLevel ? (
                <span className="text-ink-4">
                  — {level.xpForLevel - level.xpIntoLevel} XP to Level{" "}
                  {level.nextLevel.level}
                </span>
              ) : (
                <span className="text-ink-4">— max level</span>
              )}
            </p>
            <Progress
              value={level.progress * 100}
              className="mt-2.5 max-w-xs"
              ariaLabel="Progress to next level"
            />
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={() => setSendOpen(true)}
            className="shrink-0 self-start sm:self-auto"
          >
            <Send size={15} />
            Send XP
          </Button>
        </div>

        <dl className="grid w-full grid-cols-3 gap-2">
          <div className="rounded-lg border border-line bg-panel-muted/50 px-3 py-2.5">
            <dt className="text-[11px] text-ink-3">Streak</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
              {CURRENT_USER.streakDays} days
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-panel-muted/50 px-3 py-2.5">
            <dt className="text-[11px] text-ink-3">Sent</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
              {totalSent.toLocaleString()} XP
            </dd>
          </div>
          <div className="rounded-lg border border-line bg-panel-muted/50 px-3 py-2.5">
            <dt className="text-[11px] text-ink-3">Daily goal</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
              {dailyGoal}/day
            </dd>
          </div>
        </dl>
      </Row>

      <div className="border-t border-line px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-medium text-ink">Recent transfers</p>
          <span className="text-[11px] text-ink-4">
            {transactions.length === 0
              ? "No transfers yet"
              : `${transactions.length} this session`}
          </span>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            className="mt-3 py-8"
            icon={ArrowUpRight}
            title="Nothing sent yet"
            description="Send a friend a boost and the receipt will appear here."
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {transactions.slice(0, 6).map((tx) => (
              <li
                key={tx.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-panel px-3 py-2.5"
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-[11px] font-semibold text-accent-strong dark:bg-sky-500/15"
                >
                  {initialsOf(tx.recipientName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {tx.recipientName}
                    <span className="ml-1.5 font-normal text-ink-3">
                      {tx.recipientHandle}
                    </span>
                  </p>
                  <p className="truncate text-[11px] text-ink-4">
                    {formatTime(tx.timestamp)} · {tx.reference}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-hard">
                  −{tx.amount.toLocaleString()} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Row className="border-t border-line">
        <p className="inline-flex items-start gap-2 text-xs leading-5 text-ink-3">
          <Coins size={13} className="mt-0.5 shrink-0 text-medium" />
          XP is GoCraft&apos;s only currency today — there are no separate
          coins. Transfers and history are recorded in this browser; no backend
          processes them.
        </p>
      </Row>

      <Disclosure>
        Send XP is a UI prototype: validation, confirmation, and receipts
        behave like the real flow, but a server must handle atomic balance
        changes, idempotency, and rate limits before real transfers go live.
      </Disclosure>

      <SendXpDialog open={sendOpen} onClose={() => setSendOpen(false)} />
    </Section>
  );
}
