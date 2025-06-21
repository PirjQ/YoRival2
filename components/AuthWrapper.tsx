// components/AuthWrapper.tsx
'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { PageSkeleton } from "./page-skeleton";
import { ProfileSetup } from "./auth/profile-setup";
import { HomePageClient } from "./home-page-client";

export function AuthWrapper() {
  const { user, profile, loading: authLoading } = useAuthContext();

  console.log(`--- AuthWrapper RENDER --- authLoading: ${authLoading}, user: ${!!user}, profile:`, profile);

  // 1. If still loading (either auth or profile), show skeleton
  if (authLoading) {
    console.log("  > Wrapper DECISION: Show PageSkeleton (loading).");
    return <PageSkeleton />;
  }

  // 2. If we have a user and profile is explicitly null, they need to set up profile
  if (user && profile === null) {
    console.log("  > Wrapper DECISION: Show ProfileSetup.");
    return <ProfileSetup userId={user.id} />;
  }

  // 3. All other cases (no user, or user with profile) show main page
  console.log("  > Wrapper DECISION: Show HomePageClient.");
  return <HomePageClient />;
}