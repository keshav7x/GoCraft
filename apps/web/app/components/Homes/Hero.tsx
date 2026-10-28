"use client";

import {
ArrowRight,
Braces,
Check,
Code2,
Users,
Zap,
} from "lucide-react";
import { Reveal } from "./Reveal";

const benefits = [
"Interactive Go lessons",
"Real coding problems",
"Progress that matters",
];

const features = [
{
icon: Braces,
title: "Learn",
description: "Understand concepts through interactive lessons.",
},
{
icon: Code2,
title: "Solve",
description: "Build problem-solving skills by writing code.",
},
{
icon: Zap,
title: "Progress",
description: "Earn XP and build a consistent practice streak.",
},
{
icon: Users,
title: "Connect",
description: "Challenge friends and grow together.",
},
];

export function Hero() {
return (
<section
   id="top"
   className="bg-white px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28"
 >
<div className="mx-auto max-w-7xl">
{/* Hero */}
<div className="mx-auto max-w-4xl text-center">
<Reveal>
<div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
<span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white">
<Braces size={12} strokeWidth={2} />
</span>
A better way to learn software engineering
<ArrowRight size={12} className="text-slate-400" />
</div>
</Reveal>

      <Reveal delay={0.06}>
        <h1 className="text-balance text-[clamp(3.25rem,7.2vw,6.5rem)] font-semibold leading-[0.99] tracking-[-0.075em] text-[#111111]">
          Become a better
          <br />
          <span className="text-slate-400">
             engineer.
          </span>
        </h1>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:mt-8 sm:text-lg sm:leading-8">
          GoCraft turns learning into practice. Master Go, solve
          engineering problems, and build your skills one challenge at a
          time.
        </p>
      </Reveal>

      <Reveal delay={0.18}>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a
            href="#preview"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Start learning
            <ArrowRight size={16} strokeWidth={1.8} />
          </a>

          <a
            href="#learn"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Explore GoCraft
          </a>
        </div>
      </Reveal>

      <Reveal delay={0.24}>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm"
            >
              <Check
                size={14}
                strokeWidth={1.8}
                className="text-slate-400"
              />
              {benefit}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>

    {/* Product value proposition */}
    <Reveal delay={0.18}>
      <div className="mt-20 border-y border-slate-200 sm:mt-24 lg:mt-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group px-5 py-6 sm:px-6 sm:py-7 lg:px-7 ${
                  index !== 0 ? "border-t border-slate-200 sm:border-t-0" : ""
                } ${
                  index === 1
                    ? "sm:border-l sm:border-slate-200"
                    : index > 1
                      ? "lg:border-l lg:border-slate-200"
                      : ""
                } ${
                  index === 2
                    ? "sm:border-t sm:border-slate-200 lg:border-t-0"
                    : ""
                } ${
                  index === 3
                    ? "sm:border-l sm:border-slate-200 sm:border-t lg:border-t-0"
                    : ""
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors group-hover:border-slate-300 group-hover:bg-slate-50">
                  <Icon size={17} strokeWidth={1.7} />
                </div>

                <h2 className="mt-5 text-sm font-semibold text-slate-900">
                  {feature.title}
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>

    {/* Closing statement */}
    <Reveal delay={0.24}>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-slate-500">
          Less passive learning. More hands-on engineering.
        </p>

        <a
          href="#learn"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-slate-700 transition-colors hover:text-black"
        >
          See how it works
          <ArrowRight size={13} />
        </a>
      </div>
    </Reveal>
  </div>
</section>

);
}
