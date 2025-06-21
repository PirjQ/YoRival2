// components/layout/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/auth-provider';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  // FIX: Get `loading` from the context, NOT `status`.
  const { user, profile, loading, signOut } = useAuthContext();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-white">Yo<span className="text-purple-400">Rival</span></h1>
          </Link>
          <div className="flex items-center space-x-4">
            {/* FIX: Use the simple `loading` check. */}
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10"><AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>@{profile.username}</DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowAuthModal(true)} variant="outline">Join the Rivalry</Button>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
