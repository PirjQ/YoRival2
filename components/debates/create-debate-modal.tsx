'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreateDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDebateCreated: () => void;
}

export function CreateDebateModal({ isOpen, onClose, onDebateCreated }: CreateDebateModalProps) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [sideAName, setSideAName] = useState('');
  const [sideBName, setSideBName] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setTopic('');
    setSideAName('');
    setSideBName('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    // Simple validation
    if (!topic.trim() || !sideAName.trim() || !sideBName.trim()) {
        toast({
            title: 'All fields are required.',
            variant: 'destructive',
        });
        return;
    }

    setLoading(true);

    try {
      // The `user` object from the hook is generally fresh enough.
      // No need for an extra getSession() call here, it simplifies the logic.
      const { error } = await supabase.from('debates').insert({
        topic: topic.trim(),
        side_a_name: sideAName.trim(),
        side_b_name: sideBName.trim(),
        creator_id: user.id, // Use the user object directly
      });

      if (error) {
        // If there's a database error, throw it to be caught by the catch block
        throw error;
      }

      // --- This is the logic that was missing ---
      toast({
        title: 'Rivalry Launched!',
        description: 'Your new rivalry is now live.',
      });

      onDebateCreated(); // This will trigger a re-fetch of debates on the main page
      handleClose(); // This will reset the form and close the modal

    } catch (error: any) {
      console.error('Error creating rivalry:', error);
      toast({
        title: 'Failed to create rivalry',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      // This block runs whether the try succeeded or failed
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch a Face-Off</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="topic">The Big Question:</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={100}
              placeholder="e.g., Is a hotdog a sandwich?"
              disabled={loading}
              required
            />
          </div>
          <div>
            <Label htmlFor="side_a">Side A:</Label>
            <Input
              id="side_a"
              value={sideAName}
              onChange={(e) => setSideAName(e.target.value)}
              maxLength={35}
              placeholder="e.g., Yes, a true sandwich"
              disabled={loading}
              required
            />
          </div>
          <div>
            <Label htmlFor="side_b">Side B:</Label>
            <Input
              id="side_b"
              value={sideBName}
              onChange={(e) => setSideBName(e.target.value)}
              maxLength={35}
              placeholder="e.g., No, it's a sacred tube"
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Launching...' : 'Launch Rivalry!'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}