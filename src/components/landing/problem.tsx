"use client";

import { FadeIn, Eyebrow, Section } from "@/components/landing/shared";

const BUBBLES = [
  { text: '"Maybe I\'ll study later."', pos: "left-2 top-4 sm:left-8" },
  { text: '"This is boring."', pos: "right-2 top-10 sm:right-12" },
  { text: '"I\'ll start tomorrow."', pos: "left-4 bottom-24 sm:left-16" },
  { text: '"Where do I even begin?"', pos: "right-4 bottom-28 sm:right-10" },
  { text: '"No motivation."', pos: "left-1/2 top-1/2 -translate-x-1/2" },
];

const PROBLEMS = [
  {
    icon: "📚",
    title: "Too much content",
    body: "Students don't always know where to start.",
  },
  {
    icon: "😴",
    title: "Low motivation",
    body: "Traditional study experiences can feel repetitive.",
  },
  {
    icon: "🔄",
    title: "Inconsistency",
    body: "Students study intensely one day and disappear for several days.",
  },
  {
    icon: "📉",
    title: "No visible progress",
    body: "It can be difficult to see improvement or feel rewarded.",
  },
];

export function ProblemSection() {
  return (
    <Section id="about" tone="light">
      <FadeIn>
        <Eyebrow>The real struggle</Eyebrow>
        <h2 className="font-display max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          The problem isn&apos;t always what to study.
          <span className="mt-2 block text-slate-500 dark:text-slate-400">
            It&apos;s finding the motivation to keep studying.
          </span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.1} className="relative mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-12">
        <div className="relative mx-auto flex min-h-[280px] max-w-lg flex-col items-center justify-center">
          <div className="z-10 flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 text-5xl shadow-xl dark:bg-slate-700">
            😩
          </div>
          <p className="z-10 mt-4 text-center text-sm font-semibold text-slate-500">
            Another night at the desk… still not starting.
          </p>
          {BUBBLES.map((b, i) => (
            <FadeIn
              key={b.text}
              delay={0.15 + i * 0.08}
              className={`absolute ${b.pos} max-w-[180px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300`}
            >
              {b.text}
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-10 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
        Students have access to more learning resources than ever. But access doesn&apos;t
        automatically create consistency.
      </FadeIn>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PROBLEMS.map((p, i) => (
          <FadeIn key={p.title} delay={0.08 * i}>
            <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-2xl">{p.icon}</div>
              <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {p.body}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

export function TurningPoint() {
  return (
    <Section tone="dark" className="overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),transparent_60%)]" />
      <FadeIn className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
          So we asked a different question…
        </p>
        <h2 className="font-display mt-6 text-3xl font-extrabold leading-tight sm:text-5xl">
          What if studying felt like something students actually wanted to come back to?
        </h2>
        <p className="mt-6 text-lg font-semibold text-emerald-300">
          That&apos;s where StudyLite begins.
        </p>
      </FadeIn>
    </Section>
  );
}
