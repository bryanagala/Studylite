"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyLite } from "@/components/providers/studylite-provider";
import { QUESTIONS } from "@/lib/content/seed-data";
import { remainingSeconds } from "@/lib/battle/engine";
import {
  claimBattleRewards,
  getBattle,
  heartbeatBattle,
  rematchBattle,
  submitBattleAnswer,
  tickBattle,
} from "@/lib/battle/service";
import type { LiveBattle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export default function LiveBattlePage() {
  const params = useParams<{ battleId: string }>();
  const { profile, refresh } = useStudyLite();
  const router = useRouter();
  const [battle, setBattle] = useState<LiveBattle | null | undefined>(undefined);
  const [selected, setSelected] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const claimedRef = useRef(false);

  useEffect(() => {
    setBattle(getBattle(params.battleId) || null);
  }, [params.battleId]);

  useEffect(() => {
    if (!profile) return;
    const id = window.setInterval(() => {
      heartbeatBattle(params.battleId, profile.id);
      const next = tickBattle(params.battleId);
      if (next) setBattle({ ...next, players: [...next.players], answers: [...next.answers] });
      setTick((t) => t + 1);
    }, 250);
    return () => window.clearInterval(id);
  }, [params.battleId, profile]);

  useEffect(() => {
    setSelected(null);
  }, [battle?.currentQuestionIndex, battle?.status]);

  useEffect(() => {
    if (!battle || battle.status !== "completed" || !profile || claimedRef.current) return;
    claimedRef.current = true;
    claimBattleRewards(battle.id, profile.id);
    refresh();
    setBattle(getBattle(battle.id));
  }, [battle, profile, refresh]);

  const me = battle?.players.find((p) => p.userId === profile?.id);
  const opp = battle?.players.find((p) => p.userId !== profile?.id);
  const question = useMemo(() => {
    if (!battle) return null;
    const id = battle.questionIds[battle.currentQuestionIndex];
    return QUESTIONS.find((q) => q.id === id) || null;
  }, [battle, tick]);

  const myAnswer = battle?.answers.find(
    (a) =>
      a.userId === profile?.id &&
      a.questionId === battle.questionIds[battle.currentQuestionIndex]
  );
  const oppAnswer = battle?.answers.find(
    (a) =>
      a.userId === opp?.userId &&
      a.questionId === battle.questionIds[battle.currentQuestionIndex]
  );

  const secondsLeft =
    battle?.status === "active"
      ? remainingSeconds(battle.questionStartedAt, battle.questionTimeLimit)
      : battle?.questionTimeLimit || 10;

  const countdownLeft =
    battle?.status === "starting" && battle.countdownEndsAt
      ? Math.max(
          0,
          Math.ceil((new Date(battle.countdownEndsAt).getTime() - Date.now()) / 1000)
        )
      : 0;

  if (battle === undefined) return <Skeleton className="h-64 w-full" />;
  if (!battle || !profile) {
    return <ErrorState title="Battle not found" onRetry={() => router.push("/challenges")} />;
  }

  const liveBattle = battle;
  const user = profile;

  function lockAnswer(option: string) {
    if (liveBattle.status !== "active" || myAnswer) return;
    setSelected(option);
    const next = submitBattleAnswer(liveBattle.id, user.id, option);
    if (next) setBattle({ ...next });
  }

  if (battle.status === "starting") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-rose-600">
          {battle.isDemo ? "Demo Battle" : "Live Battle"} · Match Found
        </p>
        <p className="mt-3 font-display text-2xl font-bold">
          {me?.displayName} vs {opp?.displayName}
        </p>
        <motion.p
          key={countdownLeft}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display mt-8 text-8xl font-extrabold text-rose-500"
        >
          {countdownLeft > 0 ? countdownLeft : "BATTLE!"}
        </motion.p>
        <p className="mt-4 text-slate-500">{battle.subjectName} · 10 questions</p>
      </div>
    );
  }

  if (battle.status === "completed") {
    const won = battle.winnerId === profile.id;
    const draw = battle.winnerId == null;
    const xp = battle.xpAwarded[profile.id] || 0;
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <p className="font-display text-4xl font-extrabold md:text-5xl">
            {won ? "🏆 VICTORY!" : draw ? "🤝 DRAW!" : "GOOD BATTLE!"}
          </p>
          {battle.isDemo ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Demo Battle
            </p>
          ) : null}
        </motion.div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold">{me?.displayName}</p>
              <p className="font-display text-3xl font-extrabold text-emerald-600">
                {me?.score}
              </p>
            </div>
            <div>
              <p className="font-bold">{opp?.displayName}</p>
              <p className="font-display text-3xl font-extrabold text-rose-500">
                {opp?.score}
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            <Mini label="Correct" value={`${me?.correctAnswers || 0}`} />
            <Mini label="Wrong" value={`${me?.wrongAnswers || 0}`} />
            <Mini label="Timeouts" value={`${me?.timeouts || 0}`} />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Accuracy:{" "}
            {battle.totalQuestions
              ? Math.round(((me?.correctAnswers || 0) / battle.totalQuestions) * 100)
              : 0}
            % · Level {profile.level} · 🔥 {profile.currentStreak} day streak
          </p>
          <p className="mt-3 font-display text-3xl font-extrabold text-amber-500">+{xp} XP</p>
        </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            onClick={() => {
              const next = rematchBattle(battle.id, profile.id);
              if (next) router.push(`/challenges/battle/${next.id}`);
            }}
          >
            Rematch
          </Button>
          <Link
            href="/leaderboard"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-5 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-white"
          >
            View Leaderboard
          </Link>
          <Button size="lg" variant="outline" onClick={() => router.push("/challenges")}>
            Battle Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-600">
          {battle.subjectName} Battle
          {battle.isDemo ? " · Demo" : " · Live"}
        </p>
        <p className="text-xs font-semibold text-slate-500">
          Q{battle.currentQuestionIndex + 1}/{battle.totalQuestions}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <PlayerChip
          name={me?.displayName || "You"}
          score={me?.score || 0}
          align="left"
          highlight
        />
        <span className="font-extrabold text-slate-400">VS</span>
        <PlayerChip
          name={opp?.displayName || "Opponent"}
          score={opp?.score || 0}
          align="right"
        />
      </div>

      {battle.status === "active" ? (
        <>
          <div className="text-center">
            <motion.p
              key={secondsLeft}
              className={cn(
                "font-display text-5xl font-extrabold",
                secondsLeft <= 3 ? "text-rose-500" : "text-slate-900 dark:text-white"
              )}
            >
              {String(secondsLeft).padStart(2, "0")}
            </motion.p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              seconds
            </p>
            <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all"
                style={{ width: `${(secondsLeft / battle.questionTimeLimit) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="font-display text-center text-2xl font-extrabold md:text-3xl">
            {question?.questionText}
          </h2>

          <div className="grid gap-3">
            {question?.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const locked = Boolean(myAnswer);
              const isMine = (myAnswer?.selectedAnswer || selected) === option;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={locked}
                  onClick={() => lockAnswer(option)}
                  className={cn(
                    "min-h-14 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition md:text-base",
                    isMine
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                    locked && !isMine && "opacity-60"
                  )}
                >
                  <span className="mr-2 font-extrabold text-slate-400">{letter}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {myAnswer ? (
            <p className="text-center text-sm font-bold text-emerald-600">
              Answer submitted
              {!oppAnswer ? ` · ${opp?.displayName || "Opponent"} is answering...` : ""}
            </p>
          ) : (
            <p className="text-center text-sm text-slate-500">
              Choose carefully — you can&apos;t change your answer.
            </p>
          )}
        </>
      ) : null}

      <AnimatePresence>
        {battle.status === "question_result" && question ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
              Question Result
            </p>
            <p className="mt-3 font-semibold">
              {myAnswer?.isCorrect ? "✓" : "✕"} {me?.displayName}{" "}
              {myAnswer?.selectedAnswer == null
                ? "timed out"
                : myAnswer.isCorrect
                  ? "answered correctly"
                  : "answered incorrectly"}
            </p>
            <p className="mt-1 font-semibold">
              {oppAnswer?.isCorrect ? "✓" : "✕"} {opp?.displayName}{" "}
              {oppAnswer?.selectedAnswer == null
                ? "timed out"
                : oppAnswer.isCorrect
                  ? "answered correctly"
                  : "answered incorrectly"}
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Correct answer: <strong>{question.correctAnswer}</strong>
            </p>
            <p className="mt-2 text-sm font-bold text-amber-600">
              +{myAnswer?.points || 0} {me?.displayName} · +{oppAnswer?.points || 0}{" "}
              {opp?.displayName}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-400">Next question soon...</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PlayerChip({
  name,
  score,
  align,
  highlight,
}: {
  name: string;
  score: number;
  align: "left" | "right";
  highlight?: boolean;
}) {
  return (
    <div className={cn(align === "right" && "text-right")}>
      <p className={cn("truncate text-sm font-bold", highlight && "text-emerald-700 dark:text-emerald-300")}>
        {name}
      </p>
      <p className="font-display text-xl font-extrabold">{score}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2 dark:bg-slate-800">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
