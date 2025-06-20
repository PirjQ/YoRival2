// components/layout/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/auth-provider'; // Correct hook
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  // FIX 1: Get `status` from the context, NOT `loading`.
  const { user, profile, status, signOut } = useAuthContext();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-white">
              Yo<span className="text-purple-400">Rival</span>
            </h1>
          </Link>

          <div className="flex items-center space-x-4">
            {/* FIX 2: This is the new, correct rendering logic based on the status state machine. */}
            {status === 'initializing' ? (
              // Show a spinner only when the auth state is truly unknown.
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : status === 'authenticated_ready' ? (
              // Show the user menu ONLY when we know they are fully authenticated with a profile.
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {profile!.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="font-medium">
                    <User className="mr-2 h-4 w-4" />
                    @{profile!.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // In all other cases ('unauthenticated' or 'authenticated_needs_profile'), show the login button.
              <Button onClick={() => setShowAuthModal(true)} variant="outline">
                Join the Rivalry
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
