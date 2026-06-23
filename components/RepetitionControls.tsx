'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language, t } from '@/lib/i18n';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface RepetitionControlsProps {
  lang: Language;
  repeatCount: number;
  onRepeatCountChange: (count: number) => void;
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestart: () => void;
  disabled: boolean;
}

export function RepetitionControls({
  lang,
  repeatCount,
  onRepeatCountChange,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRestart,
  disabled,
}: RepetitionControlsProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">
            {t(lang, 'repeatCount')}: {repeatCount} {t(lang, 'times')}
          </Label>
        </div>
        <Slider
          value={[repeatCount]}
          onValueChange={(value) => onRepeatCountChange(value[0])}
          min={1}
          max={1000}
          step={1}
          disabled={isPlaying}
          className="w-full"
        />
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={1}
            max={1000}
            value={repeatCount}
            onChange={(e) => onRepeatCountChange(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={isPlaying}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{t(lang, 'times')}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {!isPlaying ? (
          <Button onClick={onPlay} disabled={disabled} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            {t(lang, 'play')}
          </Button>
        ) : isPaused ? (
          <Button onClick={onResume} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            {t(lang, 'resume')}
          </Button>
        ) : (
          <Button onClick={onPause} size="lg" variant="secondary" className="gap-2">
            <Pause className="h-5 w-5" />
            {t(lang, 'pause')}
          </Button>
        )}
        
        <Button onClick={onStop} variant="destructive" size="lg" className="gap-2">
          <Square className="h-5 w-5" />
          {t(lang, 'stop')}
        </Button>
        
        <Button onClick={onRestart} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="h-5 w-5" />
          {t(lang, 'restart')}
        </Button>
      </div>
    </Card>
  );
}