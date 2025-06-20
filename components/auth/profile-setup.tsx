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
// FIX 1: Import the context hook
import { useAuthContext } from '@/contexts/auth-provider';

// FIX 2: The `onComplete` prop is GONE. It is no longer needed.
interface ProfileSetupProps {
  userId: string;
}

export function ProfileSetup({ userId }: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // FIX 3: Get the `refreshProfile` function from the global context
  const { refreshProfile } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      const { error } = await supabase.from('profiles').insert({ id: userId, username });
      if (error) throw error;

      toast({ title: 'Profile created!', description: 'Welcome to YoRival!' });
      
      // FIX 4: This call tells the AuthProvider to re-check the profile.
      // This will change the global status to 'authenticated_ready', and
      // HomePageClient will automatically show the main page. No reload needed.
      await refreshProfile();

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
