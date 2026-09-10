import { todayKey } from "@/lib/utils";

function previousDayKey(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Compute streak from a set of activity dates (YYYY-MM-DD). */
export function calculateStreak(
  activityDates: string[],
  referenceDate = new Date()
): { currentStreak: number; longestStreak: number } {
  const unique = [...new Set(activityDates)].sort();
  if (unique.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i - 1] === previousDayKey(unique[i])) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const today = todayKey(referenceDate);
  const yesterday = previousDayKey(today);
  const hasToday = unique.includes(today);
  const hasYesterday = unique.includes(yesterday);

  let current = 0;
  if (hasToday || hasYesterday) {
    let cursor = hasToday ? today : yesterday;
    while (unique.includes(cursor)) {
      current += 1;
      cursor = previousDayKey(cursor);
    }
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current),
  };
}

export function classifyTopicAccuracy(
  accuracy: number
): "needs_review" | "improving" | "strong" {
  if (accuracy < 60) return "needs_review";
  if (accuracy < 80) return "improving";
  return "strong";
}
