"use client";

import { Check, Copy, Gift, Loader2, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FRIENDS } from "../../../lib/demo-data";
import {
  useDemoStore as useProgressStore,
  XP_TRANSFER_MAX,
  XP_TRANSFER_MIN,
  type XpSentTransaction,
} from "../../../lib/progress-store";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { Input, Label, Select, Textarea } from "../../ui/input";
import { CountUp } from "./settings-shared";

type Step = "form" | "confirm" | "success" | "receipt";

const RECIPIENTS = FRIENDS.filter((f) => f.status === "friend");
const QUICK_AMOUNTS = [50, 100, 250, 500] as const;
const MESSAGE_MAX = 140;

function validateAmount(raw: string, balance: number) {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: "Enter an amount." };
  const value = Number(trimmed);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { value: null, error: "Enter a whole number of XP." };
  }
  if (value < XP_TRANSFER_MIN) {
    return { value: null, error: `Minimum transfer is ${XP_TRANSFER_MIN} XP.` };
  }
  if (value > XP_TRANSFER_MAX) {
    return { value: null, error: `Maximum transfer is ${XP_TRANSFER_MAX} XP.` };
  }
  if (value > balance) {
    return { value: null, error: "That's more XP than you have available." };
  }
  return { value, error: null };
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SendXpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const balance = useProgressStore((s) => s.xp);
  const sendXp = useProgressStore((s) => s.sendXp);
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState<Step>("form");
  const [recipientId, setRecipientId] = useState("");
  const [amountRaw, setAmountRaw] = useState("100");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<XpSentTransaction | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const recipient = useMemo(
    () => RECIPIENTS.find((f) => f.id === recipientId) ?? null,
    [recipientId],
  );
  const amountCheck = validateAmount(amountRaw, balance);
  const remaining = amountCheck.value !== null ? balance - amountCheck.value : null;

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      document.getElementById("send-xp-recipient")?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  function reset() {
    setStep("form");
    setRecipientId("");
    setAmountRaw("100");
    setMessage("");
    setFormError(null);
    setTransferError(null);
    setTransaction(null);
    setNewBalance(null);
    setProcessing(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function goToConfirm() {
    setFormError(null);
    setTransferError(null);
    if (!recipient) {
      setFormError("Choose who to send XP to.");
      return;
    }
    if (amountCheck.error || amountCheck.value === null) {
      setFormError(amountCheck.error ?? "Enter a valid amount.");
      return;
    }
    setStep("confirm");
  }

  function confirmTransfer() {
    if (!recipient || amountCheck.value === null) {
      setStep("form");
      return;
    }
    setProcessing(true);
    setTransferError(null);

    // Local demo ledger: the store validates ownership, amount, and balance,
    // then returns a server-style transaction receipt. No network is involved.
    const result = sendXp({
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientHandle: recipient.handle,
      amount: amountCheck.value,
      message: message.trim() || undefined,
    });

    setProcessing(false);

    if (!result.ok) {
      setTransferError(result.error);
      setStep("form");
      toast.error("Transfer failed", { description: result.error });
      return;
    }

    setTransaction(result.transaction);
    setNewBalance(result.newBalance);
    setStep("success");

    window.setTimeout(
      () => setStep("receipt"),
      reduceMotion ? 350 : 1400,
    );
  }

  async function copyReference(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Reference copied");
    } catch {
      toast.error("Couldn't copy — select the text and copy manually.");
    }
  }

  const titles: Record<Step, string> = {
    form: "Send XP",
    confirm: "Confirm transfer",
    success: "Transfer complete",
    receipt: "XP sent successfully",
  };

  const descriptions: Record<Step, string | undefined> = {
    form: `Available balance: ${balance.toLocaleString()} XP. Transfers are ${XP_TRANSFER_MIN}–${XP_TRANSFER_MAX} XP.`,
    confirm: undefined,
    success: undefined,
    receipt: undefined,
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={titles[step]}
      description={descriptions[step]}
      className="max-h-[85dvh] overflow-y-auto sm:max-w-lg"
    >
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-line bg-panel-muted/60 px-3 py-2">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-success" />
        <p className="text-[11px] leading-4 text-ink-3">
          Prototype transfer — runs in your browser only. No real XP leaves
          your account and no payment is involved.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="send-xp-recipient">Recipient</Label>
              <Select
                id="send-xp-recipient"
                value={recipientId}
                onChange={(e) => {
                  setRecipientId(e.target.value);
                  setFormError(null);
                }}
                className="mt-1.5"
              >
                <option value="">Choose a friend…</option>
                {RECIPIENTS.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name} ({friend.handle})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="send-xp-amount">Amount (XP)</Label>
              <Input
                id="send-xp-amount"
                type="number"
                inputMode="numeric"
                min={XP_TRANSFER_MIN}
                max={XP_TRANSFER_MAX}
                step={1}
                value={amountRaw}
                onChange={(e) => {
                  setAmountRaw(e.target.value);
                  setFormError(null);
                }}
                className="mt-1.5"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmountRaw(String(preset));
                      setFormError(null);
                    }}
                    className={cn(
                      "focus-ring rounded-md border px-2 py-1 text-[11px] font-medium tabular-nums transition-colors",
                      amountRaw.trim() === String(preset)
                        ? "border-accent-600 bg-accent-50 text-accent-strong dark:bg-sky-500/10"
                        : "border-line bg-panel text-ink-3 hover:border-line-strong hover:text-ink",
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="send-xp-message">Message (optional)</Label>
                <span className="text-[11px] tabular-nums text-ink-4">
                  {message.length}/{MESSAGE_MAX}
                </span>
              </div>
              <Textarea
                id="send-xp-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                rows={2}
                placeholder="Nice solve on the rate limiter!"
                className="mt-1.5 resize-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-line bg-panel-muted/50 px-3 py-2.5 text-xs">
              <span className="text-ink-3">Available balance</span>
              <span className="font-semibold tabular-nums text-ink">
                {balance.toLocaleString()} XP
              </span>
            </div>

            {formError || transferError ? (
              <p role="alert" className="text-xs font-medium text-hard">
                {formError ?? transferError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={goToConfirm}>
                Review transfer
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === "confirm" && recipient && amountCheck.value !== null ? (
          <motion.div
            key="confirm"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <p className="text-sm leading-6 text-ink-2">
              Send{" "}
              <span className="font-semibold tabular-nums text-ink">
                {amountCheck.value.toLocaleString()} XP
              </span>{" "}
              to{" "}
              <span className="font-semibold text-ink">{recipient.name}</span>?
            </p>

            <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line text-[13px]">
              <div className="flex items-center justify-between gap-4 bg-panel-muted/40 px-4 py-3">
                <dt className="text-ink-3">Recipient</dt>
                <dd className="text-right font-medium text-ink">
                  {recipient.name}
                  <span className="ml-1.5 font-normal text-ink-3">
                    {recipient.handle}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-3">Amount</dt>
                <dd className="font-semibold tabular-nums text-ink">
                  {amountCheck.value.toLocaleString()} XP
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-3">Current balance</dt>
                <dd className="tabular-nums text-ink">
                  {balance.toLocaleString()} XP
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-3">Balance after transfer</dt>
                <dd className="tabular-nums text-ink">
                  {(remaining ?? 0).toLocaleString()} XP
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-ink-3">Fee</dt>
                <dd className="text-ink">None</dd>
              </div>
            </dl>

            {message.trim() ? (
              <p className="rounded-lg border border-line bg-panel-muted/50 px-3 py-2 text-xs leading-5 text-ink-2">
                “{message.trim()}”
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep("form")}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={confirmTransfer}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Transferring…
                  </>
                ) : (
                  "Confirm transfer"
                )}
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === "success" ? (
          <motion.div
            key="success"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center py-4 text-center"
          >
            <motion.div
              initial={reduceMotion ? false : { scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white shadow-lg shadow-success/25"
            >
              <Check size={26} strokeWidth={3} />
            </motion.div>
            <p className="mt-4 text-xs font-medium text-success">
              Transfer confirmed
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-ink">
              <CountUp value={transaction?.amount ?? 0} reduce={reduceMotion} /> XP
            </p>
            <p className="mt-1.5 text-xs text-ink-3">
              sent to {transaction?.recipientName}
            </p>
          </motion.div>
        ) : null}

        {step === "receipt" && transaction ? (
          <motion.div
            key="receipt"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 rounded-xl border border-easy/25 bg-easy-soft px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <Gift size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">
                  XP sent successfully
                </p>
                <p className="truncate text-xs text-ink-3">
                  {transaction.amount.toLocaleString()} XP to{" "}
                  {transaction.recipientName} ({transaction.recipientHandle})
                </p>
              </div>
            </div>

            <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line text-[13px]">
              <div className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-ink-3">Timestamp</dt>
                <dd className="text-right text-ink">
                  {formatTimestamp(transaction.timestamp)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-ink-3">New balance</dt>
                <dd className="font-medium tabular-nums text-ink">
                  {(newBalance ?? 0).toLocaleString()} XP
                </dd>
              </div>
              {transaction.message ? (
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="shrink-0 text-ink-3">Message</dt>
                  <dd className="text-right text-ink">“{transaction.message}”</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt className="text-ink-3">Reference</dt>
                <dd className="flex items-center gap-1.5">
                  <code className="rounded bg-panel-muted px-1.5 py-0.5 font-mono text-[11px] text-ink-2">
                    {transaction.reference}
                  </code>
                  <button
                    type="button"
                    aria-label="Copy reference"
                    onClick={() => copyReference(transaction.reference)}
                    className="focus-ring rounded p-1 text-ink-faint transition-colors hover:text-ink"
                  >
                    <Copy size={13} />
                  </button>
                </dd>
              </div>
            </dl>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyReference(transaction.reference)}
              >
                <Copy size={13} />
                Copy reference
              </Button>
              <Button variant="accent" size="sm" onClick={handleClose}>
                Done
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
}
