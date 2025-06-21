// components/AuthWrapper.tsx
'use client';

import { useAuthContext } from "@/contexts/auth-provider";
import { PageSkeleton } from "./page-skeleton";
import { ProfileSetup } from "./auth/profile-setup";
import { HomePageClient } from "./home-page-client";

export function AuthWrapper() {
  const { user, profile, loading } = useAuthContext();

  // 1. If the entire auth process is not yet complete, show the skeleton.
  if (loading) {
    return <PageSkeleton />;
  }

  // 2. If the process is complete, and we have a user but no profile.
  if (user && !profile) {
    return <ProfileSetup userId={user.id} />;
  }

  // 3. If the process is complete and the user is logged in with a profile, or not logged in at all.
  return <HomePageClient />;
}
