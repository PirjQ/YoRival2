import { Logo } from '@/components/ui/logo';

export function PageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <Logo size="lg" className="w-16 h-16 animate-pulse text-purple-400" />
      <p className="text-slate-400">Loading Rivalries...</p>
    </div>
  );
}