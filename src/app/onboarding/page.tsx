import { WelcomeScreen } from "@/modules/onboarding/welcome-screen";
import { OnboardingPage } from "@/modules/shell/page-gates";

export default function Page() {
  return (
    <OnboardingPage step="welcome">
      <WelcomeScreen />
    </OnboardingPage>
  );
}
