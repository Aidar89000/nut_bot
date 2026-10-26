"use client";

import { CycleCards, RhythmHero } from "@/modules/biorhythm/today-cards";
import { EmotionCard } from "@/modules/diary/emotion-card";
import { ReminderBanner } from "@/modules/reminders/reminders";
import { Screen } from "@/modules/shell/screen";
import { TopBar } from "@/modules/shell/top-bar";
import { PageTitle } from "@/ui/text";

export function HomeScreen() {
  return (
    <Screen className="stagger" withNav>
      <TopBar />
      <ReminderBanner />
      <PageTitle kicker="В своём ритме">
        В гармонии
        <br />
        с собой.
      </PageTitle>
      <RhythmHero />
      <CycleCards />
      <EmotionCard variant="home" />
    </Screen>
  );
}
