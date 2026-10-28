
"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Flame,
  Home,
  Menu,
  Search,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";


import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Users,
  Target,
  ShoppingBag,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "#overview" },
  { label: "Lessons", icon: BookOpen, href: "#lessons" },
  { label: "Problems", icon: Code2, href: "#problems" },
  { label: "Friends", icon: Users, href: "#friends" },
  { label: "Marketplace", icon: ShoppingBag, href: "#marketplace" },
  { label: "Settings", icon: Settings, href: "#settings" },
];


const ACTIVITIES = [
  {
    title: "Variables & Types",
    detail: "Completed a challenge",
    time: "Today",
    xp: "+100 XP",
    icon: Check,
  },
  {
    title: "Go fundamentals",
    detail: "Learning path progress updated",
    time: "Yesterday",
    xp: "+40 XP",
    icon: BookOpen,
  },
  {
    title: "First steps",
    detail: "Reached your first milestone",
    time: "Yesterday",
    xp: "+25 XP",
    icon: Trophy,
  },
];

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-slate-950">
      <div className="flex min-h-screen">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6">
            <a
              href="#overview"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Code2 size={19} />
              </span>
              GoCraft
            </a>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={19} />
            </button>
          </div>

          <div className="px-4 pt-7">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>

            <nav className="mt-3 space-y-1" aria-label="Dashboard navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.label;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setActiveNav(item.label);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-950" />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Learning path card */}
          <div className="mx-4 mt-10 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                CURRENT PATH
              </span>
              <Code2 size={16} className="text-slate-400" />
            </div>

            <h3 className="mt-3 font-semibold">Go fundamentals</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Build a strong foundation in Go.
            </p>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Progress</span>
              <span className="font-semibold text-slate-800">32%</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[32%] rounded-full bg-slate-950" />
            </div>

            <a
              href="#learning"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-slate-500"
            >
              Continue learning <ArrowRight size={13} />
            </a>
          </div>

          <div className="mt-auto border-t border-slate-100 p-4">
            <a
              href="#settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Settings size={18} />
              Settings
            </a>

            <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold">
                K
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Your profile</p>
                <p className="mt-0.5 text-xs text-slate-500">Level 3 learner</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>
        </aside>

        {/* Main dashboard */}
        <section className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-sm font-semibold">{activeNav}</p>
                <p className="hidden text-xs text-slate-400 sm:block">
                  Your developer workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Search size={18} />
              </button>

              <button
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
              </button>

              <div className="hidden h-7 w-px bg-slate-200 sm:block" />

              <a
                href="#profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold"
                aria-label="Your profile"
              >
                K
              </a>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            {/* Welcome */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm text-slate-500">
                  Tuesday, October 27
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Keep building.
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Every challenge is another rep toward becoming a better
                  developer.
                </p>
              </div>

              <a
                href="#challenges"
                className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Explore challenges
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[
                {
                  label: "Total XP",
                  value: "840",
                  detail: "Keep earning",
                  icon: Zap,
                },
                {
                  label: "Current streak",
                  value: "7 days",
                  detail: "Consistency counts",
                  icon: Flame,
                },
                {
                  label: "Challenges solved",
                  value: "12",
                  detail: "One rep at a time",
                  icon: Check,
                },
                {
                  label: "Current level",
                  value: "Level 3",
                  detail: "Apprentice",
                  icon: Trophy,
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        {stat.label}
                      </span>
                      <Icon size={17} className="text-slate-400" />
                    </div>
                    <p className="mt-5 text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {stat.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Main content grid */}
            <div className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
              {/* Daily challenge */}
              <section
                id="challenges"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold">Your next challenge</p>
                    <p className="mt-1 text-xs text-slate-500">
                      A little practice goes a long way.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    Beginner
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Code2 size={23} />
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                    Build a word counter
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                    Write a Go function that counts how often each word appears
                    in a sentence. Practice maps, strings, and basic
                    data processing.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="rounded-lg bg-slate-100 px-3 py-2">
                      Go
                    </span>
                    <span className="rounded-lg bg-slate-100 px-3 py-2">
                      Maps
                    </span>
                    <span className="rounded-lg bg-slate-100 px-3 py-2">
                      ~15 min
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <Zap size={14} /> 100 XP
                    </span>
                  </div>

                  <a
                    href="#preview"
                    className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Start challenge <ArrowRight size={16} />
                  </a>
                </div>
              </section>

              {/* Right column */}
              <div className="space-y-6">
                {/* Weekly goal */}
                <section
                  id="progress"
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-sm font-semibold">Weekly goal</h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Build a consistent habit.
                      </p>
                    </div>
                    <Target size={19} className="text-slate-400" />
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <p className="text-3xl font-semibold tracking-tight">
                      3
                      <span className="text-base font-normal text-slate-400">
                        {" "}
                        / 5
                      </span>
                    </p>
                    <span className="text-xs font-medium text-slate-500">
                      60% complete
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {[true, true, true, false, false].map((done, index) => (
                      <div
                        key={index}
                        className={`flex h-9 items-center justify-center rounded-lg ${
                          done
                            ? "bg-slate-950 text-white"
                            : "border border-slate-200 bg-white text-slate-300"
                        }`}
                      >
                        {done ? (
                          <Check size={15} />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Two more challenge sessions to hit your goal.
                  </p>
                </section>

                {/* Learning path */}
                <section
                  id="learning"
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Learning path</h2>
                    <a
                      href="#learn"
                      className="text-xs font-medium text-slate-500 hover:text-slate-950"
                    >
                      View path
                    </a>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Code2 size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Go fundamentals</p>
                      <p className="mt-1 text-xs text-slate-500">
                        4 of 12 lessons completed
                      </p>
                    </div>
                    <ChevronRight size={17} className="text-slate-400" />
                  </div>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-1/3 rounded-full bg-slate-950" />
                  </div>
                </section>
              </div>
            </div>

            {/* Recent activity */}
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-sm font-semibold">Recent activity</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Your latest steps forward.
                  </p>
                </div>
                <a
                  href="#activity"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-950"
                >
                  View all <ArrowRight size={14} />
                </a>
              </div>

              <div className="divide-y divide-slate-100 px-6">
                {ACTIVITIES.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.title}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600">
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {activity.detail}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-slate-800">
                          {activity.xp}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <p className="mt-6 text-center text-xs text-slate-400">
              Dashboard preview · Sample data, not connected to an account
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
