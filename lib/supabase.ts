import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
        };
        Insert: {
          id: string;
          username: string;
        };
        Update: {
          id?: string;
          username?: string;
        };
      };
      debates: {
        Row: {
          id: string;
          topic: string;
          side_a_name: string;
          side_b_name: string;
          creator_id: string;
          created_at: string;
          side_a_count: number;
          side_b_count: number;
        };
        Insert: {
          id?: string;
          topic: string;
          side_a_name: string;
          side_b_name: string;
          creator_id: string;
          created_at?: string;
          side_a_count?: number;
          side_b_count?: number;
        };
        Update: {
          id?: string;
          topic?: string;
          side_a_name?: string;
          side_b_name?: string;
          creator_id?: string;
          created_at?: string;
          side_a_count?: number;
          side_b_count?: number;
        };
      };
      votes: {
        Row: {
          id: string;
          debate_id: string;
          user_id: string;
          chosen_side: 'A' | 'B';
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          user_id: string;
          chosen_side: 'A' | 'B';
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          user_id?: string;
          chosen_side?: 'A' | 'B';
          created_at?: string;
        };
      };
      generated_smacks: {
        Row: {
          id: string;
          debate_id: string;
          user_id: string;
          smack_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          user_id: string;
          smack_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          user_id?: string;
          smack_text?: string;
          created_at?: string;
        };
      };
    };
  };
};