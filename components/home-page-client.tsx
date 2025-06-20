'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-provider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { DebateCard } from '@/components/debates/debate-card';
import { DebateView } from '@/components/debates/debate-view';
import { CreateDebateModal } from '@/components/debates/create-debate-modal';
import { PageSkeleton } from '@/components/page-skeleton';
import { ProfileSetup } from '@/components/auth/profile-setup';
import { Plus, Users, Share2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/ui/logo';

type Debate = {
  id: string;
  topic: string;
  side_a_name: string;
  side_b_name: string;
  creator_id: string;
  created_at: string;
  side_a_count: number;
  side_b_count: number;
};

// This component no longer accepts `initialDebates` as a prop.
export function HomePageClient() {
  const { user, profile, loading: authLoading } = useAuthContext();
  const searchParams = useSearchParams();
  const [debates, setDebates] = useState<Debate[]>([]);
  // A new, separate loading state specifically for the debates data.
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('recent');

  const fetchAndSortDebates = useCallback(async () => {
    setDataLoading(true); // Start loading data
    const { data, error } = await supabase.from('debates').select('*').limit(50); // Fetch a good amount
    
    if (error) {
      console.error('Error fetching debates:', error);
      setDebates([]); // Set to empty array on error
    } else if (data) {
      const sortedData = [...data].sort((a, b) => {
        if (sortBy === 'votes') {
          return (b.side_a_count + b.side_b_count) - (a.side_a_count + a.side_b_count);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setDebates(sortedData);
    }
    setDataLoading(false); // Finish loading data
  }, [sortBy]);

  // This useEffect now triggers the initial data fetch and re-fetches when sort changes.
  useEffect(() => {
    fetchAndSortDebates();
  }, [fetchAndSortDebates]); // `fetchAndSortDebates` depends on `sortBy`, so this is correct.

  // Set up real-time subscription for debates
  useEffect(() => {
    const subscription = supabase
      .channel('debates-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'debates' },
        (payload) => {
          const newDebate = payload.new as Debate;
          // Just add the new debate to the top without re-sorting everything
          setDebates(prev => [newDebate, ...prev]); 
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'debates' },
        (payload) => {
          const updatedDebate = payload.new as Debate;
          setDebates(prev => prev.map(d => d.id === updatedDebate.id ? updatedDebate : d));
        }
      )
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchDebateById = async (debateId: string) => {
    const { data, error } = await supabase.from('debates').select('*').eq('id', debateId).maybeSingle();
    if (error) console.error('Error fetching debate:', error);
    if (data) setSelectedDebate(data as Debate);
  };

  // Handle URL parameter changes
  useEffect(() => {
    const debateId = searchParams.get('debate');
    if (debateId) {
      fetchDebateById(debateId);
    } else {
      setSelectedDebate(null);
    }
  }, [searchParams]);
  
  const handleDebateCreated = () => {
    fetchAndSortDebates(); // Re-fetch all debates after creating a new one
  };

  const handleDebateSelect = useCallback((debate: Debate) => {
    setSelectedDebate(debate);
    const newUrl = `${window.location.pathname}?debate=${debate.id}`;
    window.history.pushState({}, '', newUrl);
  }, []);

  const handleBackToDebates = useCallback(() => {
    setSelectedDebate(null);
    window.history.pushState({}, '', window.location.pathname);
  }, []);

  // === THIS IS THE FINAL RENDER LOGIC ===

  // 1. If the AuthProvider is still checking the session, show the full page skeleton.
  if (authLoading) {
    return <PageSkeleton />;
  }

  // 2. If auth is done loading, AND a user exists, BUT they don't have a profile yet.
  if (user && profile === undefined) {
    return <PageSkeleton />;
  }

  // 3. Now, if we have a user and we know their profile is null (or doesn't exist), show the setup form.
  if (user && profile === null) {
    return <ProfileSetup userId={user.id} />;
  }

  // 3. If a specific debate is selected, show that view.
  if (selectedDebate) {
    return <DebateView debate={selectedDebate} onBack={handleBackToDebates} />;
  }

  // 4. If none of the above are true, show the main dashboard.
  return (
    <>
      <div className="space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className="flex justify-center"><Logo size="lg" className="w-16 h-16" /></div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">Yo<span className="text-purple-400">Rival</span></h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">The ultimate arena to settle your arguments. Vote for your side. Generate the perfect zinger and win rivalries! </p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-300">
            <div className="flex items-center space-x-2"><Users className="h-5 w-5 text-teal-400" /><span>Vote & Debate</span></div>
            <div className="flex items-center space-x-2"><span className="text-lg">⚡</span><span>Generate Zingers</span></div>
            <div className="flex items-center space-x-2"><Share2 className="h-5 w-5 text-orange-400" /><span>Share Your Take</span></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Join Rivalries</h2>
            <Select value={sortBy} onValueChange={(value: 'recent' | 'votes') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="recent" className="text-white hover:bg-slate-700">Most Recent</SelectItem>
                <SelectItem value="votes" className="text-white hover:bg-slate-700">Most Votes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            {user && profile && (
              <Button 
                onClick={() => setShowCreateModal(true)} 
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Start a New Rivalry</span>
                <span className="sm:hidden">New Rivalry</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-slate-400 text-sm italic">
            Open to all kinds of silliest of arguments you can think of
          </p>
        </div>
        
        {dataLoading ? (
            <div className="text-center py-12 flex justify-center items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                <span className="text-slate-400">Loading Rivalries...</span>
            </div>
        ) : debates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {debates.map((debate) => (<DebateCard key={debate.id} debate={debate} onClick={() => handleDebateSelect(debate)} />))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Logo size="lg" className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No rivalries yet</h3>
            <p className="text-slate-500 mb-6">Be the first to start a rivalry!</p>
            {user && profile && (
              <Button 
                onClick={() => setShowCreateModal(true)} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Launch Your First Rivalry
              </Button>
            )}
          </div>
        )}
      </div>
      <CreateDebateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onDebateCreated={handleDebateCreated} />
    </>
  );
}
