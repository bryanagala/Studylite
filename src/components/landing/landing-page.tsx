"use client";

import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { ProblemSection, TurningPoint } from "@/components/landing/problem";
import { SolutionSection, HowItWorks } from "@/components/landing/solution";
import {
  FeatureMissionsXpStreaks,
  LiveBattleSection,
  LeaderboardPreview,
} from "@/components/landing/features";
import {
  ProgressAndTutor,
  AchievementsWall,
  StudyLoop,
} from "@/components/landing/more-sections";
import { SocialAndCompare, FinalCTA, LandingFooter } from "@/components/landing/closing";

export function LandingPage() {
  return (
    <div className="landing-root min-h-screen bg-[#070b18] text-slate-900 dark:text-slate-50">
      <LandingNavbar />
      <main>
        <LandingHero />
        <ProblemSection />
        <TurningPoint />
        <SolutionSection />
        <HowItWorks />
        <FeatureMissionsXpStreaks />
        <LiveBattleSection />
        <LeaderboardPreview />
        <ProgressAndTutor />
        <AchievementsWall />
        <StudyLoop />
        <SocialAndCompare />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
