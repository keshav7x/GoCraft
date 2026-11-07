"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { fetchSession } from "@/app/lib/trpc";
import { BrandMark } from "./BrandMark";

const NAV_ITEMS = [
  { label: "Learn", href: "#learn" },
  { label: "Progress", href: "#progress" },
  { label: "Friends", href: "#friends" },
  { label: "Store", href: "#store" },
];

/* "past 12px of scroll" as an external store, SSR-safe: server renders
   expanded and no effect calls setState. */
const NAV_SCROLLED_OFFSET = 12;

function subscribeScrolled(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getScrolledSnapshot() {
  return window.scrollY > NAV_SCROLLED_OFFSET;
}

function getScrolledServerSnapshot() {
  return false;
}

export function SiteHeader() {
  const scrolled = useSyncExternalStore(
    subscribeScrolled,
    getScrolledSnapshot,
    getScrolledServerSnapshot,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const enterInFlightRef = useRef(false);

  const handleEnter = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (enterInFlightRef.current) return;
    enterInFlightRef.current = true;
    try {
      const user = await fetchSession();
      router.push(user ? "/dashboard" : "/register");
    } finally {
      enterInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-smooth motion-reduce:transition-none ${
        scrolled
          ? "border-line bg-surface/90 shadow-card backdrop-blur-xl"
          : "border-transparent bg-surface"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <a
          href="#top"
          aria-label="GoCraft home"
          className="inline-flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-ink"
        >
          <BrandMark className="h-8 w-8" />
          <span>GoCraft</span>
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="cursor-pointer text-sm font-medium text-ink-3 transition-colors duration-150 ease-smooth hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/register"
            onClick={handleEnter}
            className="hidden h-10 cursor-pointer items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-[background-color,transform] duration-150 ease-smooth hover:bg-accent-hover motion-safe:active:scale-[0.97] motion-reduce:transition-none sm:inline-flex"
          >
            Enter GoCraft
            <ArrowRight size={15} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-[background-color,border-color] duration-150 ease-smooth hover:bg-surface-2 hover:border-line-strong motion-safe:active:scale-[0.97] motion-reduce:transition-none md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-pop md:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? undefined
                : {
                    opacity: 0,
                    y: -6,
                    transition: {
                      duration: 0.1,
                      ease: [0.895, 0.03, 0.685, 0.22],
                    },
                  }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.15,
              ease: [0.32, 0.72, 0, 1],
            }}
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto max-w-7xl px-6 py-4"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block cursor-pointer rounded-lg px-3 py-3 text-sm font-medium text-ink-2 transition-colors duration-150 ease-smooth hover:bg-surface-2 hover:text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              <a
                href="/register"
                onClick={(event) => {
                  setMenuOpen(false);
                  handleEnter(event);
                }}
                className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast transition-[background-color,transform] duration-150 ease-smooth hover:bg-accent-hover motion-safe:active:scale-[0.97] motion-reduce:transition-none sm:hidden"
              >
                Enter GoCraft
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
