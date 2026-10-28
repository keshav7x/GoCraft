
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
  Sparkles,
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
    color: "bg-blue-100 text-blue-700",
    xp: 2840,
    streak: 12,
    online: true,
  },
  {
    id: "2",
    name: "Priya Verma",
    username: "@priyadev",
    initials: "PV",
    color: "bg-pink-100 text-pink-700",
    xp: 2510,
    streak: 8,
    online: true,
  },
  {
    id: "3",
    name: "Rohan Gupta",
    username: "@rohancodes",
    initials: "RG",
    color: "bg-amber-100 text-amber-700",
    xp: 1920,
    streak: 5,
    online: false,
  },
  {
    id: "4",
    name: "Ananya Das",
    username: "@ananyabuilds",
    initials: "AD",
    color: "bg-violet-100 text-violet-700",
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
  friend,
  size = "md",
}: {
  friend: Friend;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]} ${friend.color}`}
    >
      {friend.initials}
      {friend.online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="XP transfer"
    >
      {/* Expanding opening burst */}
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
          className="absolute inset-0 bg-emerald-50"
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
          className="fixed right-5 top-5 z-30 rounded-full border border-black/10 bg-white p-2.5 text-gray-600 transition hover:bg-gray-100"
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
                  className="absolute inset-0 rounded-full border-[3px] border-emerald-100"
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
                  className="absolute inset-2 rounded-full border-[3px] border-transparent border-r-emerald-500 border-t-emerald-500"
                  animate={reducedMotion ? {} : { rotate: 360 }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                  <Coins size={35} strokeWidth={1.8} />
                </div>
              </div>

              <motion.p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700"
                animate={
                  reducedMotion ? {} : { opacity: [0.55, 1, 0.55] }
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {stage === "blast" ? "Initiating transfer" : "Processing"}
              </motion.p>

              <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
                Sending {amount} XP
              </h2>

              <div className="mt-5 flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-2">
                <Avatar friend={friend} size="sm" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {friend.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {friend.username}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs text-gray-500">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
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
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/25"
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

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Transfer complete
              </p>

              <h2 className="text-4xl font-semibold tracking-tight text-gray-950">
                Sent successfully!
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                {friend.name} just received your XP.
              </p>

              <motion.p
                className="mt-7 text-5xl font-semibold tracking-tight text-emerald-600"
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
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <Check size={29} strokeWidth={3} />
              </div>

              <p className="text-sm font-medium text-emerald-700">
                Transaction successful
              </p>

              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-gray-950">
                {amount} XP
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Sent to {friend.name}
              </p>

              <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <ArrowUpRight size={21} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        XP transfer
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        GoCraft community
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-emerald-600">
                    Success
                  </span>
                </div>

                <div className="space-y-4 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Recipient</span>
                    <span className="text-right font-medium text-gray-900">
                      {friend.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Username</span>
                    <span className="text-right font-medium text-gray-900">
                      {friend.username}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Amount sent</span>
                    <span className="font-semibold text-gray-900">
                      {amount} XP
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium text-emerald-600">
                      Completed
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-xs text-gray-600">
                      {reference}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onDone}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99]"
              >
                Done
                <ArrowDown size={16} />
              </button>

              <p className="mt-4 text-xs text-gray-400">
                Demo XP transfer · No real payment involved
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {stage !== "receipt" && (
          <button
            onClick={onBack}
            className="mt-10 text-sm text-gray-400 transition hover:text-gray-700"
          >
            Cancel animation
          </button>
        )}
      </main>
    </motion.div>
  );
}

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

  const leaderboard = [
    { name: "You", xp: balance + 3750, initials: "YO", self: true },
    ...friends.map((friend) => ({
      name: friend.name,
      xp: friend.xp,
      initials: friend.initials,
      self: false,
    })),
  ].sort((a, b) => b.xp - a.xp);

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
    <section className="bg-white px-5 py-20 text-gray-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 border-b border-gray-200 pb-8 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
                <Users size={14} />
                Learn together
              </div>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Your people.
                <br />
                <span className="text-gray-400">Your progress.</span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-500 sm:text-base">
                Learn with friends, compete on the leaderboard, and share XP
                when someone deserves a boost.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-gray-200 px-4 py-3 sm:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Coins size={21} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Your XP balance</p>
                <p className="text-xl font-semibold tabular-nums">
                  {balance.toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Friends */}
          <Reveal>
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Your friends
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {friends.length} people in your circle
                  </p>
                </div>

                <button
                  onClick={() =>
                    setNotice("Friend invitations will be available soon.")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium transition hover:bg-gray-50"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add friends</span>
                </button>
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search friends..."
                aria-label="Search friends"
                className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />

              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 px-4">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 py-4"
                  >
                    <Avatar friend={friend} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {friend.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {friend.username}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles size={12} />
                          {friend.xp.toLocaleString()} XP
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Flame size={12} className="text-orange-500" />
                          {friend.streak} day streak
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openSend(friend)}
                      aria-label={`Send XP to ${friend.name}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gray-950 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 active:scale-[0.97]"
                    >
                      <Send size={14} />
                      <span className="hidden sm:inline">Send XP</span>
                    </button>
                  </div>
                ))}

                {filteredFriends.length === 0 && (
                  <p className="py-10 text-center text-sm text-gray-500">
                    No friends found.
                  </p>
                )}
              </div>

              {notice && (
                <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <p>{notice}</p>
                  <button
                    onClick={() => setNotice("")}
                    aria-label="Dismiss message"
                    className="shrink-0 text-gray-400 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </Reveal>

          {/* Leaderboard */}
          <Reveal>
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-semibold tracking-tight">
                  Leaderboard
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  A little friendly competition.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
                  <span className="text-sm font-medium text-gray-700">
                    This week
                  </span>
                  <Trophy size={17} className="text-amber-500" />
                </div>

                <div className="divide-y divide-gray-100 px-4">
                  {leaderboard.slice(0, 5).map((person, index) => (
                    <div
                      key={person.name}
                      className={`flex items-center gap-3 py-4 ${
                        person.self ? "rounded-xl bg-emerald-50/70 px-2" : ""
                      }`}
                    >
                      <div className="flex w-6 shrink-0 justify-center">
                        {index === 0 ? (
                          <Crown size={18} className="text-amber-500" />
                        ) : (
                          <span className="text-sm font-medium text-gray-400">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          person.self
                            ? "bg-gray-950 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {person.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {person.name}
                          {person.self && (
                            <span className="ml-2 text-xs font-normal text-emerald-700">
                              You
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {index === 0
                            ? "Leading the pack"
                            : `${index + 1}${index === 1 ? "nd" : index === 2 ? "rd" : "th"} place`}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-gray-900">
                          {person.xp.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">XP</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 px-5 py-4">
                  <p className="text-xs leading-5 text-gray-500">
                    Keep learning and completing challenges to climb the
                    leaderboard.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Send XP confirmation modal */}
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
              className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl sm:p-7"
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
                  className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={18} />
                </button>

                <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                  XP transfer
                </span>

                <button
                  onClick={() => setShowSendModal(false)}
                  aria-label="Close send dialog"
                  className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Coins size={30} />
                </div>

                <h3
                  id="send-xp-title"
                  className="mt-4 text-2xl font-semibold tracking-tight"
                >
                  Send XP
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Give a friend a little boost.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                <Avatar friend={selectedFriend} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {selectedFriend.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedFriend.username}
                  </p>
                </div>
                <Check size={18} className="text-emerald-600" />
              </div>

              <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                <p className="text-center text-xs font-medium text-gray-500">
                  Amount to send
                </p>

                <div className="mt-3 flex items-center justify-center gap-5">
                  <button
                    onClick={() =>
                      setAmount((current) => Math.max(50, current - 50))
                    }
                    disabled={amount <= 50}
                    aria-label="Decrease XP amount"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 disabled:opacity-30"
                  >
                    <span className="text-xl">−</span>
                  </button>

                  <div className="min-w-[120px] text-center">
                    <p className="text-4xl font-semibold tracking-tight tabular-nums">
                      {amount}
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      XP
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setAmount((current) => Math.min(500, current + 50))
                    }
                    disabled={amount >= 500}
                    aria-label="Increase XP amount"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Plus size={17} />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                        amount === preset
                          ? "border-gray-950 bg-gray-950 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Available balance</span>
                <span className="font-semibold tabular-nums">
                  {balance.toLocaleString()} XP
                </span>
              </div>

              {notice && (
                <p className="mt-3 text-sm text-red-600">{notice}</p>
              )}

              <button
                onClick={confirmTransfer}
                disabled={amount > balance || amount < 50}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm & send
                <ChevronRight size={17} />
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Demo transfer · Maximum 500 XP
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen payment-style experience */}
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
