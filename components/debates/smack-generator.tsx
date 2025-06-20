'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import { Loader2, Download, Share2 } from 'lucide-react';

interface SmackGeneratorProps {
  debate: {
    id: string;
    topic: string;
    side_a_name: string;
    side_b_name: string;
  };
  userVote: {
    chosen_side: 'A' | 'B';
  };
  userSmack: {
    smack_text: string;
  } | null;
  username: string;
  onSmackGenerated: (smackText: string) => void;
}

// Ginger emoji animation component
function GingerAnimation() {
  const [gingers, setGingers] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Create multiple ginger emojis at random positions
    const newGingers = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setGingers(newGingers);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Background overlay with opacity */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Floating ginger emojis */}
      {gingers.map((ginger) => (
        <div
          key={ginger.id}
          className="absolute text-4xl animate-bounce"
          style={{
            left: `${ginger.x}%`,
            top: `${ginger.y}%`,
            animationDelay: `${ginger.delay}s`,
            animationDuration: '1.5s',
          }}
        >
          🫚
        </div>
      ))}
      
      {/* Central loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🫚</div>
          <p className="text-white text-xl font-semibold">Generating your zinger...</p>
        </div>
      </div>
    </div>
  );
}

export function SmackGenerator({ debate, userVote, userSmack, username, onSmackGenerated }: SmackGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Handle page visibility changes to prevent stuck loading states
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && loading) {
        // If the page becomes visible and we're stuck loading, reset the state
        setTimeout(() => {
          if (loading) {
            setLoading(false);
            toast({
              title: 'Generation interrupted',
              description: 'Please try generating your zinger again.',
              variant: 'destructive',
            });
          }
        }, 2000); // Give it 2 seconds to complete naturally
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, toast]);

  // Predefined smack templates for different debate scenarios
  const generateSmackTemplates = (topic: string, userSide: string, opposingSide: string) => {
    const templates = [
      `${userSide} is the only logical choice here - ${opposingSide} supporters clearly haven't thought this through.`,
      `Anyone who thinks ${opposingSide} is right needs to check their facts about ${topic}.`,
      `${userSide} wins this debate hands down - the evidence speaks for itself.`,
      `I'm team ${userSide} because unlike ${opposingSide}, it actually makes sense.`,
      `${opposingSide}? Really? ${userSide} is obviously the superior choice.`,
      `The ${userSide} side has all the best arguments - ${opposingSide} is just wishful thinking.`,
      `${userSide} for the win! ${opposingSide} supporters are living in denial.`,
      `Facts don't lie: ${userSide} is clearly better than ${opposingSide}.`,
      `${userSide} is the smart choice - ${opposingSide} is for people who don't do their research.`,
      `Team ${userSide} because we actually understand what ${topic} is about.`,
      `${userSide} supporters know what's up - ${opposingSide} is for people who don't get it.`,
      `The ${userSide} camp has logic on their side, unlike the ${opposingSide} dreamers.`,
      `${userSide} is backed by common sense - ${opposingSide} is just noise.`,
      `Anyone with half a brain picks ${userSide} over ${opposingSide}.`,
      `${userSide} gang rise up! ${opposingSide} supporters can stay seated.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const handleGenerateSmack = async () => {
    setLoading(true);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Verify user has voted for this debate
      const { data: existingVote, error: voteError } = await supabase
        .from('votes')
        .select('*')
        .eq('debate_id', debate.id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (voteError || !existingVote) {
        throw new Error('You must vote before generating a line');
      }

      // Add a delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Prepare data for AI generation
      const userChosenSide = userVote.chosen_side === 'A' ? debate.side_a_name : debate.side_b_name;
      const opposingSide = userVote.chosen_side === 'A' ? debate.side_b_name : debate.side_a_name;
      
      // Call the Supabase Edge Function for AI generation
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-smack`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSession?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: debate.topic,
          userSide: userChosenSide,
          opposingSide: opposingSide,
          username: username,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw new Error('Failed to generate zinger from AI service');
      }

      const { zinger, source } = await response.json();
      
      if (!zinger) {
        throw new Error('No zinger received from AI service');
      }

      // Use PostgreSQL's ON CONFLICT clause for upsert
      const { error: upsertError } = await supabase
        .rpc('upsert_generated_smack', {
          p_debate_id: debate.id,
          p_user_id: session.user.id,
          p_smack_text: zinger
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        if (upsertError.message?.includes('JWT') || upsertError.message?.includes('auth')) {
          throw new Error('Your session has expired. Please sign in again.');
        }
        throw new Error('Failed to save zinger');
      }

      onSmackGenerated(zinger);

      toast({
        title: source === 'ai' ? 'Here you go' : 'Zinger generated!',
        description: 'Your zinger is ready to download and share.',
      });
    } catch (error: any) {
      console.error('Zinger generation error:', error);
      
      // Handle auth errors specifically
      if (error.message?.includes('session') || error.message?.includes('sign in')) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again to generate zingers.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Fallback to template-based generation if AI fails
      try {
        const userChosenSide = userVote.chosen_side === 'A' ? debate.side_a_name : debate.side_b_name;
        const opposingSide = userVote.chosen_side === 'A' ? debate.side_b_name : debate.side_a_name;
        const fallbackSmack = generateSmackTemplates(debate.topic, userChosenSide, opposingSide);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { error: fallbackError } = await supabase
            .rpc('upsert_generated_smack', {
              p_debate_id: debate.id,
              p_user_id: session.user.id,
              p_smack_text: fallbackSmack
            });
          
          if (!fallbackError) {
            onSmackGenerated(fallbackSmack);
            toast({
              title: 'Zinger generated!',
              description: 'Your zinger is ready (using backup generator).',
            });
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
      }
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('quote-card');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        width: 600,
        height: 400,
      });

      const link = document.createElement('a');
      link.download = `yorival-zinger-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Image downloaded!',
        description: 'Your debate zinger has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image.',
        variant: 'destructive',
      });
    }
  };

  const handleShareSmack = async () => {
    if (!userSmack) return;

    try {
      const element = document.getElementById('quote-card');
      if (!element) {
        throw new Error('Quote card element not found');
      }

      // Generate the image as a data URL
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        width: 600,
        height: 400,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create a file from the blob
      const file = new File([blob], `yorival-zinger-${Date.now()}.png`, {
        type: 'image/png',
      });

      const shareText = `"${userSmack.smack_text}" - @${username}'s take on ${debate.topic}`;
      const shareUrl = `${window.location.origin}?debate=${debate.id}`;

      // Check if the browser supports sharing files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Share the actual image file
        await navigator.share({
          title: 'My YoRival Zinger',
          text: `${shareText}\n\nJoin the rivalry: ${shareUrl}\n\n#YoRival`,
          files: [file],
        });
        
        toast({
          title: 'Zinger shared!',
          description: 'Your debate zinger image has been shared.',
        });
      } else if (navigator.share) {
        // Fallback to text sharing if file sharing is not supported
        await navigator.share({
          title: 'My YoRival Zinger',
          text: shareText,
          url: shareUrl,
        });
        
        toast({
          title: 'Zinger shared!',
          description: 'Your debate zinger has been shared.',
        });
      } else {
        // Fallback to clipboard for browsers without Web Share API
        const fullShareText = `${shareText}\n\nJoin the rivalry: ${shareUrl}\n\n#YoRival`;
        await navigator.clipboard.writeText(fullShareText);
        toast({
          title: 'Copied to clipboard!',
          description: 'Share text has been copied. Go with that argument!',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      
      // Final fallback - copy text to clipboard using legacy method
      const shareText = `"${userSmack.smack_text}" - @${username}'s take on ${debate.topic}`;
      const shareUrl = `${window.location.origin}?debate=${debate.id}`;
      const fullShareText = `${shareText}\n\nJoin the rivalry: ${shareUrl}\n\n#YoRival`;
      
      const textArea = document.createElement('textarea');
      textArea.value = fullShareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: 'Copied to clipboard!',
        description: 'Share text has been copied. Go win that argument!',
      });
    }
  };

  const userChosenSideName = userVote.chosen_side === 'A' ? debate.side_a_name : debate.side_b_name;

  return (
    <>
      {/* Show ginger animation overlay when loading */}
      {loading && <GingerAnimation />}
      
      <div className="flex justify-center">
        <Card className="border-slate-700 bg-slate-800/50 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-400">
              <span className="text-xl mr-2">⚡</span>
              Zinger Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-slate-300">
              <p>You voted for <span className="font-semibold text-white">"{userChosenSideName}"</span></p>
              <p className="text-sm text-slate-400 mt-1">
                Need a zinger? Generate your comeback line. You never know what you gonna get!
              </p>
            </div>

            {!userSmack && (
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateSmack}
                  disabled={loading}
                  className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4 h-auto font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 border border-purple-400 hover:border-purple-300"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <span className="mr-2 text-xl">⚡</span>
                  Generate Zinger!
                </Button>
              </div>
            )}

            {userSmack && (
              <div className="flex justify-center mb-4">
                <Button
                  onClick={handleGenerateSmack}
                  disabled={loading}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <span className="mr-2">⚡</span>
                  Generate New Zinger
                </Button>
              </div>
            )}

            {userSmack && (
              <div className="space-y-4">
                <div
                  id="quote-card"
                  className="bg-gradient-to-br from-purple-900 via-slate-800 to-teal-900 p-4 sm:p-8 rounded-lg border-2 border-purple-500/50 w-full max-w-[600px] h-[300px] sm:h-[400px] mx-auto flex items-center justify-center"
                >
                  <div className="text-center space-y-2 sm:space-y-4 max-w-md px-2">
                    <div className="text-xs text-slate-300 font-medium uppercase tracking-wider border-b border-slate-600 pb-1 sm:pb-2 mb-2 sm:mb-4">
                      {debate.topic}
                    </div>
                    
                    <div className="text-xs sm:text-sm text-purple-300 font-medium uppercase tracking-wide">
                      {userChosenSideName}
                    </div>
                    
                    <blockquote className="text-white text-sm sm:text-lg font-medium leading-relaxed text-center">
                      "{userSmack.smack_text}"
                    </blockquote>
                    
                    <div className="text-teal-300 text-xs sm:text-sm font-medium">
                      @{username}'s take
                    </div>
                    
                    <div className="text-xs text-slate-400 mt-3 sm:mt-6">
                      Generated on YoRival.com
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-sm text-slate-400 mb-3">
                    Share your zinger and let them know! 🔥
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-3 sm:gap-0">
                  <Button
                    onClick={handleShareSmack}
                    variant="outline"
                    className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white w-full sm:w-auto"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Your Take
                  </Button>
                  <Button
                    onClick={handleDownloadImage}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}