
"use client";

import { useState } from "react";
import {
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Login form */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
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
                WELCOME BACK
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Good to have you back.
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pick up where you left off and keep building.
              </p>
            </div>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/github`;
              }}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <FaGithub size={19} aria-hidden="true" />
              Continue with GitHub
            </button>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                OR SIGN IN WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                // Connect your login API here.
              }}
            >
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
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <a
                    href="/forgot-password"
                    className="text-xs font-medium text-slate-500 transition hover:text-slate-950"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
              </div>

              <button
                type="submit"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Sign in
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to GoCraft?{" "}
              <a
                href="/register"
                className="font-medium text-slate-950 underline underline-offset-4 decoration-slate-300 transition hover:decoration-slate-950"
              >
                Create an account
              </a>
            </p>

            <p className="mt-10 text-center text-xs text-slate-400">
              Learn it. Build it. Own it.
            </p>
          </div>
        </section>

        {/* Right: Brand and messaging */}
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
              Your next rep starts here
            </span>

            <h2 className="mt-7 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
              Progress isn't
              <br />
              <span className="text-slate-400">accidental.</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-500">
              Every challenge is a chance to get better. Come back, solve
              something difficult, and make your progress count.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Pick up your learning path",
                "Keep your progress moving",
                "Build skills through practice",
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

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-24 right-[-70px] h-72 w-72 rounded-full border border-slate-200"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-32 right-[-30px] h-52 w-52 rounded-full border border-slate-200"
          />
        </section>
      </div>
    </main>
  );
}
