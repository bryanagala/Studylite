import {
  BATTLE_COUNTDOWN_SECONDS,
  BATTLE_QUESTION_COUNT,
  BATTLE_REVEAL_SECONDS,
  BATTLE_SECONDS_PER_QUESTION,
  BATTLE_STARTING_RATING,
  DEMO_BOT_POOL,
} from "@/lib/battle/constants";
import {
  botThinkDelayMs,
  chooseBotAnswer,
  pickBattleQuestions,
  remainingSeconds,
  scoreAnswer,
  subjectLabel,
} from "@/lib/battle/engine";
import { QUESTIONS } from "@/lib/content/seed-data";
import { DEMO_LEADERBOARD_USERS } from "@/lib/content/seed-data";
import { XP_VALUES } from "@/lib/gamification/xp";
import {
  awardProfileXp,
  evaluateAchievementsForUser,
  loadDb,
  pushNotification,
  saveDb,
  type StudyLiteDB,
} from "@/lib/store/local-db";
import * as pgApi from "@/lib/store/student-api";
import { isPostgresMode } from "@/lib/store/student-api";
import type {
  BattleHistoryItem,
  BattleInvite,
  BattlePlayerState,
  BattleStats,
  LiveBattle,
} from "@/lib/types";
import { uid } from "@/lib/utils";

function ensureBattleArrays(db: StudyLiteDB) {
  if (!db.battles) db.battles = [];
  if (!db.battleInvites) db.battleInvites = [];
  if (!db.battleWinStreaks) db.battleWinStreaks = {};
}

function nowIso() {
  return new Date().toISOString();
}

function makePlayer(
  userId: string,
  displayName: string,
  isBot: boolean
): BattlePlayerState {
  const t = nowIso();
  return {
    userId,
    displayName,
    isBot,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeouts: 0,
    rating: BATTLE_STARTING_RATING,
    joinedAt: t,
    lastSeenAt: t,
    connected: true,
  };
}

function getQuestion(battle: LiveBattle) {
  const id = battle.questionIds[battle.currentQuestionIndex];
  return QUESTIONS.find((q) => q.id === id) || null;
}

function answersForCurrent(battle: LiveBattle) {
  const qid = battle.questionIds[battle.currentQuestionIndex];
  return battle.answers.filter((a) => a.questionId === qid);
}

function playerAnswered(battle: LiveBattle, userId: string) {
  return answersForCurrent(battle).some((a) => a.userId === userId);
}

function createBattleShell(input: {
  mode: LiveBattle["mode"];
  isDemo: boolean;
  subjectId: string;
  createdBy: string;
  players: BattlePlayerState[];
}): LiveBattle {
  const questions = pickBattleQuestions(input.subjectId, BATTLE_QUESTION_COUNT);
  return {
    id: uid("battle"),
    mode: input.mode,
    isDemo: input.isDemo,
    subjectId: input.subjectId,
    subjectName: subjectLabel(input.subjectId),
    status: "waiting",
    totalQuestions: questions.length,
    questionTimeLimit: BATTLE_SECONDS_PER_QUESTION,
    questionIds: questions.map((q) => q.id),
    currentQuestionIndex: 0,
    questionStartedAt: null,
    revealUntil: null,
    countdownEndsAt: null,
    createdBy: input.createdBy,
    players: input.players,
    answers: [],
    winnerId: null,
    xpAwarded: {},
    xpClaimed: false,
    claimedUsers: [],
    createdAt: nowIso(),
    startedAt: null,
    completedAt: null,
  };
}

function beginCountdown(battle: LiveBattle) {
  battle.status = "starting";
  battle.countdownEndsAt = new Date(
    Date.now() + BATTLE_COUNTDOWN_SECONDS * 1000
  ).toISOString();
  battle.startedAt = nowIso();
}

function beginQuestion(battle: LiveBattle) {
  battle.status = "active";
  battle.questionStartedAt = nowIso();
  battle.revealUntil = null;
  battle.countdownEndsAt = null;
}

