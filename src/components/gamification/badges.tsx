import { Flame, Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakBadge({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-sm font-bold text-orange-600 dark:text-orange-400",
        className
      )}
    >
      <Flame className="h-4 w-4" aria-hidden />
      {streak} Day Streak
    </div>
  );
}

export function XPBadge({ xp, className }: { xp: number; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-600 dark:text-amber-400",
        className
      )}
    >
      <Zap className="h-4 w-4" aria-hidden />
      {xp.toLocaleString()} XP
    </div>
  );
}

export function LevelBadge({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-300",
        className
      )}
    >
      <Star className="h-4 w-4" aria-hidden />
      Level {level}
    </div>
  );
}

export function AchievementCard({
  name,
  description,
  icon,
  unlocked,
  earnedAt,
}: {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  earnedAt?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-4 transition",
        unlocked
          ? "border-emerald-200 bg-white dark:border-emerald-900 dark:bg-slate-900"
          : "border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-900/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl",
            unlocked ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-slate-200 dark:bg-slate-800 grayscale"
          )}
        >
          {unlocked ? icon : "🔒"}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          {unlocked && earnedAt ? (
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          ) : (
            <p className="mt-2 text-xs font-medium text-slate-400">Locked</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LevelUpOverlay({
  level,
  onClose,
}: {
  level: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
        <Sparkles className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="font-display mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
          LEVEL UP!
        </h2>
        <p className="mt-2 text-lg font-semibold text-emerald-600">
          You reached Level {level}!
        </p>
        <p className="mt-1 text-sm text-slate-500">Keep going!</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
