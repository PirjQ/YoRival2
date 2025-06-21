// components/AuthWrapper.tsx
'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { PageSkeleton } from "./page-skeleton";
import { ProfileSetup } from "./auth/profile-setup";
import { HomePageClient } from "./home-page-client";

export function AuthWrapper() {
  const { user, profile, loading: authLoading } = useAuthContext();

  // 1. If the auth provider is doing its initial, fast check for a session.
  if (authLoading) {
    return <PageSkeleton />;
  }

  // 2. THE FIX FOR THE FLASH:
  // If auth is done, AND we have a user, BUT the profile state is still `undefined`
  // (meaning the separate profile fetch hasn't completed yet), we continue to show the skeleton.
  if (user && profile === undefined) {
    return <PageSkeleton />;
  }

  // 3. If auth is done, we have a user, and we know for a fact their profile is `null`.
  // NOW it is safe to show the profile setup form.
  if (user && profile === null) {
    return <ProfileSetup userId={user.id} />;
  }

  // 4. If all checks pass, the user is either logged out or fully authenticated with a profile.
  // We can safely render the main client component.
  return <HomePageClient />;
}
