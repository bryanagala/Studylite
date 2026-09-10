export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple_choice" | "true_false";
export type StudyGoal =
  | "prepare_exam"
  | "improve_grades"
  | "build_habit"
  | "learn_new";
export type ChallengeStatus = "pending" | "active" | "completed" | "declined";
export type TopicStrength = "needs_review" | "improving" | "strong";
export type AchievementRequirement =
  | "lessons_completed"
  | "quizzes_completed"
  | "streak_days"
  | "questions_answered"
  | "perfect_score"
  | "level_reached"
  | "battles_completed"
  | "battles_won"
  | "battle_win_streak"
  | "perfect_battle";

export type BattleStatus =
  | "waiting"
  | "accepted"
  | "starting"
  | "active"
  | "question_result"
  | "completed"
  | "cancelled"
  | "abandoned";

export type BattleInviteStatus = "pending" | "accepted" | "declined" | "expired";
export type BattleMode = "quick_match" | "challenge" | "demo";
export type BattleResult = "win" | "loss" | "draw";

export interface BattlePlayerState {
  userId: string;
  displayName: string;
  isBot: boolean;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeouts: number;
  rating: number; // reserved for future Elo (starts 1000)
  joinedAt: string;
  lastSeenAt: string;
  connected: boolean;
}

export interface BattleAnswerRecord {
  questionId: string;
  userId: string;
  selectedAnswer: string | null; // null = no answer
  isCorrect: boolean;
  responseTimeMs: number | null;
  points: number;
  submittedAt: string;
}

export interface LiveBattle {
  id: string;
  mode: BattleMode;
  isDemo: boolean;
  subjectId: string;
  subjectName: string;
  status: BattleStatus;
  totalQuestions: number;
  questionTimeLimit: number;
  questionIds: string[];
  currentQuestionIndex: number;
  questionStartedAt: string | null;
  revealUntil: string | null;
  countdownEndsAt: string | null;
  createdBy: string;
  players: BattlePlayerState[];
  answers: BattleAnswerRecord[];
  winnerId: string | null;
  xpAwarded: Record<string, number>;
  xpClaimed: boolean;
  claimedUsers: string[];
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface BattleInvite {
  id: string;
  battleId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subjectId: string;
  subjectName: string;
  status: BattleInviteStatus;
  createdAt: string;
  respondedAt: string | null;
}

export interface BattleHistoryItem {
  battleId: string;
  opponentName: string;
  subjectName: string;
  result: BattleResult;
  playerScore: number;
  opponentScore: number;
  accuracy: number;
  xpEarned: number;
  completedAt: string;
  isDemo: boolean;
}

export interface BattleStats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
  currentWinStreak: number;
}

export interface LessonSection {
  heading: string;
  body: string;
  keyConcept?: string;
  remember?: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  content: LessonSection[];
  estimatedMinutes: number;
  difficulty: Difficulty;
}

export interface Question {
  id: string;
  lessonId: string;
  topicId: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: AchievementRequirement;
  requirementValue: number;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoalMinutes: number;
  studyGoal: StudyGoal | null;
  selectedSubjectIds: string[];
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  questionId: string;
  quizAttemptId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  topicId: string;
  createdAt: string;
}

export interface DailyMission {
  id: string;
  userId: string;
  lessonId: string;
  missionDate: string;
  completed: boolean;
  xpReward: number;
  completedAt: string | null;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  lessonId: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
}

export interface Challenge {
  id: string;
  challengerId: string;
  opponentId: string;
  opponentName: string;
  topicId: string;
  lessonId: string;
  status: ChallengeStatus;
  challengerScore: number | null;
  opponentScore: number | null;
  winnerId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  type:
    | "streak"
    | "mission"
    | "leaderboard"
    | "achievement"
    | "weak_topic"
    | "battle";
  read: boolean;
  createdAt: string;
  meta?: { battleId?: string; inviteId?: string };
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  attempted: number;
  correct: number;
  accuracy: number;
  strength: TopicStrength;
}

export interface WeeklyStats {
  studySeconds: number;
  questionsAnswered: number;
  accuracy: number;
  streakDays: number;
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  xpThisWeek: number;
  level: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  profile: Profile;
}

export interface XpAwardResult {
  xpAwarded: number;
  newXp: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export type XpAction =
  | "complete_lesson"
  | "correct_answer"
  | "complete_mission"
  | "score_80"
  | "score_100"
  | "maintain_streak"
  | "complete_challenge"
  | "battle_participation"
  | "battle_win"
  | "battle_draw";
