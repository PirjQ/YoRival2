// components/AuthWrapper.tsx
'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { PageSkeleton } from "./page-skeleton";
import { ProfileSetup } from "./auth/profile-setup";
import { HomePageClient } from "./home-page-client";

export function AuthWrapper() {
  const { user, profile, loading: authLoading } = useAuthContext();
  console.log("AuthWrapper RENDER. authLoading:", authLoading, "User:", !!user, "Profile:", profile);

  // 1. If the auth provider is still checking the session, show the skeleton.
  if (authLoading) {
    console.log("AuthWrapper DECISION: Show PageSkeleton (auth is loading)");
    return <PageSkeleton />;
  }

  // 2. THE FIX FOR THE FLASH: If we have a user, but the profile state is `undefined`
  // (meaning the profile fetch hasn't completed), show the skeleton.
  if (user && profile === undefined) {
    console.log("AuthWrapper DECISION: Show PageSkeleton (waiting for profile)");
    return <PageSkeleton />;
  }

  // 3. If we have a user, and we know their profile is `null`.
  if (user && profile === null) {
    // We pass a function to reload the page, which is a reliable way
    // to get the new state after profile creation.
    console.log("AuthWrapper DECISION: Show ProfileSetup");
    return <ProfileSetup userId={user.id} onComplete={() => window.location.reload()} />;
  }

  // 4. If all checks pass, render the main client component.
  console.log("AuthWrapper DECISION: Show HomePageClient");
  return <HomePageClient />;
}