function upsertBattle(db: StudyLiteDB, battle: LiveBattle) {
  const idx = db.battles.findIndex((b) => b.id === battle.id);
  if (idx >= 0) db.battles[idx] = battle;
  else db.battles.unshift(battle);
}

const scheduledBotKeys = new Set<string>();

function scheduleBotAnswers(battle: LiveBattle) {
  if (typeof window === "undefined") return;
  const question = getQuestion(battle);
  if (!question || battle.status !== "active") return;
  const bots = battle.players.filter((p) => p.isBot);
  for (const bot of bots) {
    if (playerAnswered(battle, bot.userId)) continue;
    const key = `${battle.id}:${battle.currentQuestionIndex}:${bot.userId}`;
    if (scheduledBotKeys.has(key)) continue;
    scheduledBotKeys.add(key);
    const delay = botThinkDelayMs();
    const battleId = battle.id;
    const questionIndex = battle.currentQuestionIndex;
    const botId = bot.userId;
    window.setTimeout(() => {
      scheduledBotKeys.delete(key);
      const current = getBattle(battleId);
      if (!current) return;
      if (current.status !== "active") return;
      if (current.currentQuestionIndex !== questionIndex) return;
      if (playerAnswered(current, botId)) return;
      const q = getQuestion(current);
      if (!q) return;
      const selected = chooseBotAnswer(q);
      submitBattleAnswer(battleId, botId, selected);
    }, delay);
  }
}

export function getBattle(battleId: string): LiveBattle | null {
  const db = loadDb();
  ensureBattleArrays(db);
  return db.battles.find((b) => b.id === battleId) || null;
}

