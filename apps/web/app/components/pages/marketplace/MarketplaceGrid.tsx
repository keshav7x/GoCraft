"use client";

import { Lock, ShoppingBag, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CATEGORY_LABELS,
  MARKETPLACE_ITEMS,
  type ItemCategory,
  type MarketplaceItem,
} from "../../../lib/demo-data";
import { useDemoStore } from "../../../lib/demo-store";
import { cn } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Dialog } from "../../ui/dialog";

const CATEGORY_TABS: ("all" | ItemCategory)[] = [
  "all",
  "themes",
  "avatars",
  "stickers",
  "badges",
];

function ItemPreview({ item }: { item: MarketplaceItem }) {
  if (item.swatch) {
    return (
      <div className="flex h-20 items-center gap-1.5 rounded-lg border border-line bg-surface-2 p-3">
        {item.swatch.map((color) => (
          <span
            key={color}
            className="h-full flex-1 rounded-md shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-20 items-center justify-center rounded-lg border border-line bg-surface-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-3 shadow-sm">
        <Sparkles size={17} />
      </span>
    </div>
  );
}

export function MarketplaceGrid({ ownedOnly = false }: { ownedOnly?: boolean }) {
  const [category, setCategory] = useState<"all" | ItemCategory>("all");
  const [confirming, setConfirming] = useState<MarketplaceItem | null>(null);

  const xp = useDemoStore((s) => s.xp);
  const ownedItemIds = useDemoStore((s) => s.ownedItemIds);
  const purchaseItem = useDemoStore((s) => s.purchaseItem);

  const isOwned = (item: MarketplaceItem) => item.owned || ownedItemIds.has(item.id);

  const items = useMemo(() => {
    const owned = (item: MarketplaceItem) => item.owned || ownedItemIds.has(item.id);
    let list = MARKETPLACE_ITEMS;
    if (ownedOnly) list = list.filter(owned);
    else if (category !== "all") list = list.filter((item) => item.category === category);
    return list;
  }, [category, ownedItemIds, ownedOnly]);

  function confirmPurchase() {
    if (!confirming) return;
    const result = purchaseItem(confirming.id, confirming.price);
    if (result === "ok") {
      toast.success(`Purchased ${confirming.name}`, {
        description: `−${confirming.price} XP · demo purchase, not a real transaction.`,
      });
    } else if (result === "insufficient") {
      toast.error("Not enough XP", {
        description: `You need ${(confirming.price - xp).toLocaleString()} more XP for ${confirming.name}.`,
      });
    } else {
      toast.info("Already owned");
    }
    setConfirming(null);
  }

  return (
    <div className="space-y-5">
      {/* Balance + tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!ownedOnly && (
          <div role="tablist" aria-label="Marketplace categories" className="flex flex-wrap gap-1">
            {CATEGORY_TABS.map((tab) => {
              const active = category === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(tab)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-surface text-ink shadow-card ring-1 ring-inset ring-line"
                      : "text-ink-3 hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {tab === "all" ? "All items" : CATEGORY_LABELS[tab]}
                </button>
              );
            })}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs shadow-card">
            <Tag size={13} className="text-ink-4" />
            <span className="font-semibold text-ink tabular-nums">{xp.toLocaleString()}</span>
            <span className="text-ink-3">XP balance</span>
          </span>
          <Link
            href="/dashboard/marketplace/inventory"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 shadow-card transition hover:border-line-strong hover:text-ink"
          >
            <ShoppingBag size={13} />
            Inventory
          </Link>
        </div>
      </div>

      {/* Item grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const owned = isOwned(item);
          const affordable = xp >= item.price;

          return (
            <Card key={item.id} className={cn("flex flex-col", !owned && item.locked && "opacity-80")}>
              <CardContent className="flex flex-1 flex-col p-4">
                <ItemPreview item={item} />

                <div className="mt-3.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-4">{CATEGORY_LABELS[item.category]}</p>
                  </div>
                  {owned ? (
                    <Badge variant="success">Owned</Badge>
                  ) : item.locked ? (
                    <Badge variant="neutral">
                      <Lock size={10} />
                      Locked
                    </Badge>
                  ) : item.free ? (
                    <Badge variant="accent">Free</Badge>
                  ) : (
                    <Badge variant="outline">{item.price} XP</Badge>
                  )}
                </div>

                <p className="mt-2 flex-1 text-xs leading-5 text-ink-3">{item.description}</p>

                <div className="mt-4">
                  {owned ? (
                    <p className="text-xs font-medium text-easy">In your inventory</p>
                  ) : item.locked ? (
                    <p className="text-xs text-ink-4">{item.lockReason ?? "Locked"}</p>
                  ) : (
                    <Button
                      size="sm"
                      variant={affordable ? "primary" : "secondary"}
                      disabled={!affordable}
                      onClick={() => setConfirming(item)}
                      className="w-full"
                      title={affordable ? undefined : "Earn more XP to unlock this purchase"}
                    >
                      {item.free ? "Claim" : `Buy for ${item.price} XP`}
                      {!affordable && !item.free ? " · need more XP" : ""}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-surface-2/50 px-6 py-14 text-center">
          <ShoppingBag size={20} className="mx-auto text-ink-4" />
          <h3 className="mt-3 text-sm font-semibold text-ink">Nothing owned yet</h3>
          <p className="mt-1 text-xs text-ink-3">
            Buy themes, avatars, or badges from the store — they&apos;ll show up here.
          </p>
          <Link
            href="/dashboard/marketplace"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 shadow-card transition hover:border-line-strong hover:text-ink"
          >
            Browse marketplace
          </Link>
        </div>
      )}

      {/* Purchase confirmation */}
      <Dialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title="Confirm purchase"
        description="Purchases are simulated in this demo session — no real account is charged."
        footer={
          <>
            <Button size="sm" variant="secondary" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={confirmPurchase}>
              {confirming?.free ? "Claim item" : `Pay ${confirming?.price.toLocaleString()} XP`}
            </Button>
          </>
        }
      >
        {confirming && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/60 p-3">
              <div className="w-24 shrink-0">
                <ItemPreview item={confirming} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{confirming.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-3">{confirming.description}</p>
              </div>
            </div>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-ink-3">Price</dt>
                <dd className="font-medium text-ink tabular-nums">
                  {confirming.free ? "Free" : `${confirming.price.toLocaleString()} XP`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-3">Your balance</dt>
                <dd className="font-medium text-ink tabular-nums">{xp.toLocaleString()} XP</dd>
              </div>
              {!confirming.free && (
                <div className="flex justify-between border-t border-line pt-1.5">
                  <dt className="text-ink-3">After purchase</dt>
                  <dd className="font-medium text-ink tabular-nums">
                    {(xp - confirming.price).toLocaleString()} XP
                  </dd>
                </div>
              )}
            </dl>
            {xp < confirming.price && (
              <p className="rounded-lg bg-hard-soft px-3 py-2 text-xs text-hard">
                Insufficient XP — solve more problems or complete lessons to earn{" "}
                {(confirming.price - xp).toLocaleString()} more.
              </p>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
