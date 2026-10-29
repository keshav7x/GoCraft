"use client";

import { Check, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import type { FriendStatus } from "../../../lib/demo-data";
import { useDemoStore } from "../../../lib/demo-store";
import { Button } from "../../ui/button";

export function FriendAction({
  friendId,
  name,
  fallbackStatus,
}: {
  friendId: string;
  name: string;
  fallbackStatus: FriendStatus;
}) {
  const status = useDemoStore((s) => s.friendStatuses[friendId] ?? fallbackStatus);
  const acceptFriend = useDemoStore((s) => s.acceptFriend);
  const declineRequest = useDemoStore((s) => s.declineRequest);
  const sendRequest = useDemoStore((s) => s.sendRequest);

  if (status === "friend") {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3.5 text-[13px] font-medium text-ink-2">
        <Check size={14} className="text-success" />
        Friends
      </span>
    );
  }

  if (status === "received") {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            acceptFriend(friendId);
            toast.success(`You and ${name.split(" ")[0]} are now friends`, {
              description: "Demo connection — not synced to a real account.",
            });
          }}
        >
          <Check size={14} />
          Accept request
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            declineRequest(friendId);
            toast.info("Request declined");
          }}
          aria-label={`Decline request from ${name}`}
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <span className="inline-flex h-9 items-center rounded-lg border border-line px-3.5 text-[13px] font-medium text-ink-3">
        Request pending
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="primary"
      onClick={() => {
        sendRequest(friendId);
        toast.success(`Request sent to ${name.split(" ")[0]}`, {
          description: "Demo request — the other side is sample data.",
        });
      }}
    >
      <UserPlus size={14} />
      Add friend
    </Button>
  );
}
