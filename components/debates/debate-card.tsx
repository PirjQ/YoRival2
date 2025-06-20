'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DebateCardProps {
  debate: {
    id: string;
    topic: string;
    side_a_name: string;
    side_b_name: string;
    creator_id: string;
    created_at: string;
    side_a_count: number;
    side_b_count: number;
  };
  onClick: () => void;
}

export function DebateCard({ debate, onClick }: DebateCardProps) {
  const [creatorUsername, setCreatorUsername] = useState('');

  useEffect(() => {
    fetchCreatorUsername();
  }, [debate.creator_id]);

  const fetchCreatorUsername = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', debate.creator_id)
      .maybeSingle();

    if (data) {
      setCreatorUsername(data.username);
    }
  };

  const totalVotes = debate.side_a_count + debate.side_b_count;

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] border-slate-700 bg-slate-800/50 h-fit"
      onClick={onClick}
    >
      <CardHeader className="pb-3 p-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-purple-900/50 text-purple-200">
            {totalVotes} votes
          </Badge>
          <div className="flex items-center text-xs text-slate-400">
            <Clock className="w-4 h-4 mr-1" />
            {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
          </div>
        </div>
        <CardTitle className="text-white leading-tight text-lg">{debate.topic}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-teal-400 font-medium">{debate.side_a_name}</span>
            <span className="text-slate-400 text-xs">{debate.side_a_count} votes</span>
          </div>
          <div className="text-slate-500">VS</div>
          <div className="flex flex-col text-right">
            <span className="text-orange-400 font-medium">{debate.side_b_name}</span>
            <span className="text-slate-400 text-xs">{debate.side_b_count} votes</span>
          </div>
        </div>
        
        {/* Vote progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div className="flex h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-teal-500 transition-all duration-500"
              style={{ width: totalVotes > 0 ? `${(debate.side_a_count / totalVotes) * 100}%` : '50%' }}
            />
            <div 
              className="bg-orange-500 transition-all duration-500"
              style={{ width: totalVotes > 0 ? `${(debate.side_b_count / totalVotes) * 100}%` : '50%' }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 truncate">
          Started by @{creatorUsername}
        </div>
      </CardContent>
    </Card>
  );
}