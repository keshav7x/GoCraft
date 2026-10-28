
"use client";

import { useState } from "react";
import {
  ArrowRight,
  Code2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { FaGithub as Github } from "react-icons/fa";
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Brand and messaging */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-50 p-12 lg:flex xl:p-16">
          <a
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Code2 size={19} />
            </span>
            GoCraft
          </a>

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Built for developers who build
            </span>

            <h1 className="mt-7 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
              Stop watching.
              <br />
              Start <span className="text-slate-400">building.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-500">
              Turn what you learn into what you can build. Solve practical
              coding challenges, track your progress, and level up one rep at
              a time.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Learn by solving real coding challenges",
                "Build consistency and track your progress",
                "Earn XP as you improve your craft",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                    <Check size={13} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-slate-200 pt-5 text-xs text-slate-400">
            <span>Learn it. Build it. Own it.</span>
            <span>GoCraft © 2026</span>
          </div>

          {/* Subtle decorative grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-24 right-[-70px] h-72 w-72 rounded-full border border-slate-200"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-32 right-[-30px] h-52 w-52 rounded-full border border-slate-200"
          />
        </section>

        {/* Right: Registration form */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <a
              href="/"
              className="mb-12 inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight lg:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Code2 size={19} />
              </span>
              GoCraft
            </a>

            <div>
              <p className="text-sm font-medium text-slate-500">
                YOUR NEXT CHAPTER
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start building your skills, one challenge at a time.
              </p>
            </div>

            {/* GitHub sign-in */}
            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/auth/github";
              }}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Github size={19} />
              Continue with GitHub
            </button>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                // Connect your registration API here.
              }}
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Display name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="What should we call you?"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    minLength={8}
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((show) => !show)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              <button
                type="submit"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Create account
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-slate-950 underline underline-offset-4 decoration-slate-300 transition hover:decoration-slate-950"
              >
                Sign in
              </a>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-2">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
