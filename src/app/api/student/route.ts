import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { formatDbError, isDatabaseConfigured } from "@/lib/db/client";
import * as repo from "@/lib/store/pg-repo";

const SESSION_COOKIE = "studylite_uid";

async function getSessionUserId() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value || null;
}

async function setSession(userId: string | null) {
  const jar = await cookies();
  if (!userId) {
    jar.delete(SESSION_COOKIE);
    return;
  }
  jar.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "DATABASE_URL is not set on this deployment. Add the Railway public Postgres URL in Vercel → Settings → Environment Variables (Production), then Redeploy.",
      },
      { status: 503 }
    );
  }
  try {
    await repo.healthCheck();
    const userId = await getSessionUserId();
    const bootstrap = await repo.getBootstrap(userId);
    const content = await repo.getContentCatalog();
    return NextResponse.json({ ok: true, ...bootstrap, content });
  } catch (err) {
    console.error("[api/student GET]", err);
    return NextResponse.json({ ok: false, error: formatDbError(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "DATABASE_URL is not set on this deployment. Add the Railway public Postgres URL in Vercel → Settings → Environment Variables (Production), then Redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { action: string; [key: string]: unknown };
    const { action, ...payload } = body;
    const sessionUserId = await getSessionUserId();

    switch (action) {
      case "register": {
        const res = await repo.registerUser(
          payload as { fullName: string; email: string; password: string }
        );
        if (res.ok) await setSession(res.user.id);
        return NextResponse.json(res);
      }
      case "login": {
        const res = await repo.loginUser(
          payload as { email: string; password: string }
        );
        if (res.ok) await setSession(res.user.id);
        return NextResponse.json(res);
      }
      case "logout": {
        await setSession(null);
        return NextResponse.json({ ok: true });
      }
      case "bootstrap": {
        const bootstrap = await repo.getBootstrap(sessionUserId);
        return NextResponse.json({ ok: true, ...bootstrap });
      }
      case "content": {
        const content = await repo.getContentCatalog();
        return NextResponse.json({ ok: true, content });
      }
      case "completeOnboarding": {
        if (!sessionUserId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const profile = await repo.completeOnboarding(
          sessionUserId,
          payload as {
            subjectIds: string[];
            studyGoal: import("@/lib/types").StudyGoal;
            dailyGoalMinutes: number;
          }
        );
        return NextResponse.json({ ok: true, profile });
      }
      case "completeLesson": {
        if (!sessionUserId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const session = await repo.completeLessonSession({
          userId: sessionUserId,
          lessonId: String(payload.lessonId),
          durationSeconds: Number(payload.durationSeconds),
        });
        return NextResponse.json({ ok: true, session });
      }
      case "submitQuiz": {
        if (!sessionUserId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const result = await repo.submitQuiz({
          userId: sessionUserId,
          ...(payload as Omit<Parameters<typeof repo.submitQuiz>[0], "userId">),
        });
        return NextResponse.json({ ok: true, result });
      }
      case "createChallenge": {
        if (!sessionUserId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const challenge = await repo.createChallenge({
          userId: sessionUserId,
          opponentId: String(payload.opponentId),
          opponentName: String(payload.opponentName),
          topicId: String(payload.topicId),
        });
        return NextResponse.json({ ok: true, challenge });
      }
      case "updateProfileName": {
        if (!sessionUserId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const profile = await repo.updateProfileName(
          sessionUserId,
          String(payload.fullName)
        );
        return NextResponse.json({ ok: true, profile });
      }
      case "updateSettings": {
        if (!sessionUserId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const profile = await repo.updateSettings(
          sessionUserId,
          payload.patch as Parameters<typeof repo.updateSettings>[1]
        );
        return NextResponse.json({ ok: true, profile });
      }
      case "getProfileStats": {
        const userId = String(payload.userId || sessionUserId || "");
        if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const stats = await repo.getProfileStats(userId);
        return NextResponse.json({ ok: true, stats });
      }
      case "getQuizAttempt": {
        const attempt = await repo.getQuizAttempt(String(payload.id));
        return NextResponse.json({ ok: true, attempt });
      }
      case "getChallenge": {
        const challenge = await repo.getChallenge(String(payload.id));
        return NextResponse.json({ ok: true, challenge });
      }
      case "awardProfileXp": {
        const userId = String(payload.userId || sessionUserId || "");
        if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const result = await repo.awardProfileXp(userId, Number(payload.amount));
        return NextResponse.json({ ok: true, result });
      }
      case "evaluateAchievements": {
        const userId = String(payload.userId || sessionUserId || "");
        if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        const newly = await repo.evaluateAchievementsForUser(userId);
        return NextResponse.json({ ok: true, newly });
      }
      case "notify": {
        const userId = String(payload.userId || sessionUserId || "");
        if (!userId) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
        await repo.notifyUser(
          userId,
          String(payload.message),
          payload.type as import("@/lib/types").AppNotification["type"],
          payload.meta as import("@/lib/types").AppNotification["meta"] | undefined
        );
        return NextResponse.json({ ok: true });
      }
      case "upsertBattle": {
        const battle = await repo.upsertBattle(
          payload.battle as import("@/lib/types").LiveBattle
        );
        return NextResponse.json({ ok: true, battle });
      }
      case "getBattle": {
        const battle = await repo.getBattle(String(payload.id));
        return NextResponse.json({ ok: true, battle });
      }
      case "listBattles": {
        const battles = await repo.listBattles();
        return NextResponse.json({ ok: true, battles });
      }
      case "setBattleWinStreak": {
        await repo.setBattleWinStreak(String(payload.userId), Number(payload.streak));
        return NextResponse.json({ ok: true });
      }
      case "getBattleWinStreak": {
        const streak = await repo.getBattleWinStreak(String(payload.userId));
        return NextResponse.json({ ok: true, streak });
      }
      default:
        return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error("[api/student POST]", err);
    return NextResponse.json({ ok: false, error: formatDbError(err) }, { status: 500 });
  }
}
