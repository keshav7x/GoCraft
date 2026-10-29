"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  Plus,
  Send,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Reveal } from "./Reveal";

type Friend = {
  id: string;
  name: string;
  username: string;
  initials: string;
  color: string;
  xp: number;
  streak: number;
  online: boolean;
};

type Stage = "blast" | "processing" | "success" | "receipt";

const INITIAL_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    username: "@aaravcodes",
    initials: "AS",
    color: "bg-blue-100 text-blue-600",
    xp: 2840,
    streak: 12,
    online: true,
  },
  {
    id: "2",
    name: "Priya Verma",
    username: "@priyadev",
    initials: "PV",
    color: "bg-pink-100 text-pink-600",
    xp: 2510,
    streak: 8,
    online: true,
  },
  {
    id: "3",
    name: "Rohan Gupta",
    username: "@rohancodes",
    initials: "RG",
    color: "bg-amber-100 text-amber-600",
    xp: 1920,
    streak: 5,
    online: false,
  },
  {
    id: "4",
    name: "Ananya Das",
    username: "@ananyabuilds",
    initials: "AD",
    color: "bg-violet-100 text-violet-600",
    xp: 1680,
    streak: 15,
    online: false,
  },
];

type Transfer = {
  friend: Friend;
  amount: number;
  reference: string;
};

