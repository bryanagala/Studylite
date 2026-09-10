"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppNotification,
  Challenge,
  DailyMission,
  LeaderboardEntry,
  Profile,
  StudyGoal,
  UserAchievement,
  WeakTopic,
  WeeklyStats,
} from "@/lib/types";
import * as localDb from "@/lib/store/local-db";
import * as pgApi from "@/lib/store/student-api";
import { isPostgresMode } from "@/lib/store/student-api";

type SubmitQuizResult = ReturnType<typeof localDb.submitQuiz>;
type CreateChallengeResult = ReturnType<typeof localDb.createChallenge>;

interface StudyLiteContextValue {
  ready: boolean;
  usingPostgres: boolean;
  profile: Profile | null;
  refresh: () => void;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (input: {
    email: string;
    password: string;
    remember?: boolean;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (input: {
    subjectIds: string[];
    studyGoal: StudyGoal;
    dailyGoalMinutes: number;
  }) => Promise<void>;
  dailyMission: DailyMission | null;
  weeklyStats: WeeklyStats | null;
  weakTopics: WeakTopic[];
  notifications: AppNotification[];
  leaderboard: {
    entries: LeaderboardEntry[];
    yourRank: number;
    xpToNext: number | null;
  } | null;
  achievements: UserAchievement[];
  challenges: Challenge[];
  completeLesson: (lessonId: string, durationSeconds: number) => Promise<void>;
  submitQuiz: (
    input: Parameters<typeof localDb.submitQuiz>[0]
  ) => Promise<SubmitQuizResult>;
  createChallenge: (
    input: Parameters<typeof localDb.createChallenge>[0]
  ) => Promise<CreateChallengeResult>;
  updateProfileName: (fullName: string) => Promise<void>;
  updateSettings: (
    userId: string,
    patch: Parameters<typeof localDb.updateSettings>[1]
  ) => Promise<Profile | null>;
}

const StudyLiteContext = createContext<StudyLiteContextValue | null>(null);

export function StudyLiteProvider({ children }: { children: React.ReactNode }) {
  const usingPostgres = isPostgresMode();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [leaderboard, setLeaderboard] = useState<StudyLiteContextValue["leaderboard"]>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const applyBootstrap = useCallback(
    (data: {
      profile: Profile | null;
      dailyMission: DailyMission | null;
      weeklyStats: WeeklyStats | null;
      weakTopics: WeakTopic[];
      notifications: AppNotification[];
      leaderboard: StudyLiteContextValue["leaderboard"];
      achievements: UserAchievement[];
      challenges: Challenge[];
    }) => {
      setProfile(data.profile);
      setDailyMission(data.dailyMission);
      setWeeklyStats(data.weeklyStats);
      setWeakTopics(data.weakTopics);
      setNotifications(data.notifications);
      setLeaderboard(data.leaderboard);
      setAchievements(data.achievements);
      setChallenges(data.challenges);
      setReady(true);
    },
    []
  );

  const refresh = useCallback(() => {
    if (usingPostgres) {
      void pgApi
        .fetchBootstrap()
        .then((data) => {
          applyBootstrap(data);
        })
        .catch((err) => {
          console.error("Failed to load student data from Postgres", err);
          applyBootstrap({
            profile: null,
            dailyMission: null,
            weeklyStats: null,
            weakTopics: [],
            notifications: [],
            leaderboard: null,
            achievements: [],
            challenges: [],
          });
        });
      return;
    }

    const user = localDb.getSessionUser();
    if (!user) {
      applyBootstrap({
        profile: null,
        dailyMission: null,
        weeklyStats: null,
        weakTopics: [],
        notifications: [],
        leaderboard: null,
        achievements: [],
        challenges: [],
      });
      return;
    }
    applyBootstrap({
      profile: { ...user.profile },
      dailyMission: user.profile.onboardingCompleted
        ? localDb.getDailyMission(user.id)
        : null,
      weeklyStats: localDb.getWeeklyStats(user.id),
      weakTopics: localDb.getWeakTopics(user.id),
      notifications: localDb.getNotifications(user.id),
      leaderboard: localDb.getLeaderboard(user.id),
      achievements: localDb.getUserAchievements(user.id),
      challenges: localDb.listChallenges(user.id),
    });
  }, [applyBootstrap, usingPostgres]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<StudyLiteContextValue>(
    () => ({
      ready,
      usingPostgres,
      profile,
      refresh,
      register: async (input) => {
        if (usingPostgres) {
          const res = await pgApi.registerUser(input);
          if (!res.ok) return res;
          refresh();
          return { ok: true };
        }
        const res = localDb.registerUser(input);
        if (!res.ok) return res;
        refresh();
        return { ok: true };
      },
      login: async (input) => {
        if (usingPostgres) {
          const res = await pgApi.loginUser(input);
          if (!res.ok) return res;
          refresh();
          return { ok: true };
        }
        const res = localDb.loginUser(input);
        if (!res.ok) return res;
        refresh();
        return { ok: true };
      },
      logout: async () => {
        if (usingPostgres) {
          await pgApi.logoutUser();
        } else {
          localDb.logoutUser();
        }
        refresh();
      },
      completeOnboarding: async (input) => {
        if (usingPostgres) {
          await pgApi.completeOnboarding(input);
        } else {
          localDb.completeOnboarding(input);
        }
        refresh();
      },
      dailyMission,
      weeklyStats,
      weakTopics,
      notifications,
      leaderboard,
      achievements,
      challenges,
      completeLesson: async (lessonId, durationSeconds) => {
        if (!profile) return;
        if (usingPostgres) {
          await pgApi.completeLessonSession({ lessonId, durationSeconds });
        } else {
          localDb.completeLessonSession({
            userId: profile.id,
            lessonId,
            durationSeconds,
          });
        }
        refresh();
      },
      submitQuiz: async (input) => {
        const result = usingPostgres
          ? await pgApi.submitQuiz(input)
          : localDb.submitQuiz(input);
        refresh();
        return result;
      },
      createChallenge: async (input) => {
        const challenge = usingPostgres
          ? await pgApi.createChallenge(input)
          : localDb.createChallenge(input);
        refresh();
        return challenge;
      },
      updateProfileName: async (fullName) => {
        if (!profile) return;
        if (usingPostgres) {
          await pgApi.updateProfileName(fullName);
        } else {
          localDb.updateProfileName(profile.id, fullName);
        }
        refresh();
      },
      updateSettings: async (userId, patch) => {
        const result = usingPostgres
          ? await pgApi.updateSettings(userId, patch)
          : localDb.updateSettings(userId, patch);
        refresh();
        return result;
      },
    }),
    [
      ready,
      usingPostgres,
      profile,
      refresh,
      dailyMission,
      weeklyStats,
      weakTopics,
      notifications,
      leaderboard,
      achievements,
      challenges,
    ]
  );

  return (
    <StudyLiteContext.Provider value={value}>{children}</StudyLiteContext.Provider>
  );
}

export function useStudyLite() {
  const ctx = useContext(StudyLiteContext);
  if (!ctx) throw new Error("useStudyLite must be used within StudyLiteProvider");
  return ctx;
}
