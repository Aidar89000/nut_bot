import { AccessScreen } from "@/modules/onboarding/access-screen";
import { OnboardingPage } from "@/modules/shell/page-gates";

export default function Page() {
  return (
    <OnboardingPage step="access">
      <AccessScreen />
    </OnboardingPage>
  );
}
