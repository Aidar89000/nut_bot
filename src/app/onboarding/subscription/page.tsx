import { SubscriptionScreen } from "@/modules/onboarding/subscription-screen";
import { OnboardingPage } from "@/modules/shell/page-gates";

export default function Page() {
  return (
    <OnboardingPage step="subscription">
      <SubscriptionScreen />
    </OnboardingPage>
  );
}
