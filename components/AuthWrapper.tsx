// components/AuthWrapper.tsx
'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { PageSkeleton } from "./page-skeleton";
import { ProfileSetup } from "./auth/profile-setup";
import { HomePageClient } from "./home-page-client";

export function AuthWrapper() {
  const { user, profile, loading } = useAuthContext();

  console.log(`--- AuthWrapper RENDER --- loading: ${loading}, user: ${!!user}, profile: ${!!profile}`);

  if (loading) {
    console.log("  > Wrapper DECISION: Show PageSkeleton (auth is loading)");
    return <PageSkeleton />;
  }

  if (user && !profile) {
    console.log("  > Wrapper DECISION: Show ProfileSetup");
    return <ProfileSetup userId={user.id} />;
  }

  console.log("  > Wrapper DECISION: Show HomePageClient");
  return <HomePageClient />;
}
