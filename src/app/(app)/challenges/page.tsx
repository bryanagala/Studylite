"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { SUBJECTS } from "@/lib/content/seed-data";
import {
  getBattleStats,
  listBattleHistory,
  listPendingInvites,
  respondToInvite,
  sendBattleChallenge,
  startQuickMatch,
  getChallengeTargets,
} from "@/lib/battle/service";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export default function BattleHubPage() {
  const { profile, refresh } = useStudyLite();
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(SUBJECTS[1]?.id || SUBJECTS[0].id);
  const [challengeTarget, setChallengeTarget] = useState(getChallengeTargets()[1]?.id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const stats = profile ? getBattleStats(profile.id) : null;
  const history = profile ? listBattleHistory(profile.id).slice(0, 8) : [];
  const invites = profile ? listPendingInvites(profile.id) : [];
  const targets = getChallengeTargets().filter((t) => t.id !== "demo-sarah");

  if (!profile) return null;

  function runQuickMatch() {
    setBusy(true);
    setError("");
    try {
      const battle = startQuickMatch(profile!.id, subjectId);
      refresh();
      router.push(`/challenges/battle/${battle.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start battle.");
    } finally {
      setBusy(false);
    }
  }

  function runChallenge() {
    const target = targets.find((t) => t.id === challengeTarget);
    if (!target) return;
    setBusy(true);
    setError("");
    try {
      const { battle } = sendBattleChallenge({
        senderId: profile!.id,
        receiverId: target.id,
        receiverName: target.fullName,
        subjectId,
      });
      refresh();
      router.push(`/challenges/battle/${battle.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send challenge.");
    } finally {
      setBusy(false);
    }
  }

  function onInvite(inviteId: string, accept: boolean) {
    const battle = respondToInvite(inviteId, profile!.id, accept);
    refresh();
    if (accept && battle) router.push(`/challenges/battle/${battle.id}`);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-rose-600">
          Live Battle
        </p>
        <h1 className="font-display mt-1 text-3xl font-extrabold md:text-4xl">
          Challenge a real student. Answer before the clock runs out.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Demo Battles simulate an opponent so you can present without two devices.
          When Supabase Realtime is connected, Live Battles sync between real learners.
        </p>
      </header>

      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:border-rose-900 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">
          ⚔️ Quick Match
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Find another student and battle now — 10 questions · 10 sec each · +XP rewards.
        </p>
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">Subject</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSubjectId(s.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold",
                  subjectId === s.id
                    ? "bg-rose-500 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
                )}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>
        <Button
          className="mt-5 bg-rose-500 hover:bg-rose-600"
          size="lg"
          disabled={busy}
          onClick={runQuickMatch}
        >
          ⚔️ Quick Match
        </Button>
      </Card>

      <Card>
        <CardTitle>Challenge a student</CardTitle>
        <p className="mt-2 text-sm text-slate-500">
          Pick an opponent from the board. Demo opponents auto-accept for presentation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Opponent
            <select
              className="mt-1.5 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
              value={challengeTarget}
              onChange={(e) => setChallengeTarget(e.target.value)}
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} · Lv {t.level}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Subject
            <select
              className="mt-1.5 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-amber-600 font-semibold">
          Reward: Winner +100 XP · Draw +50 XP · Participation +25 XP
        </p>
        <Button className="mt-4" disabled={busy} onClick={runChallenge}>
          ⚔️ Send Challenge
        </Button>
      </Card>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Battle Stats</CardTitle>
          {stats && stats.total === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Your battle history will appear here after your first battle.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Wins" value={`${stats?.wins || 0}`} />
              <Stat label="Losses" value={`${stats?.losses || 0}`} />
              <Stat label="Draws" value={`${stats?.draws || 0}`} />
              <Stat label="Win rate" value={`${stats?.winRate || 0}%`} />
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Battle Invites</CardTitle>
          {invites.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No battle invites yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {invites.map((inv) => (
                <li
                  key={inv.id}
                  className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <p className="font-bold">⚔️ {inv.senderName} wants to challenge you!</p>
                  <p className="text-sm text-slate-500">
                    {inv.subjectName} · 10 Questions · 10 sec/question
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => onInvite(inv.id, true)}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onInvite(inv.id, false)}>
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Battle History</h2>
          <Link href="/leaderboard" className="text-sm font-semibold text-emerald-600">
            Climb the board
          </Link>
        </div>
        {history.length === 0 ? (
          <EmptyState
            title="No battles yet"
            description="Start a Quick Match to begin your competitive streak."
            action={
              <Button onClick={runQuickMatch} disabled={busy}>
                Try Quick Match
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.battleId}>
                <Link href={`/challenges/battle/${h.battleId}`}>
                  <Card className="flex flex-row items-center justify-between gap-3 py-3 transition hover:border-rose-300">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold">
                        {h.result === "win" ? "✓" : h.result === "loss" ? "✕" : "🤝"}
                      </span>
                      <div>
                        <p className="font-bold">
                          {h.result === "win" ? "Won" : h.result === "loss" ? "Lost" : "Draw"}{" "}
                          · {h.subjectName}
                          {h.isDemo ? (
                            <span className="ml-2 text-xs font-semibold text-slate-400">
                              Demo
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-slate-500">
                          vs {h.opponentName} · {h.playerScore} - {h.opponentScore} · +
                          {h.xpEarned} XP
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(h.completedAt).toLocaleDateString()}
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
