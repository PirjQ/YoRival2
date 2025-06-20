'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SmackGenerator } from './smack-generator';
import { ArrowLeft, Users, Clock, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DebateData {
  id: string;
  topic: string;
  side_a_name: string;
  side_b_name: string;
  creator_id: string;
  created_at: string;
  side_a_count: number;
  side_b_count: number;
}

interface UserVoteData {
  chosen_side: 'A' | 'B';
}

interface UserSmackData {
  smack_text: string;
}

interface DebateViewProps {
  debate: {
    id: string;
    topic: string;
    side_a_name: string;
    side_b_name: string;
    creator_id: string;
    created_at: string;
  };
  onBack: () => void;
}

export function DebateView({ debate: initialDebate, onBack }: DebateViewProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [debate, setDebate] = useState<DebateData>({
    ...initialDebate,
    side_a_count: 0,
    side_b_count: 0,
  });
  const [userVote, setUserVote] = useState<UserVoteData | null>(null);
  const [userSmack, setUserSmack] = useState<UserSmackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatorUsername, setCreatorUsername] = useState('');

  useEffect(() => {
    fetchDebateData();
    
    // Subscribe to debate updates for real-time vote count changes
    const subscription = supabase
      .channel(`debate-${debate.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'debates',
          filter: `id=eq.${debate.id}`,
        },
        (payload) => {
          // Update vote counts from the real-time event
          const newData = payload.new as DebateData;
          setDebate(prev => ({
            ...prev,
            side_a_count: newData.side_a_count,
            side_b_count: newData.side_b_count,
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [debate.id, user]);

  const fetchDebateData = async () => {
    try {
      // Fetch debate with vote counts
      const { data: debateData, error: debateError } = await supabase
        .from('debates')
        .select('*')
        .eq('id', debate.id)
        .single();

      if (debateError) throw debateError;

      setDebate(debateData);

      // Fetch creator username
      const { data: creatorData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', debateData.creator_id)
        .maybeSingle();

      if (creatorData) {
        setCreatorUsername(creatorData.username);
      }

      // Fetch user's vote if authenticated
      if (user) {
        const { data: voteData } = await supabase
          .from('votes')
          .select('chosen_side')
          .eq('debate_id', debate.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserVote(voteData);

        // Fetch user's generated smack if any
        const { data: smackData } = await supabase
          .from('generated_smacks')
          .select('smack_text')
          .eq('debate_id', debate.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserSmack(smackData);
      }
    } catch (error) {
      console.error('Error fetching debate data:', error);
    }
  };

  const handleVote = async (side: 'A' | 'B') => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to sign in to vote.',
        variant: 'destructive',
      });
      return;
    }

    if (userVote) {
      toast({
        title: 'Already voted',
        description: 'You have already voted in this debate.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Verify session is still valid before voting
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const { error } = await supabase.from('votes').insert({
        debate_id: debate.id,
        user_id: session.user.id,
        chosen_side: side,
      });

      if (error) throw error;

      // Immediately update local state for instant feedback
      setUserVote({ chosen_side: side });
      
      // Optimistically update vote counts
      setDebate(prev => ({
        ...prev,
        side_a_count: side === 'A' ? prev.side_a_count + 1 : prev.side_a_count,
        side_b_count: side === 'B' ? prev.side_b_count + 1 : prev.side_b_count,
      }));

      toast({
        title: 'Vote cast!',
        description: `You voted for "${side === 'A' ? debate.side_a_name : debate.side_b_name}".`,
      });
    } catch (error: any) {
      // Handle auth errors specifically
      if (error.message?.includes('session') || error.message?.includes('JWT') || error.message?.includes('auth')) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again to vote.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      
      // Revert optimistic updates on error
      setUserVote(null);
      fetchDebateData();
    } finally {
      setLoading(false);
    }
  };

  const handleShareDebate = async () => {
    try {
      const shareUrl = `${window.location.origin}?debate=${debate.id}`;
      const shareData = {
        title: 'Join this rivalry on YoRival!',
        text: `Check out this debate: "${debate.topic}" - Vote for your side and share your take!`,
        url: shareUrl,
      };

      // Check if the browser supports the Web Share API
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: 'Link copied successfully!',
          description: 'Share this Rivalry Now',
        });
      } else {
        // Fallback to clipboard for browsers without Web Share API
        const shareText = `${shareData.text}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(shareText);
        toast({
          title: 'Link copied!',
          description: 'Debate link has been copied to your clipboard.',
        });
      }
    } catch (error) {
      // Final fallback for browsers that don't support clipboard API
      const shareUrl = `${window.location.origin}?debate=${debate.id}`;
      const shareText = `Check out this debate: "${debate.topic}" - Vote for your side and share your take!\n\n${shareUrl}`;
      
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: 'Link copied!',
        description: 'Share text has been copied to your clipboard.',
      });
    }
  };

  const handleSmackGenerated = (smackText: string) => {
    setUserSmack({ smack_text: smackText });
  };

  const totalVotes = debate.side_a_count + debate.side_b_count;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="text-slate-400 hover:text-white w-full sm:w-auto justify-start sm:justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <Button
          variant="outline"
          onClick={handleShareDebate}
          className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4"
        >
          <Share2 className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Share This Rivalry</span>
          <span className="sm:hidden">Share Rivalry</span>
        </Button>
      </div>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-200">
              <Users className="w-3 h-3 mr-1" />
              {totalVotes} votes
            </Badge>
            <div className="flex items-center text-sm text-slate-400">
              <Clock className="w-4 h-4 mr-1" />
              {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
            </div>
          </div>
          <CardTitle className="text-2xl text-white leading-tight">{debate.topic}</CardTitle>
          <p className="text-slate-400">Started by @{creatorUsername}</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Side A */}
        <Card 
          className={`border-2 transition-all duration-200 ${
            userVote?.chosen_side === 'A' 
              ? 'border-teal-500 bg-teal-950/50' 
              : userVote
                ? 'border-slate-700 bg-slate-800/50 opacity-60'
                : 'border-slate-700 bg-slate-800/50 hover:border-teal-500/50 cursor-pointer'
          } ${!user ? 'opacity-60' : ''}`}
          onClick={() => !userVote && user && handleVote('A')}
        >
          <CardHeader>
            <CardTitle className="text-teal-400 text-xl">{debate.side_a_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-white">{debate.side_a_count}</div>
              <div className="text-sm text-slate-400">
                {totalVotes > 0 ? `${Math.round((debate.side_a_count / totalVotes) * 100)}%` : '0%'}
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: totalVotes > 0 ? `${(debate.side_a_count / totalVotes) * 100}%` : '0%' }}
                />
              </div>
              {userVote?.chosen_side === 'A' && (
                <Badge className="bg-teal-600 text-white">Your choice</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side B */}
        <Card 
          className={`border-2 transition-all duration-200 ${
            userVote?.chosen_side === 'B' 
              ? 'border-orange-500 bg-orange-950/50' 
              : userVote
                ? 'border-slate-700 bg-slate-800/50 opacity-60'
                : 'border-slate-700 bg-slate-800/50 hover:border-orange-500/50 cursor-pointer'
          } ${!user ? 'opacity-60' : ''}`}
          onClick={() => !userVote && user && handleVote('B')}
        >
          <CardHeader>
            <CardTitle className="text-orange-400 text-xl">{debate.side_b_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-white">{debate.side_b_count}</div>
              <div className="text-sm text-slate-400">
                {totalVotes > 0 ? `${Math.round((debate.side_b_count / totalVotes) * 100)}%` : '0%'}
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: totalVotes > 0 ? `${(debate.side_b_count / totalVotes) * 100}%` : '0%' }}
                />
              </div>
              {userVote?.chosen_side === 'B' && (
                <Badge className="bg-orange-600 text-white">Your choice</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comeback Generator */}
      {userVote && profile && (
        <SmackGenerator
          debate={debate}
          userVote={userVote}
          userSmack={userSmack}
          username={profile.username}
          onSmackGenerated={handleSmackGenerated}
        />
      )}

      {!user && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="text-center py-8">
            <p className="text-slate-400 mb-4">Sign in to vote and generate your comeback zingers!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}