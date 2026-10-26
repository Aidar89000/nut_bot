import { AboutScreen } from "@/modules/onboarding/about-screen";
import { OnboardingPage } from "@/modules/shell/page-gates";

export default function Page() {
  return (
    <OnboardingPage step="about">
      <AboutScreen />
    </OnboardingPage>
  );
}
