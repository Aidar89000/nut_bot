import { OnboardingSurvey } from "@/modules/onboarding/survey/survey-flow";
import { OnboardingPage } from "@/modules/shell/page-gates";

export default function Page() {
  return (
    <OnboardingPage step="survey">
      <OnboardingSurvey />
    </OnboardingPage>
  );
}
