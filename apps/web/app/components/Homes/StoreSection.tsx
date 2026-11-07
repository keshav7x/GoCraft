
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Coins,
  LockKeyhole,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";
import { Reveal } from "./Reveal";

type Category = "stickers" | "accessories" | "themes";
type Rarity = "Common" | "Rare" | "Epic";

type StoreItem = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  rarity: Rarity;
};

const ITEMS: StoreItem[] = [
  {
    id: "ship-it",
    name: "Ship It",
    category: "stickers",
    price: 120,
    description: "A stamp for work you shipped.",
    rarity: "Common",
  },
  {
    id: "clean-commit",
    name: "Clean Commit",
    category: "stickers",
    price: 180,
    description: "A little badge for a history worth looking at.",
    rarity: "Rare",
  },
  {
    id: "night-owl",
    name: "Night Owl",
    category: "stickers",
    price: 240,
    description: "For the commits that happen after midnight.",
    rarity: "Rare",
  },
  {
    id: "debug-frames",
    name: "Debug Frames",
    category: "accessories",
    price: 260,
    description: "A minimal pair of frames for your developer avatar.",
    rarity: "Rare",
  },
  {
    id: "builder-cap",
    name: "Builder Cap",
    category: "accessories",
    price: 320,
    description: "A small detail for your builder profile.",
    rarity: "Epic",
  },
  {
    id: "terminal-skin",
    name: "Terminal Skin",
    category: "themes",
    price: 420,
    description: "Terminal-inspired linework for your profile.",
    rarity: "Epic",
  },
  {
    id: "paper",
    name: "Paper",
    category: "themes",
    price: 300,
    description: "A quiet, editorial look with plenty of breathing room.",
    rarity: "Common",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    category: "themes",
    price: 500,
    description: "A technical drawing aesthetic for your profile.",
    rarity: "Epic",
  },
  {
    id: "focus",
    name: "Focus Mode",
    category: "stickers",
    price: 150,
    description: "A target ring for your profile.",
    rarity: "Common",
  },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "stickers", label: "Stickers" },
  { id: "accessories", label: "Accessories" },
  { id: "themes", label: "Themes" },
];

