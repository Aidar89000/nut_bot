import { ReadyScreen } from "@/modules/onboarding/ready-screen";
import { OnboardingPage } from "@/modules/shell/page-gates";

export default function Page() {
  return (
    <OnboardingPage step="ready">
      <ReadyScreen />
    </OnboardingPage>
  );
}
