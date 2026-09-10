import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing-chrome";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    existingName = profile?.name ?? null;
  }

  const primaryHref = user ? "/dashboard" : "/onboarding";
  const primaryLabel = user ? "Go to your ceremonies" : "Begin your ceremony";

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav isAuthenticated={!!user} primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <OnboardingFlow isAuthenticated={!!user} existingName={existingName} />
    </div>
  );
}
