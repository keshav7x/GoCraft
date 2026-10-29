"use client";

import {
  Check,
  Crown,
  Flame,
  Search,
  SearchX,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FRIENDS,
  LEADERBOARD,
  type Friend,
  type FriendStatus,
} from "../../../lib/demo-data";
import { useDemoStore } from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Avatar } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { EmptyState } from "../../ui/empty-state";

/* ------------------------------------------------------------------ */
/* Identity — blue family per person, gray for you. White/blue/gray.   */
/* ------------------------------------------------------------------ */

const AVATAR_BLUE: Record<string, string> = {
  amara: "bg-blue-600",
  diego: "bg-sky-600",
  mei: "bg-indigo-500",
  tom: "bg-cyan-600",
  priya: "bg-blue-500",
  jonas: "bg-indigo-600",
  sofia: "bg-sky-500",
  ravi: "bg-cyan-700",
  you: "bg-slate-900",
};

const blueOf = (id: string) => AVATAR_BLUE[id] ?? AVATAR_BLUE.you;

const isOnlineNow = (lastActive: string) =>
  lastActive === "now" || lastActive === "12m ago";

function BlueAvatar({
  initials,
  id,
  size = "md",
  online,
  ring,
}: {
  initials: string;
  id: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  ring?: boolean;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar
        initials={initials}
        color={blueOf(id)}
        size={size}
        className={cn(
          ring && "ring-[3px] ring-blue-200 ring-offset-2 ring-offset-panel",
        )}
      />
      {online !== undefined ? (
        <span
          aria-label={online ? "Online" : "Offline"}
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-panel",
            online ? "bg-blue-500" : "bg-slate-300",
          )}
        />
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Weekly ranking                                                      */
/* ------------------------------------------------------------------ */

type WeeklyRow = {
  friendId: string;
  name: string;
  initials: string;
  weekly: number;
  lifetime: number;
  isYou: boolean;
};

type RankedRow = WeeklyRow & { rank: number };

function rankWeekly(youLifetimeXp: number): RankedRow[] {
  const rows: WeeklyRow[] = LEADERBOARD.map((row) => ({
    friendId: row.friendId,
    name: row.name,
    initials: row.initials,
    weekly: row.delta,
    lifetime: row.isYou ? youLifetimeXp : row.xp,
    isYou: row.isYou ?? false,
  }));

  return rows
    .sort(
      (a, b) =>
        b.weekly - a.weekly ||
        b.lifetime - a.lifetime ||
        a.name.localeCompare(b.name),
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/* ------------------------------------------------------------------ */
/* Scoreboard band — oversized numerals, thick rules                   */
/* ------------------------------------------------------------------ */

function Scoreboard({
  you,
  leader,
  friendCount,
  onlineCount,
}: {
  you: RankedRow;
  leader: RankedRow;
  friendCount: number;
  onlineCount: number;
}) {
  const behind = Math.max(0, leader.weekly - you.weekly);
  const leading = behind === 0;
  const pct =
    leader.weekly > 0
      ? Math.max(8, Math.round((you.weekly / leader.weekly) * 100))
      : 100;

  const cells = [
    {
      label: "Your rank",
      value: `#${you.rank}`,
      sub: leading ? "Leading the week" : `${behind.toLocaleString()} behind ${leader.isYou ? "2nd" : leader.name.split(" ")[0]}`,
      big: true,
    },
    {
      label: "Weekly XP",
      value: you.weekly.toLocaleString(),
      sub: `${you.lifetime.toLocaleString()} lifetime`,
    },
    {
      label: "Friends",
      value: String(friendCount),
      sub: `${onlineCount} online now`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-panel">
      <div className="grid grid-cols-1 divide-y-2 divide-slate-200 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
        {cells.map((cell) => (
          <div key={cell.label} className="px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {cell.label}
            </p>
            <p
              className={cn(
                "mt-2 font-bold tabular-nums tracking-[-0.05em] text-slate-900",
                cell.big ? "text-[56px] leading-none text-blue-600" : "text-[40px] leading-none",
              )}
            >
              {cell.value}
            </p>
            <p className="mt-2 text-[13px] text-slate-500">{cell.sub}</p>
          </div>
        ))}
      </div>

      {/* Race bar — full-bleed under the band */}
      <div className="border-t-2 border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Race to #1
          </p>
          <p className="text-[13px] tabular-nums text-slate-500">
            {pct}% of leader&apos;s weekly XP
          </p>
        </div>
        <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Podium — big, structural, giant numerals                            */
/* ------------------------------------------------------------------ */

function PodiumCell({
  row,
  place,
}: {
  row: RankedRow;
  place: "first" | "second" | "third";
}) {
  const isFirst = place === "first";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center px-4 text-center",
        isFirst
          ? "order-2 bg-blue-50 pb-8 pt-8"
          : "order-items-start bg-white pb-6 pt-6",
        place === "second" && "order-1 sm:border-r-2 sm:border-slate-200",
        place === "third" && "order-3 sm:border-l-2 sm:border-slate-200",
        row.isYou && !isFirst && "bg-slate-50",
      )}
    >
      {isFirst ? (
        <span className="absolute left-1/2 top-3 -translate-x-1/2">
          <Crown size={20} className="text-blue-500" />
        </span>
      ) : null}

      <span
        className={cn(
          "font-bold leading-none tabular-nums tracking-[-0.06em]",
          isFirst
            ? "text-[72px] text-blue-200"
            : "text-[48px] text-slate-200",
        )}
        aria-hidden
      >
        {row.rank}
      </span>

      <span className="-mt-8">
        <BlueAvatar
          initials={row.initials}
          id={row.friendId}
          size={isFirst ? "lg" : "md"}
          ring={isFirst}
        />
      </span>

      <p
        className={cn(
          "mt-3 max-w-full truncate px-2 font-semibold text-slate-900",
          isFirst ? "text-base" : "text-sm",
        )}
      >
        {row.isYou ? "You" : row.name}
      </p>

      <p
        className={cn(
          "mt-1.5 font-bold tabular-nums tracking-tight",
          isFirst ? "text-2xl text-blue-600" : "text-lg text-slate-900",
        )}
      >
        {row.weekly.toLocaleString()}
        <span className="ml-1 text-sm font-medium text-slate-400">XP</span>
      </p>

      <span
        className={cn(
          "mt-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
          isFirst ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500",
        )}
      >
        {place === "first" ? "1st" : place === "second" ? "2nd" : "3rd"}
      </span>
    </div>
  );
}

function Podium({ top }: { top: RankedRow[] }) {
  const [second, first, third] = top;
  return (
    <div className="hidden overflow-hidden rounded-xl border-2 border-slate-200 bg-panel sm:grid sm:grid-cols-3">
      {second ? <PodiumCell row={second} place="second" /> : null}
      {first ? <PodiumCell row={first} place="first" /> : null}
      {third ? <PodiumCell row={third} place="third" /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Leaderboard rows — inline bars, dense                              */
/* ------------------------------------------------------------------ */

function LeaderboardRow({
  row,
  max,
}: {
  row: RankedRow;
  max: number;
}) {
  const pct = max > 0 ? Math.max(4, Math.round((row.weekly / max) * 100)) : 0;

  return (
    <li
      className={cn(
        "border-t border-slate-200 first:border-t-0",
        row.isYou && "bg-blue-50/60",
      )}
    >
      <Link
        href={row.isYou ? "/dashboard" : `/dashboard/friends/${row.friendId}`}
        className="focus-ring group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-blue-50/50 sm:gap-4 sm:px-5"
      >
        <span className="w-6 shrink-0 text-center text-sm font-bold tabular-nums text-slate-400">
          {row.rank}
        </span>

        <BlueAvatar initials={row.initials} id={row.friendId} size="sm" />

        <span
          className={cn(
            "min-w-0 w-28 shrink-0 truncate text-sm sm:w-36",
            row.isYou
              ? "font-bold text-slate-900"
              : "font-medium text-slate-700 group-hover:text-slate-900",
          )}
        >
          {row.isYou ? "You" : row.name}
        </span>

        {/* Inline race bar */}
        <span className="hidden h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 sm:block">
          <span
            className={cn(
              "block h-full rounded-full transition-[width] duration-500 ease-out",
              row.isYou ? "bg-blue-500" : "bg-blue-300",
            )}
            style={{ width: `${pct}%` }}
          />
        </span>

        <span className="ml-auto shrink-0 text-right">
          <span className="block text-sm font-bold tabular-nums text-slate-900">
            {row.weekly.toLocaleString()}
          </span>
          <span className="block text-[11px] tabular-nums text-slate-400">
            {row.lifetime.toLocaleString()} total
          </span>
        </span>
      </Link>
    </li>
  );
}

function Leaderboard({ rows }: { rows: RankedRow[] }) {
  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const max = rows[0]?.weekly ?? 1;

  return (
    <section aria-label="Weekly leaderboard">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Weekly leaderboard
        </h2>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {rows.length} ranked · XP this week
        </p>
      </div>

      <Podium top={top} />

      {/* Mobile: full list */}
      <ol className="mt-3 overflow-hidden rounded-xl border-2 border-slate-200 bg-panel sm:hidden">
        {rows.map((row) => (
          <LeaderboardRow key={row.friendId} row={row} max={max} />
        ))}
      </ol>

      {/* Desktop: ranks 4+ */}
      <ol className="mt-3 hidden overflow-hidden rounded-xl border-2 border-slate-200 bg-panel sm:block">
        {rest.map((row) => (
          <LeaderboardRow key={row.friendId} row={row} max={max} />
        ))}
        {rest.length === 0 ? (
          <li className="px-5 py-4 text-[13px] text-slate-400">
            Top three take the podium — everyone else trails behind.
          </li>
        ) : null}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Crew cards — dense, maximalist blocks                               */
/* ------------------------------------------------------------------ */

function CrewCard({
  person,
  status,
  onAdd,
}: {
  person: Friend;
  status: FriendStatus;
  onAdd: (id: string, name: string) => void;
}) {
  const online = isOnlineNow(person.lastActive);

  return (
    <li className="flex flex-col rounded-xl border-2 border-slate-200 bg-panel p-4 transition-shadow hover:shadow-[0_2px_14px_rgba(11,13,16,0.06)]">
      <div className="flex items-start gap-3">
        <BlueAvatar initials={person.initials} id={person.id} online={online} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/friends/${person.id}`}
            className="focus-ring block truncate rounded text-sm font-bold text-slate-900 hover:text-blue-600"
          >
            {person.name}
          </Link>
          <p className="truncate text-xs text-slate-400">{person.handle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-blue-600">
          LV {person.level}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-2.5">
        <div className="px-1 first:pl-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            XP
          </dt>
          <dd className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
            {person.xp.toLocaleString()}
          </dd>
        </div>
        <div className="px-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Streak
          </dt>
          <dd
            className={cn(
              "mt-0.5 flex items-center gap-1 text-sm font-bold tabular-nums",
              person.streak > 0 ? "text-blue-600" : "text-slate-300",
            )}
          >
            {person.streak > 0 ? <Flame size={13} /> : null}
            {person.streak}d
          </dd>
        </div>
        <div className="pl-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Solved
          </dt>
          <dd className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
            {person.solved}
          </dd>
        </div>
      </dl>

      <p className="mt-3 line-clamp-2 min-h-[32px] text-xs leading-4 text-slate-500">
        {person.bio ?? person.title}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">{person.lastActive}</span>
        {status === "friend" ? (
          <Link
            href={`/dashboard/friends/${person.id}`}
            className="focus-ring rounded-lg border-2 border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            View profile
          </Link>
        ) : status === "sent" ? (
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">
            Requested
          </span>
        ) : (
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onAdd(person.id, person.name)}
          >
            <UserPlus size={13} />
            Add
          </Button>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Explorer                                                            */
/* ------------------------------------------------------------------ */

const TABS = ["friends", "discover", "requests"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  friends: "Friends",
  discover: "Discover",
  requests: "Requests",
};

export function FriendsExplorer() {
  const [tab, setTab] = useState<Tab>("friends");
  const [query, setQuery] = useState("");
  const friendStatuses = useDemoStore((s) => s.friendStatuses);
  const acceptFriend = useDemoStore((s) => s.acceptFriend);
  const declineRequest = useDemoStore((s) => s.declineRequest);
  const sendRequest = useDemoStore((s) => s.sendRequest);
  const xp = useDemoStore((s) => s.xp);

  const statusOf = (id: string, fallback: FriendStatus): FriendStatus =>
    friendStatuses[id] ?? fallback;

  const rows = useMemo(() => rankWeekly(xp), [xp]);
  const youIndex = rows.findIndex((r) => r.isYou);
  const you = youIndex >= 0 ? rows[youIndex] : undefined;
  const leader = rows[0];

  const friendsOnly = FRIENDS.filter(
    (f) => statusOf(f.id, f.status) === "friend",
  );
  const discover = FRIENDS.filter((f) => statusOf(f.id, f.status) === "none");
  const incoming = FRIENDS.filter(
    (f) => statusOf(f.id, f.status) === "received",
  );
  const outgoing = FRIENDS.filter((f) => statusOf(f.id, f.status) === "sent");

  const q = query.trim().toLowerCase();
  const matches = (f: Friend) =>
    !q ||
    f.name.toLowerCase().includes(q) ||
    f.handle.toLowerCase().includes(q) ||
    (f.bio ?? "").toLowerCase().includes(q);

  const visibleFriends = friendsOnly.filter(matches);
  const visibleDiscover = discover.filter(matches);

  const tabCounts: Record<Tab, number> = {
    friends: friendsOnly.length,
    discover: discover.length,
    requests: incoming.length + outgoing.length,
  };

  const onlineFriends = friendsOnly.filter((f) => isOnlineNow(f.lastActive)).length;

  function handleAccept(id: string, name: string) {
    acceptFriend(id);
    toast.success(`You and ${name.split(" ")[0]} are now friends`, {
      description: "Demo connection — not synced to a real account.",
    });
  }

  function handleDecline(id: string) {
    declineRequest(id);
    toast.info("Request declined");
  }

  function handleAdd(id: string, name: string) {
    sendRequest(id);
    toast.success(`Request sent to ${name.split(" ")[0]}`, {
      description: "Demo request — the other side is sample data.",
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b-2 border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-900">
            Friends
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Learn together. Get better together.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {incoming.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTab("requests");
              }}
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-blue-200 bg-blue-50 px-3 text-[13px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Users size={14} />
              {incoming.length} pending
            </button>
          ) : null}
          <Button
            size="md"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              setQuery("");
              setTab("discover");
            }}
          >
            <UserPlus size={15} />
            Add friends
          </Button>
        </div>
      </div>

      {/* Scoreboard */}
      {you && leader ? (
        <div className="mt-6">
          <Scoreboard
            you={you}
            leader={leader}
            friendCount={friendsOnly.length}
            onlineCount={onlineFriends}
          />
        </div>
      ) : null}

      {/* Leaderboard */}
      <div className="mt-10">
        <Leaderboard rows={rows} />
      </div>

      {/* Tabs + search */}
      <div className="mt-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 border-slate-200">
        <div className="flex gap-7">
          {TABS.map((value) => (
            <button
              key={value}
              onClick={() => {
                setQuery("");
                setTab(value);
              }}
              aria-pressed={tab === value}
              className={cn(
                "focus-ring -mb-0.5 border-b-[3px] pb-2.5 text-sm font-bold transition-colors",
                tab === value
                  ? "border-blue-600 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-700",
              )}
            >
              {TAB_LABEL[value]}
              {tabCounts[value] > 0 ? (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    tab === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {tabCounts[value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tab !== "requests" ? (
          <div className="relative mb-2 w-full max-w-[240px]">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "friends" ? "Search friends" : "Search people"
              }
              aria-label="Search"
              className="focus-ring w-full rounded-lg border-2 border-slate-200 bg-white py-1.5 pl-8 pr-8 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Friends grid */}
      {tab === "friends" ? (
        <section className="mt-5" aria-label="Your friends">
          {visibleFriends.length === 0 ? (
            <EmptyState
              icon={q ? SearchX : Users}
              title={q ? "No one matches" : "No friends yet"}
              description={
                q
                  ? "Try a different name or handle."
                  : "Head to Discover to find people to learn with."
              }
              action={
                q ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setTab("discover")}
                  >
                    Discover people
                  </Button>
                )
              }
              className="border-blue-100"
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visibleFriends.map((person) => (
                <CrewCard
                  key={person.id}
                  person={person}
                  status="friend"
                  onAdd={handleAdd}
                />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* Discover grid */}
      {tab === "discover" ? (
        <section className="mt-5" aria-label="Discover people">
          {visibleDiscover.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={q ? "No one matches" : "No suggestions right now"}
              description={
                q
                  ? "Try a different name or handle."
                  : "You've reached out to everyone available in this demo."
              }
              action={
                q ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </Button>
                ) : undefined
              }
              className="border-blue-100"
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visibleDiscover.map((person) => (
                <CrewCard
                  key={person.id}
                  person={person}
                  status={statusOf(person.id, person.status)}
                  onAdd={handleAdd}
                />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* Requests */}
      {tab === "requests" ? (
        <section className="mt-5 space-y-8" aria-label="Friend requests">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                Incoming
              </h3>
              {incoming.length > 0 ? (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold tabular-nums text-white">
                  {incoming.length}
                </span>
              ) : null}
            </div>
            {incoming.length === 0 ? (
              <p className="rounded-xl border-2 border-slate-200 bg-panel px-4 py-8 text-center text-[13px] text-slate-400">
                No incoming requests.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {incoming.map((request) => (
                  <li
                    key={request.id}
                    className="flex items-center gap-3.5 rounded-xl border-2 border-blue-100 bg-blue-50/40 p-4"
                  >
                    <BlueAvatar
                      initials={request.initials}
                      id={request.id}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {request.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {request.handle} · Level {request.level}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleAccept(request.id, request.name)}
                      >
                        <Check size={13} />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDecline(request.id)}
                        aria-label={`Decline request from ${request.name}`}
                      >
                        <X size={13} />
                        Decline
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
              Sent
            </h3>
            {outgoing.length === 0 ? (
              <p className="rounded-xl border-2 border-slate-200 bg-panel px-4 py-8 text-center text-[13px] text-slate-400">
                No sent requests.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {outgoing.map((request) => (
                  <li
                    key={request.id}
                    className="flex items-center gap-3.5 rounded-xl border-2 border-slate-200 bg-panel p-4"
                  >
                    <BlueAvatar
                      initials={request.initials}
                      id={request.id}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-700">
                        {request.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {request.handle}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400">
                      Pending
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Cancelling sent requests isn&apos;t supported in this demo build.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