function Avatar({
  initials,
  color,
  online,
  size = "md",
  showStatus = true,
}: {
  initials: string;
  color: string;
  online: boolean;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
}) {
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]} ${color}`}
    >
      {initials}
      {showStatus && online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      )}
    </div>
  );
}

function TransferExperience({
  transfer,
  onDone,
  onBack,
}: {
  transfer: Transfer;
  onDone: () => void;
  onBack: () => void;
}) {
  const [stage, setStage] = useState<Stage>("blast");
  const reducedMotion = useReducedMotion();
  const { friend, amount, reference } = transfer;

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage("processing"), 700),
      window.setTimeout(() => setStage("success"), 2500),
      window.setTimeout(() => setStage("receipt"), 3650),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, []);

  const duration = reducedMotion ? 0 : 0.4;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b0d12]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="XP transfer"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[38%] h-20 w-20 rounded-full bg-emerald-400"
          style={{ x: "-50%", y: "-50%" }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={
            stage === "blast"
              ? { scale: 18, opacity: 0 }
              : { scale: 0, opacity: 0 }
          }
          transition={{
            duration: reducedMotion ? 0 : 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
        />

        <motion.div
          className="absolute inset-0 bg-emerald-950/50"
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              stage === "success" || stage === "receipt" ? 1 : 0,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {stage === "receipt" && (
        <button
          onClick={onDone}
          aria-label="Close receipt"
          className="focus-visible:ring-2 focus-visible:ring-emerald-400/60 fixed right-5 top-5 z-30 rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 focus-visible:outline-none"
        >
          <X size={19} />
        </button>
      )}

      <main className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
        <AnimatePresence mode="wait">
          {(stage === "blast" || stage === "processing") && (
            <motion.div
              key="processing"
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration }}
            >
              <div className="relative mb-9 flex h-36 w-36 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border-[3px] border-emerald-400/20"
                  animate={
                    reducedMotion
                      ? {}
                      : {
                          scale: [1, 1.12, 1],
                          opacity: [0.8, 0.3, 0.8],
                        }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute inset-2 rounded-full border-[3px] border-transparent border-r-emerald-400 border-t-emerald-400"
                  animate={reducedMotion ? {} : { rotate: 360 }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/25">
                  <Coins size={35} strokeWidth={1.8} />
                </div>
              </div>

              <motion.p
                className="mb-3 text-xs font-medium text-emerald-400"
                animate={
                  reducedMotion ? {} : { opacity: [0.55, 1, 0.55] }
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {stage === "blast" ? "Initiating transfer" : "Processing"}
              </motion.p>

              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Sending {amount} XP
              </h2>

              <div className="mt-5 flex items-center gap-3 rounded-full border border-white/10 bg-[#12151d] px-3 py-2">
                <Avatar
                  initials={friend.initials}
                  color={friend.color}
                  online={friend.online}
                  size="sm"
                  showStatus={false}
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">
                    {friend.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {friend.username}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  animate={reducedMotion ? {} : { opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
                Please wait while we process this
              </div>
            </motion.div>
          )}

          {stage === "success" && (
            <motion.div
              key="success"
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration,
                type: "spring",
                stiffness: 180,
                damping: 15,
              }}
            >
              <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
                {[0, 1, 2].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute inset-0 rounded-full border-2 border-emerald-400"
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={
                      reducedMotion
                        ? { scale: 1, opacity: 0 }
                        : { scale: 1.65 + ring * 0.23, opacity: 0 }
                    }
                    transition={{
                      duration: reducedMotion ? 0 : 0.9,
                      delay: reducedMotion ? 0 : ring * 0.13,
                      ease: "easeOut",
                    }}
                  />
                ))}

                <motion.div
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30"
                  initial={{ scale: 0.4, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration,
                    type: "spring",
                    stiffness: 220,
                    damping: 12,
                  }}
                >
                  <svg viewBox="0 0 52 52" className="h-14 w-14">
                    <motion.path
                      d="M13 27 L22 36 L40 17"
                      fill="none"
                      stroke="white"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.45,
                        delay: reducedMotion ? 0 : 0.15,
                      }}
                    />
                  </svg>
                </motion.div>
              </div>

              <p className="mb-3 text-xs font-medium text-emerald-400">
                Transfer complete
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">
                Sent successfully!
              </h2>

              <p className="mt-3 text-sm text-slate-400">
                {friend.name} just received your XP.
              </p>

              <motion.p
                className="mt-7 text-5xl font-semibold tracking-[-0.04em] tabular-nums text-emerald-400"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : 0.2 }}
              >
                {amount} XP
              </motion.p>
            </motion.div>
          )}

          {stage === "receipt" && (
            <motion.div
              key="receipt"
              className="w-full"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.55,
                type: "spring",
                stiffness: 100,
                damping: 19,
              }}
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                <Check size={29} strokeWidth={3} />
              </div>

              <p className="text-sm font-medium text-emerald-400">
                Transaction successful
              </p>

              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] tabular-nums text-white">
                {amount} XP
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Sent to {friend.name}
              </p>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                <div className="flex items-center justify-between border-b border-dashed border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                      <ArrowUpRight size={21} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        XP transfer
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        GoCraft community
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-medium text-emerald-400">
                    Success
                  </span>
                </div>

                <div className="space-y-4 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Recipient</span>
                    <span className="text-right font-medium text-white">
                      {friend.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Username</span>
                    <span className="text-right font-medium text-white">
                      {friend.username}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Amount sent</span>
                    <span className="font-semibold tabular-nums text-white">
                      {amount} XP
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium text-emerald-400">
                      Completed
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Reference</span>
                    <span className="font-mono text-xs text-slate-300">
                      {reference}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onDone}
                className="focus-visible:ring-2 focus-visible:ring-emerald-400/60 mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.99] focus-visible:outline-none"
              >
                Done
                <ArrowDown size={16} />
              </button>

              <p className="mt-4 text-xs text-slate-500">
                Demo XP transfer · No real payment involved
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {stage !== "receipt" && (
          <button
            onClick={onBack}
            className="focus-visible:ring-2 focus-visible:ring-white/40 mt-10 text-sm text-slate-500 transition hover:text-slate-200 focus-visible:outline-none"
          >
            Cancel animation
          </button>
        )}
      </main>
    </motion.div>
  );
}

type Leader = {
  name: string;
  xp: number;
  initials: string;
  self: boolean;
  online: boolean;
  color: string;
};

export function FriendsSection() {
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [balance, setBalance] = useState(1250);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [amount, setAmount] = useState(100);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const reducedMotion = useReducedMotion();

  const filteredFriends = friends.filter((friend) => {
    const term = search.toLowerCase();
    return (
      friend.name.toLowerCase().includes(term) ||
      friend.username.toLowerCase().includes(term)
    );
  });

  const onlineCount = friends.filter((friend) => friend.online).length;

  const leaders: Leader[] = [
    {
      name: "You",
      xp: balance + 3750,
      initials: "YO",
      self: true,
      online: true,
      color: "bg-slate-900 text-white",
    },
    ...friends.map((friend) => ({
      name: friend.name,
      xp: friend.xp,
      initials: friend.initials,
      self: false,
      online: friend.online,
      color: friend.color,
    })),
  ].sort((a, b) => b.xp - a.xp);

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  function openSend(friend: Friend) {
    setSelectedFriend(friend);
    setAmount(100);
    setShowSendModal(true);
    setNotice("");
  }

  function confirmTransfer() {
    if (!selectedFriend || amount <= 0 || amount > balance) return;

    if (amount > 500) {
      setNotice("You can send up to 500 XP per transfer.");
      return;
    }

    const reference = `GC-${Date.now().toString(36).toUpperCase()}`;

    setTransfer({
      friend: selectedFriend,
      amount,
      reference,
    });

    setBalance((current) => current - amount);
    setFriends((current) =>
      current.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, xp: friend.xp + amount }
          : friend,
      ),
    );

    setShowSendModal(false);
  }

  function finishTransfer() {
    setTransfer(null);
    setSelectedFriend(null);
  }

  return (
    <section
      id="friends"
      className="w-full bg-white px-5 py-24 text-slate-900 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-8 border-b border-slate-200 pb-10 sm:flex-row sm:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
                </span>
                <Users size={13} className="text-slate-500" />
                {onlineCount} online now
              </div>

              <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-slate-900 sm:text-5xl">
                Your people.
                <br />
                <span className="text-slate-400">Your podium.</span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
                Learn together, climb the weekly leaderboard, and send XP
                when someone deserves a boost.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Coins size={21} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Wallet</p>
                <p className="text-xl font-semibold tabular-nums text-cyan-600">
                  {balance.toLocaleString()}
                  <span className="ml-1 text-sm font-medium text-slate-400">
                    XP
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <Reveal>
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    Your party
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {friends.length} in your circle
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNotice("Friend invitations will be available soon.")
                  }
                  className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add friends</span>
                </button>
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your party..."
                aria-label="Search friends"
                className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-cyan-400 focus-visible:bg-white"
              />

              <div className="mt-3 space-y-2.5">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-cyan-300 hover:bg-slate-50"
                  >
                    <Avatar
                      initials={friend.initials}
                      color={friend.color}
                      online={friend.online}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {friend.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {friend.username}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
                        <span className="tabular-nums text-cyan-600">
                          {friend.xp.toLocaleString()}
                          <span className="ml-1 text-slate-500">XP</span>
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-slate-500">
                          <Flame size={12} className="text-amber-500" />
                          {friend.streak} day streak
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openSend(friend)}
                      aria-label={`Send XP to ${friend.name}`}
                      className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-cyan-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 active:scale-[0.97] focus-visible:outline-none"
                    >
                      <Send size={14} />
                      <span className="hidden sm:inline">Send XP</span>
                    </button>
                  </div>
                ))}

                {filteredFriends.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No friends found.
                  </p>
                )}
              </div>

              {notice && (
                <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p>{notice}</p>
                  <button
                    onClick={() => setNotice("")}
                    aria-label="Dismiss message"
                    className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 shrink-0 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                  Weekly leaderboard
                </h3>
                <Trophy size={17} className="text-amber-500" />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid grid-cols-3 items-end gap-2 pt-5">
                  {[
                    { person: podium[1], rank: 2, block: "h-20 border-slate-200 bg-slate-100", numeral: "text-xl text-slate-700" },
                    { person: podium[0], rank: 1, block: "h-28 border-cyan-300 bg-gradient-to-b from-cyan-100 to-cyan-50", numeral: "text-2xl text-slate-900" },
                    { person: podium[2], rank: 3, block: "h-14 border-slate-200 bg-slate-100", numeral: "text-lg text-slate-600" },
                  ].map(({ person, rank, block, numeral }) =>
                    person ? (
                      <div
                        key={person.name}
                        className="flex flex-col items-center"
                      >
                        <div className="relative flex w-full justify-center">
                          {rank === 1 && (
                            <>
                              <div
                                aria-hidden
                                className="pointer-events-none absolute -top-3 left-1/2 h-16 w-24 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-2xl"
                              />
                              <Crown
                                size={16}
                                className="absolute -top-1.5 text-amber-500 drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]"
                              />
                            </>
                          )}
                          <div
                            className={`relative flex w-full items-end justify-center rounded-xl border ${block}`}
                          >
                            <span
                              className={`pb-2 font-semibold tabular-nums ${numeral}`}
                            >
                              {rank}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 flex flex-col items-center gap-1">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ${
                              person.self
                                ? "bg-slate-900 text-white"
                                : `${person.color}`
                            }`}
                          >
                            {person.initials}
                          </div>
                          <p className="max-w-full truncate px-1 text-xs font-medium text-slate-800">
                            {person.name}
                            {person.self && (
                              <span className="ml-1.5 font-normal text-cyan-600">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] tabular-nums text-cyan-600">
                            {person.xp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>

                {rest.length > 0 && (
                  <div className="mt-4 space-y-1 border-t border-slate-200 pt-3">
                    {rest.map((person, index) => (
                      <div
                        key={person.name}
                        className={`flex items-center gap-3 rounded-lg px-2 py-2 ${
                          person.self ? "bg-cyan-50" : ""
                        }`}
                      >
                        <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-slate-400">
                          {index + 4}
                        </span>
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                            person.self
                              ? "bg-slate-900 text-white"
                              : `${person.color}`
                          }`}
                        >
                          {person.initials}
                        </div>
                        <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                          {person.name}
                          {person.self && (
                            <span className="ml-1.5 font-normal text-cyan-600">
                              You
                            </span>
                          )}
                        </p>
                        <p className="shrink-0 text-xs font-medium tabular-nums text-cyan-600">
                          {person.xp.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
                  Finish lessons and challenges to climb.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <AnimatePresence>
        {showSendModal && selectedFriend && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSendModal(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="send-xp-title"
              className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:rounded-3xl sm:p-7"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 50, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 25, scale: 0.98 }
              }
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-7 flex items-center justify-between">
                <button
                  onClick={() => setShowSendModal(false)}
                  aria-label="Go back"
                  className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none"
                >
                  <ArrowLeft size={18} />
                </button>

                <button
                  onClick={() => setShowSendModal(false)}
                  aria-label="Close send dialog"
                  className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Coins size={30} />
                </div>

                <h3
                  id="send-xp-title"
                  className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-900"
                >
                  Send XP
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Give a friend a little boost.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Avatar
                  initials={selectedFriend.initials}
                  color={selectedFriend.color}
                  online={selectedFriend.online}
                  size="lg"
                  showStatus={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {selectedFriend.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedFriend.username}
                  </p>
                </div>
                <Check size={18} className="text-emerald-500" />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-center text-xs font-medium text-slate-500">
                  Amount to send
                </p>

                <div className="mt-3 flex items-center justify-center gap-5">
                  <button
                    onClick={() =>
                      setAmount((current) => Math.max(50, current - 50))
                    }
                    disabled={amount <= 50}
                    aria-label="Decrease XP amount"
                    className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none disabled:opacity-30"
                  >
                    <span className="text-xl">−</span>
                  </button>

                  <div className="min-w-[120px] text-center">
                    <p className="text-4xl font-semibold tracking-[-0.04em] tabular-nums text-slate-900">
                      {amount}
                    </p>
                    <p className="mt-1 text-xs font-medium text-cyan-600">
                      XP
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setAmount((current) => Math.min(500, current + 50))
                    }
                    disabled={amount >= 500}
                    aria-label="Increase XP amount"
                    className="focus-visible:ring-2 focus-visible:ring-cyan-500/40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none disabled:opacity-30"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`focus-visible:ring-2 focus-visible:ring-cyan-500/40 rounded-lg border px-2 py-2 text-xs font-semibold transition focus-visible:outline-none ${
                        amount === preset
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">Available balance</span>
                <span className="font-semibold tabular-nums text-slate-900">
                  {balance.toLocaleString()} XP
                </span>
              </div>

              {notice && (
                <p className="mt-3 text-sm text-red-500">{notice}</p>
              )}

              <button
                onClick={confirmTransfer}
                disabled={amount > balance || amount < 50}
                className="focus-visible:ring-2 focus-visible:ring-cyan-500/60 mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm &amp; send
                <ChevronRight size={17} />
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                Demo transfer · Maximum 500 XP
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transfer && (
          <TransferExperience
            key={transfer.reference}
            transfer={transfer}
            onDone={finishTransfer}
            onBack={finishTransfer}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
