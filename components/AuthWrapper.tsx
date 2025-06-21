// components/AuthWrapper.tsx
'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { PageSkeleton } from "./page-skeleton";
import { ProfileSetup } from "./auth/profile-setup";
import { HomePageClient } from "./home-page-client";

export function AuthWrapper() {
  const { user, profile, loading: authLoading } = useAuthContext();

  console.log(`--- AuthWrapper RENDER --- authLoading: ${authLoading}, user: ${!!user}, profile:`, profile);

  // 1. If the initial auth check is happening.
  if (authLoading) {
    console.log("  > Wrapper DECISION: Show PageSkeleton (initial auth loading).");
    return <PageSkeleton />;
  }

  // 2. THE FIX FOR THE FLASH: If auth is done, we have a user,
  // but the profile is still `undefined` (meaning the profile fetch hasn't completed).
  if (user && profile === undefined) {
    console.log("  > Wrapper DECISION: Show PageSkeleton (waiting for profile).");
    return <PageSkeleton />;
  }

  // 3. If auth is done, we have a user, and we know for a fact their profile is `null`.
  if (user && profile === null) {
    console.log("  > Wrapper DECISION: Show ProfileSetup.");
    return <ProfileSetup userId={user.id} />;
  }

  // 4. If all checks pass, render the main client component.
  console.log("  > Wrapper DECISION: Show HomePageClient.");
  return <HomePageClient />;
}
