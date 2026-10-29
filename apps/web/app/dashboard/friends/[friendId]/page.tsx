import { ArrowLeft, BookOpen, CheckCircle2, Flame, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FriendAction } from "../../../components/pages/friends/friend-action";
import { Avatar } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/ui/page-header";
import { ACHIEVEMENTS, findFriend, FRIEND_ACTIVITY } from "../../../lib/demo-data";

type FriendProfileProps = {
  params: Promise<{ friendId: string }>;
};

export async function generateMetadata({ params }: FriendProfileProps): Promise<Metadata> {
  const { friendId } = await params;
  const friend = findFriend(friendId);
  return { title: friend ? friend.name : "Profile" };
}

export default async function FriendProfilePage({ params }: FriendProfileProps) {
  const { friendId } = await params;
  const friend = findFriend(friendId);
  if (!friend) notFound();

  const activity = FRIEND_ACTIVITY.filter((item) => item.friendId === friend.id);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/friends"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition hover:text-ink"
      >
        <ArrowLeft size={13} />
        Friends
      </Link>

      {/* Profile header */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <Avatar
            initials={friend.initials}
            color="bg-slate-700"
            size="lg"
            online={friend.lastActive === "now" || friend.lastActive === "12m ago"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-ink">{friend.name}</h1>
              <Badge variant="accent">{friend.title}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-3">
              {friend.handle} · Level {friend.level} · {friend.lastActive}
            </p>
            {friend.bio && <p className="mt-2 max-w-xl text-sm leading-6 text-ink-2">{friend.bio}</p>}
          </div>
          <FriendAction
            friendId={friend.id}
            name={friend.name}
            fallbackStatus={friend.status}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "XP", value: friend.xp.toLocaleString(), icon: Trophy },
          { label: "Streak", value: `${friend.streak} days`, icon: Flame },
          { label: "Problems solved", value: `${friend.solved}`, icon: CheckCircle2 },
          { label: "Lessons done", value: `${friend.modulesDone}`, icon: BookOpen },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <Icon size={15} className="text-ink-4" />
              <p className="mt-3 text-lg font-semibold tracking-tight text-ink tabular-nums">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-3">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Activity */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Sample feed for this profile</CardDescription>
            </div>
          </CardHeader>
          {activity.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Flame}
                title="No recent activity"
                description={`${friend.name.split(" ")[0]} hasn't logged anything this week — demo data.`}
              />
            </div>
          ) : (
            <ul className="divide-y divide-line px-5">
              {activity.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-2">{item.action}</p>
                    <p className="mt-0.5 text-xs text-ink-3">{item.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {item.xp !== undefined && (
                      <p className="text-xs font-semibold text-ink tabular-nums">+{item.xp} XP</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-ink-4">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Badge progress on this profile</CardDescription>
            </div>
          </CardHeader>
          <ul className="divide-y divide-line px-5">
            {ACHIEVEMENTS.map((achievement, index) => {
              // Sample mapping: higher-level friends get the first three badges.
              const earned = achievement.earned || (friend.level >= 5 && index < 3);
              const progressPercent = achievement.progress
                ? Math.min(
                    100,
                    Math.round((friend.solved / achievement.progress.goal) * 100),
                  )
                : null;
              return (
                <li key={achievement.id} className="flex items-center gap-3 py-3">
                  <span
                    className={
                      earned
                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-easy-soft text-easy"
                        : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-4"
                    }
                  >
                    <Trophy size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{achievement.name}</p>
                    <p className="truncate text-xs text-ink-3">{achievement.detail}</p>
                  </div>
                  {earned ? (
                    <Badge variant="success">Earned</Badge>
                  ) : achievement.progress ? (
                    <span className="shrink-0 text-[11px] text-ink-4 tabular-nums">
                      {Math.round((friend.solved / achievement.progress.goal) * 100) > 100
                        ? 100
                        : Math.round((friend.solved / achievement.progress.goal) * 100)}
                      %
                    </span>
                  ) : (
                    <Badge variant="neutral">Locked</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
