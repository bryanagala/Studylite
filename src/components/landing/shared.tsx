"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
} & MotionProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Section({
  id,
  className,
  children,
  tone = "default",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "dark" | "light" | "accent";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28",
        tone === "dark" && "bg-[#070b18] text-slate-50",
        tone === "light" && "bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50",
        tone === "accent" &&
          "bg-gradient-to-br from-emerald-50 via-white to-amber-50 text-slate-900 dark:from-emerald-950/40 dark:via-slate-950 dark:to-amber-950/30 dark:text-slate-50",
        tone === "default" && "bg-transparent",
        className
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
      {children}
    </p>
  );
}
