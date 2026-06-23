'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Language, t } from '@/lib/i18n';

interface ProgressDisplayProps {
  lang: Language;
  current: number;
  total: number;
  remaining: number;
  progress: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  isActive: boolean;
}

function formatDuration(ms: number): string {
  if (ms < 0 || !isFinite(ms)) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function ProgressDisplay({
  lang,
  current,
  total,
  remaining,
  progress,
  elapsedMs,
  estimatedRemainingMs,
  isActive,
}: ProgressDisplayProps) {
  if (!isActive && current === 0) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t(lang, 'progress')}</span>
          <span className="font-semibold">{progress}% {t(lang, 'complete')}</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground block">{t(lang, 'currentRepetition')}</span>
          <span className="text-2xl font-bold">
            {current} <span className="text-base font-normal text-muted-foreground">/ {total}</span>
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">{t(lang, 'remaining')}</span>
          <span className="text-2xl font-bold">{remaining}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">{t(lang, 'elapsed')}</span>
          <span className="font-mono">{formatDuration(elapsedMs)}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">{t(lang, 'estimatedRemaining')}</span>
          <span className="font-mono">{formatDuration(estimatedRemainingMs)}</span>
        </div>
      </div>
    </Card>
  );
}