function CollectibleArt({
  id,
  large = false,
}: {
  id: string;
  large?: boolean;
}) {
  const size = large ? "100%" : "100%";

  const common = {
    className: "fill-white stroke-ink",
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const tile = (
    <rect
      x="16"
      y="16"
      width="128"
      height="128"
      rx="28"
      className="fill-accent-50"
    />
  );

  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label={`${id.replaceAll("-", " ")} collectible illustration`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {id === "ship-it" && (
        <g transform="rotate(-7 80 80)">
          {tile}
          <rect x="30" y="30" width="100" height="100" rx="22" {...common} strokeWidth={2.8} />
          <path
            d="M58 56 43 80l15 24M102 56l15 24-15 24"
            className="fill-none stroke-ink"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M91 49l-22 62"
            className="fill-none stroke-accent-600"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M53 117h54" className="fill-none stroke-ink" strokeWidth="2" />
        </g>
      )}

      {id === "clean-commit" && (
        <g>
          {tile}
          <circle cx="80" cy="80" r="47" {...common} strokeWidth={2.8} />
          <path
            d="M57 60 42 80l15 20M103 60l15 20-15 20"
            className="fill-none stroke-ink"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M91 50l-22 60"
            className="fill-none stroke-accent-600"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="111" cy="47" r="3" className="fill-accent-600" />
        </g>
      )}

      {id === "night-owl" && (
        <g>
          {tile}
          <path
            d="M43 65 52 42l28 14 28-14 9 23-5 39-32 19-32-19-5-39Z"
            {...common}
            strokeWidth={2.8}
          />
          <circle
            cx="66"
            cy="78"
            r="8"
            className="fill-accent-100 stroke-ink"
            strokeWidth="2.2"
          />
          <circle
            cx="94"
            cy="78"
            r="8"
            className="fill-accent-100 stroke-ink"
            strokeWidth="2.2"
          />
          <path
            d="m74 91 6 7 6-7"
            className="fill-none stroke-accent-600"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M80 23v9M126 46l-7 7M34 46l7 7"
            className="fill-none stroke-ink"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === "debug-frames" && (
        <g>
          {tile}
          <rect x="29" y="49" width="102" height="62" rx="22" {...common} strokeWidth={2.8} />
          <rect
            x="39"
            y="58"
            width="35"
            height="44"
            rx="12"
            className="fill-accent-100 stroke-ink"
            strokeWidth="2.2"
          />
          <rect
            x="86"
            y="58"
            width="35"
            height="44"
            rx="12"
            className="fill-accent-100 stroke-ink"
            strokeWidth="2.2"
          />
          <path
            d="M74 73h12M17 73h12M131 73h12"
            className="fill-none stroke-ink"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === "builder-cap" && (
        <g>
          {tile}
          <path
            d="M37 86c0-27 18-45 43-45s43 18 43 45"
            {...common}
            strokeWidth={2.8}
          />
          <path d="M37 86c20-8 47-8 86 0" {...common} strokeWidth={2.8} />
          <path
            d="M37 86c-2 12 19 19 43 19 23 0 44-7 43-19"
            className="fill-accent-100 stroke-ink"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M80 54v17M72 62h16"
            className="fill-none stroke-accent-600"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === "terminal-skin" && (
        <g>
          {tile}
          <rect x="23" y="36" width="114" height="88" rx="10" {...common} strokeWidth={2.8} />
          <path d="M23 58h114" className="fill-none stroke-ink" strokeWidth="2.8" />
          <circle cx="36" cy="47" r="2" className="fill-ink" />
          <circle cx="44" cy="47" r="2" className="fill-accent-600" />
          <path
            d="m48 76-9 7 9 7m17-14 9 7-9 7"
            className="fill-none stroke-ink"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m113 88 12-24"
            className="fill-none stroke-accent-600"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path d="M40 107h46" className="fill-none stroke-ink" strokeWidth="2.2" />
        </g>
      )}

      {id === "paper" && (
        <g>
          {tile}
          <rect x="42" y="25" width="76" height="110" rx="6" {...common} strokeWidth={2.8} />
          <path
            d="M57 48h46M57 61h37M57 83h46M57 96h37M57 109h27"
            className="fill-none stroke-ink"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M94 25v18h24Z"
            className="fill-accent-600 stroke-accent-600"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        </g>
      )}

      {id === "blueprint" && (
        <g>
          {tile}
          <rect x="28" y="28" width="104" height="104" rx="6" {...common} strokeWidth={2.8} />
          <path
            d="M80 40v80M40 80h80"
            className="fill-none stroke-accent-300"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
          <rect
            x="48"
            y="48"
            width="64"
            height="64"
            rx="3"
            className="fill-none stroke-accent-600"
            strokeWidth="2.4"
          />
          <circle
            cx="80"
            cy="80"
            r="19"
            className="fill-none stroke-accent-600"
            strokeWidth="2.4"
          />
          <path
            d="M68 80h24M80 68v24"
            className="fill-none stroke-ink"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === "focus" && (
        <g>
          {tile}
          <circle cx="80" cy="80" r="47" {...common} strokeWidth={2.8} />
          <circle
            cx="80"
            cy="80"
            r="33"
            className="fill-accent-100 stroke-ink"
            strokeWidth="2.4"
          />
          <circle
            cx="80"
            cy="80"
            r="17"
            className="fill-white stroke-ink"
            strokeWidth="2.4"
          />
          <circle cx="80" cy="80" r="5" className="fill-accent-600" />
          <path
            d="M80 19v10M80 131v10M19 80h10M131 80h10"
            className="fill-none stroke-ink"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}

export function StoreSection() {
  const shouldReduceMotion = useReducedMotion();
  const [category, setCategory] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [balance, setBalance] = useState(1240);
  const [notice, setNotice] = useState("");

  const selectedItem = ITEMS.find((item) => item.id === selectedId);

  const visibleItems = ITEMS.filter(
    (item) => category === "all" || item.category === category,
  );

  function purchaseItem(item: StoreItem) {
    if (owned.includes(item.id)) {
      setNotice("You already own this collectible.");
      return;
    }

    if (balance < item.price) {
      setNotice("Not enough XP for this collectible.");
      return;
    }

    setBalance((current) => current - item.price);
    setOwned((current) => [...current, item.id]);
    setNotice(`${item.name} added to your collection.`);
  }

  function toggleEquip(item: StoreItem) {
    if (!owned.includes(item.id)) {
      setNotice("Purchase this collectible to equip it.");
      return;
    }

    setEquipped((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
    setNotice(
      equipped.includes(item.id)
        ? `${item.name} unequipped.`
        : `${item.name} equipped.`,
    );
  }

  return (
    <section className="w-full bg-canvas text-ink">
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-3">
                GoCraft store
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Unlock with XP.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-ink-3">
                Stickers, avatar accessories, and profile themes. Buy them
                with XP and equip them on your profile.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-line px-4 py-2.5 sm:self-auto">
              <Coins size={16} strokeWidth={1.7} />
              <span className="text-sm font-medium tabular-nums">
                {balance.toLocaleString()} XP
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`rounded-full border px-4 py-2 text-sm transition-colors motion-safe:active:scale-[0.97] ${
                  category === "all"
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong"
                }`}
              >
                All items
              </button>

              {CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors motion-safe:active:scale-[0.97] ${
                    category === item.id
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink-2 hover:border-line-strong"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item, index) => {
                const isOwned = owned.includes(item.id);
                const isEquipped = equipped.includes(item.id);

                return (
                  <motion.article
                    key={item.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.25,
                      delay: shouldReduceMotion ? 0 : index * 0.025,
                    }}
                    className={`group overflow-hidden rounded-2xl border bg-surface transition-colors ${
                      selectedId === item.id
                        ? "border-ink"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-label={`Preview ${item.name}`}
                      className="block w-full text-left"
                    >
                      <div className="relative flex aspect-square items-center justify-center border-b border-line p-8">
                        <div className="h-full w-full max-w-[180px] transition-transform duration-300 group-hover:scale-[1.04]">
                          <CollectibleArt id={item.id} />
                        </div>
                        {isOwned && (
                          <span className="absolute right-3 top-3 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-2">
                            Owned
                          </span>
                        )}
                      </div>
                    </button>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="mt-1 text-xs capitalize text-ink-3">
                            {item.category}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium tabular-nums">
                          {isOwned ? "Owned" : `${item.price} XP`}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        {isOwned ? (
                          <button
                            type="button"
                            onClick={() => toggleEquip(item)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors motion-safe:active:scale-[0.97] ${
                              isEquipped
                                ? "border-ink bg-ink text-white"
                                : "border-line hover:border-line-strong"
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check size={13} /> Equipped
                              </>
                            ) : (
                              "Equip"
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => purchaseItem(item)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-medium transition-colors hover:border-ink hover:bg-ink hover:text-white"
                          >
                            <ShoppingBag size={13} />
                            Unlock
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          aria-label={`View ${item.name} details`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <aside className="h-fit overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-sm font-medium">Preview</h3>
              <span className="text-xs text-ink-3">Your profile</span>
            </div>

            <div className="p-5">
              <div className="relative overflow-hidden rounded-xl border border-line p-5">
                <div className="absolute inset-0 opacity-30">
                  <svg
                    viewBox="0 0 300 300"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="profile-grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 20 0 L 0 0 0 20"
                          fill="none"
                          stroke="#d4d4d4"
                          strokeWidth=".7"
                        />
                      </pattern>
                    </defs>
                    <rect width="300" height="300" fill="url(#profile-grid)" />
                  </svg>
                </div>

                <div className="relative flex flex-col items-center py-5">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-line-strong bg-surface">
                    <span className="text-xl font-medium tracking-tight">
                      AK
                    </span>
                    {equipped.some((id) =>
                      ["debug-frames", "builder-cap"].includes(id),
                    ) && (
                      <div className="absolute inset-0">
                        {equipped.includes("debug-frames") && (
                          <div className="absolute inset-x-0 top-[27px] mx-auto w-[70px]">
                            <CollectibleArt id="debug-frames" />
                          </div>
                        )}
                        {equipped.includes("builder-cap") && (
                          <div className="absolute -top-6 left-0 w-full">
                            <CollectibleArt id="builder-cap" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h4 className="mt-4 text-base font-semibold">Alex Kim</h4>
                  <p className="mt-1 text-xs text-ink-3">
                    Building in public.
                  </p>

                  {equipped.some((id) =>
                    ["ship-it", "clean-commit", "night-owl", "focus"].includes(id),
                  ) && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {equipped
                        .filter((id) =>
                          ["ship-it", "clean-commit", "night-owl", "focus"].includes(id),
                        )
                        .map((id) => (
                          <div
                            key={id}
                            className="h-10 w-10 rounded-lg border border-line bg-surface p-1.5"
                          >
                            <CollectibleArt id={id} />
                          </div>
                        ))}
                    </div>
                  )}

                  {equipped.some((id) =>
                    ["terminal-skin", "paper", "blueprint"].includes(id),
                  ) && (
                    <div className="mt-5 w-full rounded-lg border border-line bg-surface p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-ink-3">
                        Profile theme
                      </p>
                      <div className="flex items-center gap-2">
                        {equipped
                          .filter((id) =>
                            ["terminal-skin", "paper", "blueprint"].includes(id),
                          )
                          .map((id) => (
                            <div key={id} className="h-8 w-8">
                              <CollectibleArt id={id} />
                            </div>
                          ))}
                        <span className="text-xs text-ink-2">
                          {ITEMS.find((item) => equipped.includes(item.id) && item.category === "themes")?.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-ink-3">
                Select a collectible to preview it. Purchase and equip items to
                update this local preview.
              </p>
            </div>
          </aside>
        </div>

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-surface px-4 py-3 shadow-lg"
              role="status"
            >
              <span className="text-sm">{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
                className="text-ink-3 hover:text-ink"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedId(null)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="collectible-title"
                className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 1.02 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        scale: 0.98,
                        transition: {
                          duration: 0.15,
                          ease: [0.895, 0.03, 0.685, 0.22],
                        },
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.2,
                  ease: [0.32, 0.72, 0, 1],
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <span className="text-sm font-medium">Item details</span>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close item details"
                    className="rounded-full p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mx-auto mb-5 flex aspect-square max-w-[220px] items-center justify-center rounded-xl border border-line p-7">
                    <CollectibleArt id={selectedItem.id} large />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 id="collectible-title" className="text-lg font-semibold tracking-tight">
                        {selectedItem.name}
                      </h3>
                      <p className="mt-1 text-sm capitalize text-ink-3">
                        {selectedItem.category} · {selectedItem.rarity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {owned.includes(selectedItem.id)
                        ? "Owned"
                        : `${selectedItem.price} XP`}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-ink-2">
                    {selectedItem.description}
                  </p>

                  <div className="mt-6">
                    {owned.includes(selectedItem.id) ? (
                      <button
                        type="button"
                        onClick={() => toggleEquip(selectedItem)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-2 motion-safe:active:scale-[0.97]"
                      >
                        {equipped.includes(selectedItem.id) ? (
                          <>
                            <Check size={15} /> Unequip item
                          </>
                        ) : (
                          "Equip item"
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => purchaseItem(selectedItem)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-2 motion-safe:active:scale-[0.97]"
                      >
                        {balance < selectedItem.price ? (
                          <LockKeyhole size={15} />
                        ) : (
                          <ShoppingBag size={15} />
                        )}
                        {balance < selectedItem.price
                          ? "Not enough XP"
                          : `Unlock for ${selectedItem.price} XP`}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
