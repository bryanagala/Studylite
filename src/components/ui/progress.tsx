"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500",
          barClassName
        )}
        initial={reduceMotion ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 90, damping: 18, mass: 0.6 }
        }
      />
    </div>
  );
}
