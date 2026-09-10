"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

export function QuizProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percent = Math.round((current / total) * 100);
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
        <span>
          Question {current} of {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-emerald-500"
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 110, damping: 20 }
          }
        />
      </div>
    </div>
  );
}

export function AnswerOption({
  label,
  selected,
  disabled,
  state,
  onSelect,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  state?: "idle" | "correct" | "incorrect";
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition",
        state === "correct" && "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
        state === "incorrect" && "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
        state === "idle" && selected && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
        state === "idle" && !selected && "border-slate-200 hover:border-slate-300 dark:border-slate-700",
        disabled && "cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}

export function QuizQuestion({
  question,
  index,
  total,
  selected,
  submitted,
  onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  selected: string | null;
  submitted: boolean;
  onSelect: (value: string) => void;
}) {
  const isCorrect = selected === question.correctAnswer;
  return (
    <div>
      <QuizProgress current={index + 1} total={total} />
      <h2 className="font-display mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
        {question.questionText}
      </h2>
      <div className="mt-5 space-y-3">
        {question.options.map((option) => {
          let state: "idle" | "correct" | "incorrect" = "idle";
          if (submitted) {
            if (option === question.correctAnswer) state = "correct";
            else if (option === selected) state = "incorrect";
          }
          return (
            <AnswerOption
              key={option}
              label={option}
              selected={selected === option}
              disabled={submitted}
              state={state}
              onSelect={() => onSelect(option)}
            />
          );
        })}
      </div>
      {submitted ? (
        <div
          className={cn(
            "mt-5 rounded-2xl p-4 text-sm",
            isCorrect
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
          )}
        >
          {isCorrect ? (
            <p className="font-bold">✓ Correct! +20 XP</p>
          ) : (
            <>
              <p className="font-bold">✗ Not quite.</p>
              <p className="mt-1">
                Correct answer: <strong>{question.correctAnswer}</strong>
              </p>
              <p className="mt-2 opacity-90">Why: {question.explanation}</p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