export function listPendingInvites(userId: string): BattleInvite[] {
  const db = loadDb();
  ensureBattleArrays(db);
  return db.battleInvites
    .filter((i) => i.receiverId === userId && i.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listBattleHistory(userId: string): BattleHistoryItem[] {
  const db = loadDb();
  ensureBattleArrays(db);
  return db.battles
    .filter(
      (b) =>
        b.status === "completed" && b.players.some((p) => p.userId === userId)
    )
    .map((b) => {
      const me = b.players.find((p) => p.userId === userId)!;
      const opp = b.players.find((p) => p.userId !== userId)!;
      const result =
        b.winnerId === userId ? "win" : b.winnerId == null ? "draw" : "loss";
      const accuracy = b.totalQuestions
        ? Math.round((me.correctAnswers / b.totalQuestions) * 100)
        : 0;
      return {
        battleId: b.id,
        opponentName: opp?.displayName || "Opponent",
        subjectName: b.subjectName,
        result,
        playerScore: me.score,
        opponentScore: opp?.score || 0,
        accuracy,
        xpEarned: b.xpAwarded[userId] || 0,
        completedAt: b.completedAt || b.createdAt,
        isDemo: b.isDemo,
      } satisfies BattleHistoryItem;
    })
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function getBattleStats(userId: string): BattleStats {
  const history = listBattleHistory(userId);
  const wins = history.filter((h) => h.result === "win").length;
  const losses = history.filter((h) => h.result === "loss").length;
  const draws = history.filter((h) => h.result === "draw").length;
  const total = history.length;
  const db = loadDb();
  return {
    wins,
    losses,
    draws,
    total,
    winRate: total ? Math.round((wins / total) * 100) : 0,
    currentWinStreak: db.battleWinStreaks?.[userId] || 0,
  };
}

/** Quick Match → Demo Battle vs simulated student */
export function startQuickMatch(userId: string, subjectId: string): LiveBattle {
  const db = loadDb();
  ensureBattleArrays(db);
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  const bot = DEMO_BOT_POOL[Math.floor(Math.random() * DEMO_BOT_POOL.length)];
  const battle = createBattleShell({
    mode: "quick_match",
    isDemo: true,
    subjectId,
    createdBy: userId,
    players: [
      makePlayer(userId, user.profile.fullName, false),
      makePlayer(bot.id, bot.fullName, true),
    ],
  });
  battle.status = "accepted";
  beginCountdown(battle);
  upsertBattle(db, battle);
  pushNotification(
    db,
    userId,
    `⚔️ Demo Battle starting vs ${bot.fullName}!`,
    "battle",
    { battleId: battle.id }
  );
  saveDb(db);
  return battle;
}

/** Challenge a leaderboard/demo student (auto-accepts as Demo Battle). */
export function sendBattleChallenge(input: {
  senderId: string;
  receiverId: string;
  receiverName: string;
  subjectId: string;
}): { battle: LiveBattle; invite: BattleInvite } {
  const db = loadDb();
  ensureBattleArrays(db);
  const sender = db.users.find((u) => u.id === input.senderId);
  if (!sender) throw new Error("User not found");

  const isDemoOpponent =
    input.receiverId.startsWith("demo-") ||
    input.receiverId.startsWith("bot-") ||
    !db.users.some((u) => u.id === input.receiverId);

  const battle = createBattleShell({
    mode: "challenge",
    isDemo: isDemoOpponent,
    subjectId: input.subjectId,
    createdBy: input.senderId,
    players: [
      makePlayer(input.senderId, sender.profile.fullName, false),
      makePlayer(input.receiverId, input.receiverName, isDemoOpponent),
    ],
  });

  const invite: BattleInvite = {
    id: uid("binv"),
    battleId: battle.id,
    senderId: input.senderId,
    senderName: sender.profile.fullName,
    receiverId: input.receiverId,
    receiverName: input.receiverName,
    subjectId: input.subjectId,
    subjectName: battle.subjectName,
    status: "pending",
    createdAt: nowIso(),
    respondedAt: null,
  };

  upsertBattle(db, battle);
  db.battleInvites.unshift(invite);

  // Real local users get a pending invite; demo opponents auto-accept
  if (!isDemoOpponent) {
    pushNotification(
      db,
      input.receiverId,
      `⚔️ ${sender.profile.fullName} challenged you to a ${battle.subjectName} battle.`,
      "battle",
      { battleId: battle.id, inviteId: invite.id }
    );
    saveDb(db);
    return { battle, invite };
  }

  invite.status = "accepted";
  invite.respondedAt = nowIso();
  battle.status = "accepted";
  beginCountdown(battle);
  pushNotification(
    db,
    input.senderId,
    `⚔️ ${input.receiverName} accepted! Demo Battle starting.`,
    "battle",
    { battleId: battle.id }
  );
  saveDb(db);
  return { battle, invite };
}

export function respondToInvite(
  inviteId: string,
  userId: string,
  accept: boolean
): LiveBattle | null {
  const db = loadDb();
  ensureBattleArrays(db);
  const invite = db.battleInvites.find((i) => i.id === inviteId);
  if (!invite || invite.receiverId !== userId || invite.status !== "pending") {
    return null;
  }
  const battle = db.battles.find((b) => b.id === invite.battleId);
  if (!battle) return null;

  invite.respondedAt = nowIso();
  if (!accept) {
    invite.status = "declined";
    battle.status = "cancelled";
    pushNotification(
      db,
      invite.senderId,
      `⚔️ ${invite.receiverName} declined your battle invite.`,
      "battle",
      { battleId: battle.id }
    );
    saveDb(db);
    return battle;
  }

  invite.status = "accepted";
  battle.status = "accepted";
  beginCountdown(battle);
  pushNotification(
    db,
    invite.senderId,
    `⚔️ Battle accepted! Starting now.`,
    "battle",
    { battleId: battle.id }
  );
  saveDb(db);
  return battle;
}

/** Tick battle state from synchronized timestamps (call from client interval). */
export function tickBattle(battleId: string): LiveBattle | null {
  const db = loadDb();
  ensureBattleArrays(db);
  const battle = db.battles.find((b) => b.id === battleId);
  if (!battle) return null;

  const now = Date.now();

  if (battle.status === "starting" && battle.countdownEndsAt) {
    if (now >= new Date(battle.countdownEndsAt).getTime()) {
      beginQuestion(battle);
      upsertBattle(db, battle);
      saveDb(db);
      scheduleBotAnswers(battle);
      return battle;
    }
  }

  if (battle.status === "active" && battle.questionStartedAt) {
    const left = remainingSeconds(
      battle.questionStartedAt,
      battle.questionTimeLimit,
      now
    );
    if (left <= 0) {
      resolveQuestion(db, battle);
      saveDb(db);
      return battle;
    }
    // Ensure bots are scheduled once per question
    scheduleBotAnswers(battle);
  }

  if (battle.status === "question_result" && battle.revealUntil) {
    if (now >= new Date(battle.revealUntil).getTime()) {
      advanceOrFinish(db, battle);
      saveDb(db);
      const nextStatus = battle.status as LiveBattle["status"];
      if (nextStatus === "active") {
        scheduleBotAnswers(battle);
      }
      return battle;
    }
  }

  return battle;
}

export function submitBattleAnswer(
  battleId: string,
  userId: string,
  selectedAnswer: string | null
): LiveBattle | null {
  const db = loadDb();
  ensureBattleArrays(db);
  const battle = db.battles.find((b) => b.id === battleId);
  if (!battle || battle.status !== "active") return battle || null;
  if (playerAnswered(battle, userId)) return battle;

  const question = getQuestion(battle);
  if (!question) return battle;

  const started = battle.questionStartedAt
    ? new Date(battle.questionStartedAt).getTime()
    : Date.now();
  const responseTimeMs = Math.max(0, Date.now() - started);
  const timedOut =
    remainingSeconds(battle.questionStartedAt, battle.questionTimeLimit) <= 0;
  const answer = timedOut ? null : selectedAnswer;
  const isCorrect = Boolean(answer && answer === question.correctAnswer);
  const points = scoreAnswer({
    isCorrect,
    responseTimeMs: answer == null ? null : responseTimeMs,
    timeLimitSec: battle.questionTimeLimit,
  });

  const player = battle.players.find((p) => p.userId === userId);
  if (!player) return battle;

  battle.answers.push({
    questionId: question.id,
    userId,
    selectedAnswer: answer,
    isCorrect,
    responseTimeMs: answer == null ? null : responseTimeMs,
    points,
    submittedAt: nowIso(),
  });

  player.score += points;
  player.lastSeenAt = nowIso();
  if (answer == null) player.timeouts += 1;
  else if (isCorrect) player.correctAnswers += 1;
  else player.wrongAnswers += 1;

  const allIn = battle.players.every((p) => playerAnswered(battle, p.userId));
  if (allIn) {
    resolveQuestion(db, battle);
  }

  upsertBattle(db, battle);
  saveDb(db);
  return battle;
}

function resolveQuestion(db: StudyLiteDB, battle: LiveBattle) {
  const question = getQuestion(battle);
  if (!question) return;

  // Auto timeout missing answers
  for (const player of battle.players) {
    if (playerAnswered(battle, player.userId)) continue;
    battle.answers.push({
      questionId: question.id,
      userId: player.userId,
      selectedAnswer: null,
      isCorrect: false,
      responseTimeMs: null,
      points: 0,
      submittedAt: nowIso(),
    });
    player.timeouts += 1;
  }

  battle.status = "question_result";
  battle.revealUntil = new Date(
    Date.now() + BATTLE_REVEAL_SECONDS * 1000
  ).toISOString();
  upsertBattle(db, battle);
}

function advanceOrFinish(db: StudyLiteDB, battle: LiveBattle) {
  if (battle.currentQuestionIndex >= battle.totalQuestions - 1) {
    finishBattle(db, battle);
    return;
  }
  battle.currentQuestionIndex += 1;
  beginQuestion(battle);
  upsertBattle(db, battle);
}

function finishBattle(db: StudyLiteDB, battle: LiveBattle) {
  battle.status = "completed";
  battle.completedAt = nowIso();
  battle.questionStartedAt = null;
  battle.revealUntil = null;

  const [a, b] = battle.players;
  if (a.score > b.score) battle.winnerId = a.userId;
  else if (b.score > a.score) battle.winnerId = b.userId;
  else battle.winnerId = null;

  for (const player of battle.players) {
    if (player.isBot) continue;
    let xp = XP_VALUES.battle_participation;
    if (battle.winnerId === player.userId) {
      xp += XP_VALUES.battle_win;
      db.battleWinStreaks[player.userId] =
        (db.battleWinStreaks[player.userId] || 0) + 1;
    } else if (battle.winnerId == null) {
      xp += XP_VALUES.battle_draw;
      db.battleWinStreaks[player.userId] = 0;
    } else {
      db.battleWinStreaks[player.userId] = 0;
    }
    battle.xpAwarded[player.userId] = xp;
  }

  upsertBattle(db, battle);
}

/** Award XP once per user per battle (anti-abuse). */
export function claimBattleRewards(battleId: string, userId: string) {
  const db = loadDb();
  ensureBattleArrays(db);
  const battle = db.battles.find((x) => x.id === battleId);
  if (!battle || battle.status !== "completed") {
    return null;
  }

  const claimedUsers = battle.claimedUsers || [];
  if (claimedUsers.includes(userId)) {
    return { xp: battle.xpAwarded[userId] || 0, alreadyClaimed: true as const };
  }

  let xp = battle.xpAwarded[userId];
  if (xp == null) {
    xp = XP_VALUES.battle_participation;
    if (battle.winnerId === userId) xp += XP_VALUES.battle_win;
    else if (battle.winnerId == null) xp += XP_VALUES.battle_draw;
    battle.xpAwarded[userId] = xp;
  }

  battle.claimedUsers = [...claimedUsers, userId];
  battle.xpClaimed =
    battle.claimedUsers.length >= battle.players.filter((p) => !p.isBot).length;
  upsertBattle(db, battle);
  saveDb(db);

  const title =
    battle.winnerId === userId
      ? `🏆 You won your ${battle.subjectName} battle! +${xp} XP`
      : battle.winnerId == null
        ? `🤝 Draw in ${battle.subjectName}. +${xp} XP`
        : `Good battle in ${battle.subjectName}. +${xp} XP`;

  if (isPostgresMode()) {
    void (async () => {
      await pgApi.awardProfileXp(userId, xp);
      await pgApi.evaluateAchievementsForUser(userId);
      await pgApi.notifyUser(userId, title, "battle", { battleId });
    })();
  } else {
    awardProfileXp(userId, xp);
    evaluateAchievementsForUser(userId);
    const db2 = loadDb();
    ensureBattleArrays(db2);
    pushNotification(db2, userId, title, "battle", { battleId });
    saveDb(db2);
  }

  return { xp, alreadyClaimed: false as const };
}

export function heartbeatBattle(battleId: string, userId: string) {
  const db = loadDb();
  ensureBattleArrays(db);
  const battle = db.battles.find((b) => b.id === battleId);
  if (!battle) return null;
  const player = battle.players.find((p) => p.userId === userId);
  if (player) {
    player.lastSeenAt = nowIso();
    player.connected = true;
    upsertBattle(db, battle);
    saveDb(db);
  }
  return battle;
}

export function getChallengeTargets() {
  return DEMO_LEADERBOARD_USERS.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    level: u.level,
    xpThisWeek: u.xpThisWeek,
  }));
}

export function rematchBattle(battleId: string, userId: string): LiveBattle | null {
  const prev = getBattle(battleId);
  if (!prev) return null;
  const me = prev.players.find((p) => p.userId === userId);
  const opp = prev.players.find((p) => p.userId !== userId);
  if (!me || !opp) return null;
  if (opp.isBot || prev.isDemo) {
    return startQuickMatch(userId, prev.subjectId);
  }
  const { battle } = sendBattleChallenge({
    senderId: userId,
    receiverId: opp.userId,
    receiverName: opp.displayName,
    subjectId: prev.subjectId,
  });
  return battle;
}
