
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession } from "@/app/lib/trpc";
import { BrandMark } from "./BrandMark";

const NAV_ITEMS = [
  { label: "Learn", href: "#learn" },
  { label: "Progress", href: "#progress" },
  { label: "Friends", href: "#friends" },
  { label: "Store", href: "#store" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled
          ? "border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-white"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Brand */}
        <a
          href="#top"
          aria-label="GoCraft home"
          className="inline-flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950"
        >
          <BrandMark className="h-8 w-8" />
          <span>GoCraft</span>
        </a>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/register"
            onClick={handleEnter}
            className="hidden h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:inline-flex"
          >
            Enter GoCraft
            <ArrowRight size={15} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 md:hidden"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lg md:hidden"
            initial={
              reduceMotion ? false : { opacity: 0, y: -8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, y: -8 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto max-w-7xl px-6 py-4"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
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
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:hidden"
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
