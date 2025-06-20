// components/auth/profile-setup.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
// We no longer need to import useAuthContext here.

// The onComplete prop is required again.
interface ProfileSetupProps {
  userId: string;
  onComplete: () => void;
}

export function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);

    try {
      // Check if username is taken
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingProfile) {
        toast({ title: 'Username taken', description: 'Please choose a different username.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Create profile
      const { error } = await supabase.from('profiles').insert({ id: userId, username });
      if (error) throw error;

      toast({ title: 'Profile created!', description: 'Welcome to YoRival!' });
      
      // FIX: We are no longer calling the non-existent `refreshProfile`.
      // We are going back to the reliable `onComplete` prop that tells the parent to handle it.
      onComplete();

    } catch (error: any) {
      toast({ title: 'Error creating profile', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Choose a username for your YoRival account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your public username" required className="text-center" />
              <p className="text-sm text-muted-foreground">This will be your public handle on YoRival</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !username.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
